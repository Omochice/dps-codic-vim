import { start } from "https://deno.land/x/denops_std@v0.4/mod.ts";

async function fetchAPI(text: string[], TOKEN: string) {
  if (text.length >= 4) {
    throw new Error(`The number of texts must be 3 or less.`);
  }
  const BASEURL = "https://api.codic.jp/v1/engine/translate.json";
  const res = await fetch(BASEURL, {
    headers: new Headers({
      "Authorization": `Bearer ${TOKEN}`,
    }),
    body: new URLSearchParams({
      "text": text.join("\n"),
    }),
    method: "POST",
  });
  if (res.status !== 200) {
    console.log(res.status);
  }
  const json = res.json();
  const data = await json;
  return data;
}

start(async (vim) => {
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

      await vim.call(
        "setline",
        1,
        contents,
      );
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
