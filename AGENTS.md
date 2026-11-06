作業を始める前に `repo-conventions` と `vite-plus` の skill を読み、従う。どちらも masseater/skills にあり、`vp install` が `.agents/skills/` に入れる。

## aredoko の開発

- 製品は UPM パッケージ `dev.masseater.aredoko` である。開発用の Unity プロジェクト `apps/unity` に埋め込んで置き、そのプロジェクトで動かして確かめる。
- 埋め込みの推論・インデックスの作成・ランキング・BOOTH の商品情報の取得は、同じ PC で常駐するサーバー `apps/server` に置き、エディタ拡張は localhost で呼ぶ。Unity の中では推論しない。サーバーは Unity を起動せずにテストできる。
- 常駐サーバーは TypeScript と Effect で書き、推論は Transformers.js（`@huggingface/transformers`）で `onnx-community/embeddinggemma-2-ONNX` を動かす。
- 管理アプリは Tauri 2 で `apps/desktop` に置き、画面は TypeScript と React で書く。Rust 側は常駐サーバーの起動と終了だけを受け持つ。
- 埋め込みのモデルは EmbeddingGemma 2 である。3D モデルは複数の向きからレンダリングした画像を埋め込む。キャプションを生成してから埋め込む方式は取らない。
- 検索の精度は、検索語と正解のアセットを組にした評価セットで測る。ランキングやモデルを変えるときは、変える前と後の結果を比べる。評価は日本語の検索語を主にする。
- 型の正本は `libs/protocol` の Effect Schema である。管理アプリと常駐サーバーは RpcGroup をそのまま共有し、エディタ拡張の C# の型は `tools/protocol-codegen` で生成する。Rust に command を足すときは tauri-specta で TypeScript の型を出す。
- インデックスは SQLite と sqlite-vec に置く。

## aredoko の制約

- エディタ拡張は、VRChat SDK の Unity 2022.3.22f1 で使える API と C# 9 だけで書く。
- 常駐サーバーは Windows 10・11 の x64 で動かす。開発とテストはクラウドの Linux でも完結させ、Windows でしか確かめられない処理を作らない。
- アセットと検索語は PC の外へ送らない。外部への通信は BOOTH の商品ページの公開 JSON の取得だけにする。
- BOOTH のログイン状態・Cookie・購入履歴は読まない。
- ほかのツールのデータは Unity Asset Store の保存先と BOOTH Library Manager のものだけを読み取り、書き換えない。
- ドロップやファイル選択で渡されたパッケージは、データフォルダの `library` に写してから索引する。元のファイルは動かさない。

## コマンド

- 管理アプリの画面は、`apps/desktop` で `vp run dev:app` を実行して開発版を起動し、`agent-browser connect 9222` でつないで `snapshot`・`screenshot`・`eval` で調べる。WebView2 のデバッグポートを開くのは開発版だけである。
- トレースは、`tools/telemetry` で `vp run jaeger` を実行して Jaeger を立ててから `vp run dev:app` で開発版を起動すると、管理アプリ・常駐サーバー・埋め込みのワーカーから届く。`http://127.0.0.1:16686/api/v3/traces` で検索するか、`/api/ai/mcp/` の MCP で読む。エディタ拡張の呼び出しは Unity のコンソールに出るトレース ID で引く。
- `libs/protocol` を変えたら、`tools/protocol-codegen` で `vp run codegen` を実行して C# の型を作り直す。生成物は手で書き換えない。
