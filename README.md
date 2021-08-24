# dps-codic-vim

[![test](https://img.shields.io/static/v1?label=Japanese&message=here&color=blue)](./README.ja.md)

The [codic](https://codic.jp/engine) plugin of vim.

Using [vim-denops](https://github.com/vim-denops/denops.vim).

## Installation

Use your favorite Vim plugin manager.

- `vim-plug`
    ```vim
    Plug 'vim-denops/denops.vim'
    Plug 'Omochice/dps-codic-vim'
    ```

- `dein.vim`
    ```vim
    call dein#add("vim-denops/denops.vim")
    call dein#add("Omochice/dps-codic-vim")
    ```

Get an access token from codic and register it as the environment variable `$CODIC_TOKEN`.

```bash
export CODIC_TOKEN <YOUR ACCESS TOKEN>
```

## Usage

Run `:Codic <text you want to translate>` and the results will be displayed in a new window.

if run only `:Codic`, ask text from commandline.

Up to 3 texts can be converted at the same time, separated by spaces (full-width or half-width).

### Options

You can set some options. see [here](https://codic.jp/docs/api/engine/translate)(japanese).

It is used when request API.

- `g:dps_codic_project_id`

    The project id used for the translation.

    Default: None (use default dictionary)

    ```vim
    let g:dps_codic_project_id = 'Your project id'
    ```

- `g:dps_codic_casing`

    The casing of translated text.

    It must be one of the bellow.

    - `camel`

        like `translatedText`.

    - `pascal`

        like `TranslatedText`

    - `lower underscore`

        like `translated_text`

    - `upper underscore`

        like `TRANSLATED_TEXT`

    - `hyphen`

        like `translated-text`

    Default: no casing (separated with a space)

    ```vim
    let g:dps_codic_casing = "one of the above"
    ```

- `g:dps_codic_acronym_style`
    
    The processing method for acronym when specify `g:dps_codic_casing` to `camel` or `pascal`.

    It must be one of the bellow.

    - `MS naming guidelines`

    - `camel strict`

    - `literal`

    Default: None (not process)
    
    ```vim
    let g:dps_codic_acronym_style = "one of the above"
    ```

## Example

![sampleMovie](https://i.gyazo.com/48899d7a8e6686198577246ec4f366f4.gif)
