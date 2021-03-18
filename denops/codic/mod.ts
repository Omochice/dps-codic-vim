import { start } from "https://deno.land/x/denops_std@v0.2/mod.ts";

start(async (vim) => {
  vim.register({
    async codic(args: unknown): Promise<void> {
      if (typeof args !== "string") {
        throw new Error(`'opener' must be a string`);
      }
      console.log(args);
      console.log(typeof args);
      const content = "hello deno and denops world !!";
      await vim.cmd("new");
      await vim.call("setline", 1, "hello denops".split(/\r?\n/g));
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
