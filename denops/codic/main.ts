import {
  Denops,
  ensureArray,
  ensureNumber,
  ensureString,
  execute,
  fn,
  input,
  isNumber,
} from "./deps.ts";
import { codic, CodicResponce } from "./codic.ts";

const config = {
  "bufname": "codic://output",
  "filetype": "codic",
};

function construct(
  r: CodicResponce[],
): string[] {
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
  const bufExists = await fn.bufexists(denops, bufname);

  if (bufExists) {
    const bufnr = await fn.bufnr(denops, bufname);
    ensureNumber(bufnr);
    return bufnrToWinId(denops, bufnr);
  }
  // i think its no problem to use recursive.
  // because execute open
  await execute(denops, opener);
  return await getExistWin(denops, bufname, opener);
}

async function bufnrToWinId(denops: Denops, bufnr: number): Promise<number> {
  const wins = await fn.win_findbuf(denops, bufnr);
  ensureArray(wins, isNumber);
  const tabnr = await fn.tabpagenr(denops);
  ensureNumber(tabnr);
  const winIds =
    (await denops.eval(`map([${wins}], "win_id2tabwin(v:val)")`) as number[][])
      .filter((x) => x[0] == tabnr);

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
      let response;
      if (args.replace(/\s+/, "") === "") {
        const promptInput = await input(denops, {
          prompt: "[Codic]> ",
        });
        if (
          promptInput == null ||
          promptInput.replace(/\s+/, "") === ""
        ) {
          console.log("Codic is cancelled");
          return await Promise.resolve();
        } else {
          try {
            response = await codic(promptInput.split(/\s+/), token);
          } catch (error) {
            console.error(`[dps-codic-vim] ${error}`);
            return await Promise.resolve();
          }
        }
      } else {
        try {
          response = await codic(args.split(/\s+/), token);
        } catch (error) {
          console.error(`[dps-codic-vim] ${error}`);
          return await Promise.resolve();
        }
      }

      const results = construct(response);

      // make window
      const currentBufnr = await fn.bufnr(denops, "%");
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
      await fn.setline(denops, 1, results);
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
    `command! -nargs=? Codic call denops#notify("${denops.name}", "codicVim", [<q-args>])`,
  );
}
