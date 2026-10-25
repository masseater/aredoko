import { open } from "@tauri-apps/plugin-dialog";
import { Effect, Option } from "effect";

const TITLE = "unitypackage を置いているフォルダ";

const pickFolder = (): Promise<Option.Option<string>> =>
  Effect.runPromise(
    Effect.promise(() => open({ directory: true, multiple: false, title: TITLE })).pipe(
      Effect.map(Option.fromNullOr),
    ),
  );

export { pickFolder };
