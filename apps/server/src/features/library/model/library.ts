import { Context, Effect, HashMap, HashSet, Layer, Option, Queue, Ref, pipe } from "effect";

import { embedImages } from "./embed-images.ts";
import { scanFolders } from "./scan-folders.ts";

const EMBEDDING_IMAGES = "画像の埋め込み";
const PENDING_REQUESTS = 1;

interface Activity {
  readonly indexing: boolean;
  readonly current: Option.Option<string>;
}

interface ProjectGuids {
  readonly projectPath: string;
  readonly guids: readonly string[];
}

type Seen = HashMap.HashMap<string, HashSet.HashSet<string>>;

const IDLE: Activity = { indexing: false, current: Option.none() };

const working = (current: string): Activity => ({ indexing: true, current: Option.some(current) });

class Library extends Context.Service<
  Library,
  {
    readonly activity: Effect.Effect<Activity>;
    readonly requestScan: Effect.Effect<void>;
    readonly remember: (project: ProjectGuids) => Effect.Effect<HashSet.HashSet<string>>;
    readonly forget: (projectPath: string) => Effect.Effect<void>;
  }
>()("server/features/library/model/library") {}

const remember =
  ({ projectPath, guids }: ProjectGuids) =>
  (
    seen: HashMap.HashMap<string, HashSet.HashSet<string>>,
  ): readonly [HashSet.HashSet<string>, Seen] => {
    const previous = pipe(
      HashMap.get(seen, projectPath),
      Option.getOrElse(() => HashSet.empty<string>()),
    );
    const all = HashSet.union(previous, HashSet.fromIterable(guids));
    return [all, HashMap.set(seen, projectPath, all)];
  };

/** @internal */
const libraryLayer = Layer.effect(
  Library,
  Effect.gen(function* makeLibrary() {
    const activity = yield* Ref.make(IDLE);
    const requests = yield* Queue.sliding<boolean>(PENDING_REQUESTS);
    const seen = yield* Ref.make<Seen>(HashMap.empty());
    const report = (current: string): Effect.Effect<void> => Ref.set(activity, working(current));
    const scan = Effect.gen(function* scan() {
      yield* scanFolders(report);
      yield* report(EMBEDDING_IMAGES);
      yield* embedImages;
    }).pipe(
      Effect.catchCause((cause) => Effect.logError("scan failed", cause)),
      Effect.ensuring(Ref.set(activity, IDLE)),
    );
    yield* Queue.take(requests).pipe(Effect.andThen(scan), Effect.forever, Effect.forkScoped);
    const requestScan = Queue.offer(requests, true).pipe(Effect.asVoid);
    yield* requestScan;
    return Library.of({
      activity: Ref.get(activity),
      requestScan,
      remember: (project) => Ref.modify(seen, remember(project)),
      forget: (projectPath) => Ref.update(seen, HashMap.remove(projectPath)),
    });
  }),
);

export { Library, libraryLayer };
