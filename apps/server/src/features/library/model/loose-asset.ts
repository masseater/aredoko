import type { FileSystem } from "effect";
import { Effect, Option, String, pipe } from "effect";

import { kindOf } from "#entities/package";
import { blendPreview } from "#shared/blend";
import { imagePreview } from "#shared/preview";
import type { PackageEntry } from "#shared/unitypackage";

import type { AssetInput } from "./insert-assets.ts";
import type { Member } from "./loose-files.ts";

const BLEND_EXTENSION = ".blend";

interface Preview {
  readonly previews: readonly Uint8Array[];
  readonly render: boolean;
}

const NO_PREVIEW: Preview = { previews: [], render: false };

const isBlend = (pathname: string): boolean =>
  pipe(pathname, String.toLowerCase, String.endsWith(BLEND_EXTENSION));

const previewOf = ({
  pathname,
  file,
}: Member): Effect.Effect<Preview, never, FileSystem.FileSystem> => {
  const kind = kindOf(pathname);
  if (kind === "texture") {
    return imagePreview(file).pipe(
      Effect.map((png): Preview => ({ previews: [png], render: false })),
      Effect.catchCause((cause) =>
        Effect.logDebug("no image preview", file, cause).pipe(Effect.as(NO_PREVIEW)),
      ),
    );
  }
  if (kind !== "model") {
    return Effect.succeed(NO_PREVIEW);
  }
  if (!isBlend(pathname)) {
    return Effect.succeed({ previews: [], render: true });
  }
  return blendPreview(file).pipe(
    Effect.map((png): Preview => ({ previews: Option.toArray(png), render: false })),
    Effect.catchCause((cause) =>
      Effect.logDebug("no blend thumbnail", file, cause).pipe(Effect.as(NO_PREVIEW)),
    ),
  );
};

/** @internal */
const assetOf = Effect.fn("assetOf")(function* looseAsset(member: Member) {
  const { previews, render } = yield* previewOf(member);
  return {
    guid: member.pathname,
    pathname: member.pathname,
    previews,
    references: [],
    file: Option.some(member.file),
    render,
  } satisfies AssetInput;
});

const entryOf = ({ pathname }: Member): PackageEntry => ({
  guid: pathname,
  pathname,
  asset: Option.none(),
  meta: Option.none(),
  preview: Option.none(),
  references: [],
});

export { assetOf, entryOf };
