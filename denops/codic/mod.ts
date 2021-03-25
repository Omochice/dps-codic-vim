import { start } from "https://deno.land/x/denops_std@v0.4/mod.ts";

async function fetchAPI(text: string[], TOKEN: any): Promise<any> {
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
      // const content = "hello deno and denops world !!";
      const TOKEN = await vim.eval("$CODIC_TOKEN");
      if (TOKEN === "") {
        throw new Error(`No token set`);
      }

      // console.log(`your token is ${TOKEN}`);
      const targets = args.split(/\s+/);

      const data = await fetchAPI(targets, TOKEN);

      let contents: string[] = [];
      console.log(data);
      for (let datum of data) {
        contents.push(`${datum["text"]} -> ${datum["translated_text"]} `);
        for (let word of datum["words"]) {
          let content = `  - ${word["text"]}: `;
          if (word["successful"]) {
            for (let candidate of word["candidates"]) {
              content += `${candidate["text"]}, `;
            }
          } else {
            content += "null";
          }
          contents.push(content);
        }
        contents.push("");
      }
      await vim.cmd("bo new");

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

  vim.execute(`
    command! -nargs=? -bar Codic call denops#request('${vim.name}', 'codic', [<q-args>])
  `);
});
