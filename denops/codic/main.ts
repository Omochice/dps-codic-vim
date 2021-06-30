import { Denops } from "https://deno.land/x/denops_std@v1.0.0-alpha.0/mod.ts";
import { execute } from "https://deno.land/x/denops_std@v1.0.0-alpha.0/helper/mod.ts";

async function codic(texts: string[], token: string) {
  if (texts.length >= 4) {
    throw new Error(`[dps-codic-vim] The number of texts must be 3 or less.`);
  }
  const baseUrl: string = "https://api.codic.jp/v1/engine/translate.json";
  const res = await fetch(baseUrl, {
    headers: new Headers({
      Authorization: `Bearer ${token}`,
    }),
    body: new URLSearchParams({
      text: texts.join("\n"),
    }),
    method: "POST",
  });
  if (res.status !== 200) {
    console.error(`[dps-codic-vim] The response status is ${res.status}.`);
    throw new Error(`[dps-codic-vim] The response status is ${res.status}.`);
  }
  const json = res.json();
  const data = await json;
  return data;
}

function construct(r: any[]): string[] {
  const contents: string[] = [];
  for (const datum of r) {
    contents.push(`${datum["text"]} -> ${datum["translated_text"]}`);
    for (const word of datum["words"]) {
      let content = `  - ${word["text"]}: `;
      if (word["successful"]) {
        const candidates: string[] = [];
        for (const candidate of word["candidates"]) {
          candidates.push(candidate["text"]);
        }
        content += candidates.join(", ");
      } else {
        content += "null";
      }
      contents.push(content);
    }
    contents.push("");
  }
  return contents;
}

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async codicVim(args: unknown): Promise<void> {
      if (typeof args !== "string") {
        throw new Error(
          `"text" atribute of "codic" in ${denops.name} must be string`,
        );
      }
      const token = Deno.env.get("CODIC_TOKEN");
      if (token === undefined) {
        console.error("[dps-codic-vim] No token set");
        throw new Error(`No token set`);
      }
      const targets: string[] = args.split(/\s+/);
      const r = await codic(targets, token);
      const lines: string[] = construct(r);

      await denops.cmd("botright new");
      await denops.call("setline", 1, lines);
      await execute(
        denops,
        `
        setlocal bufhidden=wipe buftype=nofile
        setlocal nobackup noswapfile
        setlocal nomodified nomodifiable
        `,
      );
      return await Promise.resolve();
    },
  };
  await denops.cmd(
    `command! -nargs=? -bar Codic call denops#request("${denops.name}", "codicVim", [<q-args>])`,
  );
}
