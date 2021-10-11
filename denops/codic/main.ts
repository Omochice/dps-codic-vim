import { Denops, ensureString, fn, input, vars } from "./deps.ts";
import { AcronymStyle, Casing, codic } from "./codic.ts";
import { construct } from "./construction.ts";

const config = {
  "bufname": "codic://output",
  "filetype": "codic",
};

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async codicVim(args: unknown): Promise<void> {
      ensureString(args);

      const token = Deno.env.get("CODIC_TOKEN");
      const options = {
        projectId: await vars.g.get(denops, "dps_codic_project_id") as string,
        casing: await vars.g.get(denops, "dps_codic_casing") as Casing,
        acronymStyle: await vars.g.get(
          denops,
          "dps_codic_acronym_style",
        ) as AcronymStyle,
      };
      if (token == undefined) {
        console.error("[dps-codic-vim] No token is set");
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
            response = await codic(promptInput.split(/\s+/), token, options);
          } catch (error) {
            console.error(`[dps-codic-vim] ${error}`);
            return await Promise.resolve();
          }
        }
      } else {
        try {
          response = await codic(args.split(/\s+/), token, options);
        } catch (error) {
          console.error(`[dps-codic-vim] ${error}`);
          return await Promise.resolve();
        }
      }

      const results = construct(response);

      await denops.cmd(`rightbelow pedit ${config.bufname}`);
      const bufnr = await fn.bufnr(denops, config.bufname);
      await fn.setbufvar(denops, bufnr, "&buftype", "nofile");
      await fn.setbufvar(denops, bufnr, "&filetype", config.filetype);
      await fn.setbufline(denops, bufnr, 1, results);
      return await Promise.resolve();
    },
  };
}
