if exists('g:loaded_dps_codic_vim') && g:loaded_dps_codic_vim
  finish
endif

let g:loaded_dps_codic_vim = v:true
command! -nargs=? Codic call dps_codic_vim#search([<q-args>])
