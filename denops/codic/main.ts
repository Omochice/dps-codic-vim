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
    // throw new Error(`[dps-codic-vim] The number of texts must be 3 or less.`);
    console.error(`[dps-codic-vim] The number of texts must be 3 or less.`);
    return {};
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
    // throw new Error(`[dps-codic-vim] The response status is ${res.status}.`);
    return {};
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
  const bufExists = await denops.call("bufexists", bufname) as boolean;

  if (bufExists) {
    const bufnr = await denops.call("bufnr", `^${bufname}$`);
    ensureNumber(bufnr);
    return bufnrToWinId(denops, bufnr);
  }
  // i think its no problem to use recursive.
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

      const token = Deno.env.get("CODIC_TOKEN");
      if (token == undefined) {
        console.error("[dps-codic-vim] No token set");
        return await Promise.resolve();
      }
      let results;
      if (args.replace(/\s+/, "") === "") {
        const promptInput = await denops.call("input", "Translate ?: ");
        ensureString(promptInput);
        if (promptInput.replace(/\s+/, "") === "") {
          // if input is empty, do nothing
          return await Promise.resolve();
        } else {
          results = await codic(promptInput.split(/\s+/), token);
        }
      } else {
        results = await codic(args.split(/\s+/), token);
      }

      if (Object.keys(results).length == 0) {
        return await Promise.resolve(); //  length of query >= 4 or status code is not 200
      }
      const lines: string[] = construct(results);

      // make window
      const currentBufnr = await denops.call("bufnr", "%");
      ensureNumber(currentBufnr);
      const opener = `rightbelow pedit ${config["bufname"]}`;
      // move window
      const winId = await getExistWin(denops, config["bufname"], opener);
      await execute(
        denops,
        `
        ${winId} wincmd w
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
      const currentWinId = await bufnrToWinId(denops, currentBufnr);
      await execute(denops, `${currentWinId} wincmd w`);
      return await Promise.resolve();
    },
  };
  await denops.cmd(
    `command! -nargs=? Codic call denops#request("${denops.name}", "codicVim", [<q-args>])`,
  );
}
