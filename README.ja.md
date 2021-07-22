# dps-codic-vim

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

## Example

![sampleMovie](https://i.gyazo.com/48899d7a8e6686198577246ec4f366f4.gif)
