import { downloadDir } from "@tauri-apps/api/path";
import { Effect } from "effect";

const downloadsFolder = (): Promise<string> => Effect.runPromise(Effect.tryPromise(downloadDir));

export { downloadsFolder };
