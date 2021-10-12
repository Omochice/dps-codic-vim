function! dps_codic_vim#search(args) abort
  call denops#plugin#wait('codic')
  call denops#notify('codic', 'codicVim', a:args)
endfunction
