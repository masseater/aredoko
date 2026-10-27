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
- ほかのツールのデータは BOOTH Library Manager のものだけを読み取り、書き換えない。

## コマンド

- コマンドは `vp` から実行し、`pnpm`・`npx` は直接使わない。`vp run <name>` は `package.json` と `vite.config.ts` のタスクで、組み込みコマンドとは別物である。
- `vp run verify` が検査をまとめて流す。pre-push フックと Stop フックも同じ verify を走らせる。
- `vp check` は oxlint-plugin-decision の判定に `.env` の `OPENROUTER_API_KEY` を使う。
- 管理アプリの画面は、`apps/desktop` で `vp run dev:app` を実行して開発版を起動し、`agent-browser connect 9222` でつないで `snapshot`・`screenshot`・`eval` で調べる。WebView2 のデバッグポートを開くのは開発版だけである。
- トレースは、`tools/telemetry` で `vp run jaeger` を実行して Jaeger を立ててから `vp run dev:app` で開発版を起動すると、管理アプリ・常駐サーバー・埋め込みのワーカーから届く。`http://127.0.0.1:16686/api/v3/traces` で検索するか、`/api/ai/mcp/` の MCP で読む。エディタ拡張の呼び出しは Unity のコンソールに出るトレース ID で引く。
- `libs/protocol` を変えたら、`tools/protocol-codegen` で `vp run codegen` を実行して C# の型を作り直す。生成物は手で書き換えない。
- テストを 1 つだけ走らせるときは、`apps/web` で `vp test run <ファイル>` を実行する。
- D1 のスキーマは `*.table.ts` に書き、`apps/web` で `vp run db:generate` を実行してマイグレーションを作る。better-auth のテーブルは `vp run auth:generate` で生成する。

## 構成

- `apps/web` は TanStack Start のアプリである。`alchemy.run.ts` が D1 と Worker を定義し、Cloudflare にデプロイする。
- API は Elysia で書く。`src/app/routes/api.$.ts` が `/api/*` を `src/app/server/api.server.ts` のルーターへ渡し、各スライスのルートは `index.server.ts` からそこへ足す。
- クライアントは `shared/api` で Eden の型から TanStack Query のクエリを作る。SSR 中は `createIsomorphicFn` がルートの `handle` を直接呼ぶ。

## 環境変数

- 環境変数は環境ごとに変わる値だけにする。変わらない値はコードか Alchemy の設定に、ツールにフラグがあればフラグにする。

## Cloudflare

- Workers Paid プランを前提にする。
- ゾーンの WAF カスタムルールと Logpush のジョブは、masseater.dev ゾーンの持ち主の masseater/masseater.dev だけが持つ。ほかのリポは `OWNED_ZONE` を入れない。
- Worker にはすべて `logpush: true` を付ける。
- Bot Fight Mode は使わない。

## ライブラリ

- ライブラリが型を提供する値は、その型のまま `Schema.decode*` に渡す。
- ライブラリが export する型・スキーマ・enum・定数を書き写さない。
- 外部 API のクライアントは手で包まず、Effect 公式のパッケージ、distilled.cloud（Cloudflare は `@distilled.cloud/cloudflare`）、公開 OpenAPI から `@effect/openapi-generator` で生成、の順に選ぶ。

## PR とマージ

- PR のレビュー、PR ごとの CI・動作検証・デプロイはしない。動作は本番で確かめる。
- マージ前に base を取り込み、手元の `vp run verify` を通してから自分でマージする。マージしてよいかは聞かない。ルールセットのバイパスや `--admin` は使わない。
- release-please のリリース PR は `verify` を手動実行して作り直す。`up-to-date` が承認待ちで取り込むものも無ければ、ユーザーに承認を頼む。

## oxlint-plugin-decision

- 有料の decider は、無料の `openrouter/respan/span-01-lite` で判定できないルールだけに使う。判定できるかは、正解の分かる違反例と違反でない例を、キャッシュを消して `OXLINT_DECISION_EXPLAIN=json` で確かめる。
- ルールが使うモデルは、ユーザーの指示なしに変えない。
- 確信できるものだけを違反にする。閾値を下げて取りこぼしを拾いにいかない。

## 計測

- 推測せず計測する。実装や修正の前に本番で事実を確かめ、その結果だけで判断する。
- 機能開発の前に、AI が自分でデバッグできる仕組み（再現手段、ログやスパン、それを読む経路）を作る。
- 時間かお金を使う処理はすべてスパンにする。Workers 以外は `OtlpTracer.layerFromConfig` で出す。計測のためだけにコマンドやプロセスを包まない。
- ワークフローの最後には `.github/scripts/ci-telemetry.sh` を動かすジョブを置く。
- Web Vitals（LCP・INP・CLS・FCP・TTFB・TBT）は、`tools/web-vitals` で `vp run measure <URL>...` を実行して測る。各 URL の読み込みと、そのページの同じオリジンのリンクを押した遷移を Lighthouse の user flow で測り、`report/` に flow.html と flow.json を書く。LCP・INP・CLS のどれかが Lighthouse の合格点（0.9）に届かなければ失敗する。
- main の verify はデプロイの後に `vars.ZAP_TARGET_URL` の本番を測り、レポートを Actions の成果物に残す。
- クラウドのセッションでは `--chrome-flags="--no-sandbox --proxy-server=$HTTPS_PROXY"` を付ける。Chrome は session-start フックが `CHROME_PATH` で渡す。

## 脆弱性

- ZAP のアラートは警告も含めすぐ直す。誤検知だけを `.github/zap/rules.tsv` に書く。
- `audit` は `vp pm audit --fix` で直す。修正版の無い勧告だけを `auditConfig.ignoreGhsas` に載せ、理由をコミットメッセージに書く。

## 公開先

- デプロイ先や外部公開しているもの（サイト、API、npm パッケージなど）があれば、その URL を README に一覧で載せる。

## スキル

- 編集の前に、リポジトリのルートで `vp exec intent list` を実行する。合う skill があれば `vp exec intent load <package>#<skill>` で読む。`intent` が無いときはインストールせず、不足を報告する。
- 複数リポで使う自作スキルは masseater/skills に置き、skills CLI で入れる。
