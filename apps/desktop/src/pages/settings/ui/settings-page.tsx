import type { ReactNode } from "react";

import { PageHeader } from "#/shared/ui/page-header";

import { AutostartSetting } from "./autostart-setting.tsx";
import { LogSetting } from "./log-setting.tsx";
import { VersionInfo } from "./version-info.tsx";

const TITLE = "設定";
const DESCRIPTION =
  "アセットと検索語はこの PC の外へ送りません。外部と通信するのは、BOOTH の商品ページの公開情報を取りに行くときだけです。";

const SettingsPage = (): ReactNode => (
  <section className="flex max-w-2xl flex-col gap-4">
    <PageHeader title={TITLE} description={DESCRIPTION} />
    <AutostartSetting />
    <LogSetting />
    <VersionInfo />
  </section>
);

export { SettingsPage };
