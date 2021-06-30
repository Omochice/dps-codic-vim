import { Denops } from "https://deno.land/x/denops_std@v1.0.0-alpha.0/mod.ts";

async function fetchAPI(text: string[], token: string) {
  if (text.length >= 4) {
    throw new Error(`[dps-codic-vim] The number of texts must be 3 or less.`);
  }
  const baseUrl = "https://api.codic.jp/v1/engine/translate.json";
  const res = await fetch(baseUrl, {
    headers: new Headers({
      Authorization: `Bearer ${token}`,
    }),
    body: new URLSearchParams({
      text: text.join("\n"),
    }),
    method: "POST",
  });
  if (res.status !== 200) {
    throw new Error(`[dps-codic-vim] The response status is ${res.status}.`);
  }
  const json = res.json();
  const data = await json;
  return data;
}

main(async ({ vim }) => {
  vim.register({
    async codic(args: unknown): Promise<void> {
      if (typeof args !== "string") {
        throw new Error(`'args' must be a string`);
      }
      const TOKEN = Deno.env.get("CODIC_TOKEN");
      // console.log(`your token is ${TOKEN}`);
      if (TOKEN === undefined) {
        console.error("No token set");
        throw new Error(`No token set`);
      }

      const targets = args.split(/\s+/);

      const data = await fetchAPI(targets, TOKEN);

      const contents: string[] = [];
      for (const datum of data) {
        contents.push(`${datum["text"]} -> ${datum["translated_text"]} `);
        for (const word of datum["words"]) {
          let content = `  - ${word["text"]}: `;
          if (word["successful"]) {
            for (const candidate of word["candidates"]) {
              content += `${candidate["text"]}, `;
            }
          } else {
            content += "null";
          }
          contents.push(content);
        }
        contents.push("");
      }
      await vim.cmd("botright new");

      await vim.call("setline", 1, contents);
      await vim.execute(`
        setlocal bufhidden=wipe buftype=nofile
        setlocal nobackup noswapfile
        setlocal nomodified nomodifiable
      `);
    },
  });

  await vim.execute(`
    command! -nargs=? -bar Codic call denops#request('${vim.name}', 'codic', [<q-args>])
  `);
});
