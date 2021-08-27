# dps-codic-vim

![badge-test](https://github.com/Omochice/dps-codic-vim/workflows/deno-test/badge.svg)

[codic](https://codic.jp) のvimプラグインです。
[vim-denops](https://github.com/vim-denops/denops.vim)に依存しています。

## Installation

お使いのVimプラグインマネージャに従ってください。

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

データの取得にアクセストークンが必要なため、[codic](https://codic.jp)からアクセストークンを取得し、環境変数`$CODIC_TOKEN`として登録してください。

```bash
export CODIC_TOKEN <YOUR ACCESS TOKEN>
```

## Usage

`:Codic <翻訳したいテキスト>`を実行すると新規ウィンドウに結果が表示されます。

`:Codic`だけで実行するとコマンドラインが翻訳する文章を要求します。

テキストはスペース（全角半角問わず）区切りで最大3件まで同時に変換することができます。

### Options

CodicのAPIへリクエストをする際に指定する[いくつかの値](https://codic.jp/docs/api/engine/translate)を設定できます。

- `g:dps_codic_project_id`

    変換で使用するプロジェクト（辞書）のid。

    Default: None (デフォルトの辞書が使われます。)

    ```vim
    let g:dps_codic_project_id = 'Your project id'
    ```

- `g:dps_codic_casing`

    翻訳されたテキストに対して適用されるケーシング。

    下記のいずれかの値である必要があります。

    - `camel`

        例: `translatedText`.

    - `pascal`

        例: `TranslatedText`

    - `lower underscore`

        例: `translated_text`

    - `upper underscore`

        例: `TRANSLATED_TEXT`

    - `hyphen`

        例: `translated-text`

    Default: None (翻訳されたテキストは半角スペースで区切られます)

    ```vim
    let g:dps_codic_casing = "one of the above"
    ```

- `g:dps_codic_acronym_style`
    
    `g:dps_codic_casing`に`camel`または`pascal`を指定したときに使われる頭字語の処理方法。

    以下のいずれかである必要があります。

    - `MS naming guidelines`

    - `camel strict`

    - `literal`

    Default: None (処理はされません。)
    
    ```vim
    let g:dps_codic_acronym_style = "one of the above"
    ```


## Example

![sampleMovie](https://i.gyazo.com/48899d7a8e6686198577246ec4f366f4.gif)
