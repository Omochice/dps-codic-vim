import { Denops } from "https://deno.land/x/denops_std@v1.0.0/mod.ts";
import { execute } from "https://deno.land/x/denops_std@v1.0.0/helper/mod.ts";
import {
  ensureArray,
  ensureNumber,
  ensureString,
  isNumber,
} from "https://deno.land/x/unknownutil@v0.1.1/mod.ts";

const config = {
  "bufname": "codic://output",
  "filetype": "codic",
};

async function codic(texts: string[], token: string) {
  if (texts.length >= 4) {
    throw new Error(`[dps-codic-vim] The number of texts must be 3 or less.`);
  }
  const baseUrl = "https://api.codic.jp/v1/engine/translate.json";
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
  return await res.json();
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

async function getExistWin(
  denops: Denops,
  bufname: string,
  opener: string,
): Promise<number> {
  let bufnr: number;
  const bufExist = await denops.call("bufexists", bufname);

  if (bufExist) {
    bufnr = await denops.call("bufnr", `^${bufname}`) as number;
    ensureNumber(bufnr);
    return bufnrToWinId(denops, bufnr);
  }
  // i think it ok to use recursive.
  // because execute open
  await execute(denops, opener);
  return await getExistWin(denops, bufname, opener);
}

async function bufnrToWinId(denops: Denops, bufnr: number): Promise<number> {
  const wins = await denops.call("win_findbuf", bufnr);
  ensureArray(wins, isNumber);
  const tabnr = await denops.call("tabpagenr");
  ensureNumber(tabnr);
  const winIds = await denops.eval(
    `filter(map([${wins}], "win_id2tabwin(v:val)"), "v:val[0] is# ${tabnr}")`,
  ) as number[][]; // [ [tabnr, winnr] ] TODO replace map(), filter() in typescrit
  ensureNumber(winIds[0][1]);
  return winIds[0][1];
}

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async codicVim(args: unknown): Promise<void> {
      ensureString(args);
      // if (typeof args !== "string") {
      //   throw new Error(
      //     `"text" attribute of "codic" in ${denops.name} must be string`,
      //   );
      // }
      const token = Deno.env.get("CODIC_TOKEN");
      if (token === undefined) {
        console.error("[dps-codic-vim] No token set");
        throw new Error(`No token set`);
      }
      const targets: string[] = args.split(/\s+/);
      const r = await codic(targets, token);
      const lines: string[] = construct(r);

      // make window
      const currentBufnr = await denops.call("bufnr", "%");
      ensureNumber(currentBufnr);
      const opener = `rightbelow pedit ${config["bufname"]}`;
      await execute(denops, opener);
      // move window
      const win = await getExistWin(denops, config["bufname"], opener);
      await execute(
        denops,
        `
        ${win} wincmd w
        setlocal modifiable
        `,
      );
      await denops.call("setline", 1, lines);
      await execute(
        denops,
        `
        setlocal bufhidden=hide buftype=nofile
        setlocal nobackup noswapfile
        setlocal nomodified nomodifiable
        `,
      );
      // return original window
      const currentWinid = await bufnrToWinId(denops, currentBufnr);
      await execute(denops, `${currentWinid} wincmd w`);
      return await Promise.resolve();
    },
  };
  await denops.cmd(
    `command! -nargs=? Codic call denops#request("${denops.name}", "codicVim", [<q-args>])`,
  );
}
