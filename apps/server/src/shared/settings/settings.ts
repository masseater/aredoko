import { Context } from "effect";
import type { Option } from "effect";

class Settings extends Context.Service<
  Settings,
  {
    readonly dataDirectory: string;
    readonly modelDirectory: Option.Option<string>;
    readonly embedderWorker: URL;
  }
>()("server/shared/settings/settings") {}

export { Settings };
