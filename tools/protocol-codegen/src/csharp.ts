import { Array, Effect, Option, Record, Schema, SchemaRepresentation, pipe } from "effect";
import { EmbeddingRpcs } from "protocol";
import { FetchingJSONSchemaStore, InputData, JSONSchemaInput, quicktype } from "quicktype-core";

import { NotAnObject } from "./not-an-object.ts";

const NAMESPACE = "Aredoko.Protocol";
const JSON_SCHEMA_DIALECT = "https://json-schema.org/draft/2020-12/schema";
const GROUPS = { EmbeddingRpcs };

const ObjectSchema = Schema.Union([
  Schema.Struct({ type: Schema.Literal("object") }),
  Schema.Struct({ $ref: Schema.String }),
]);

const isObjectSchema = Schema.is(ObjectSchema);

const encodeJson = Schema.encodeUnknownEffect(Schema.fromJsonString(Schema.Unknown));

const roots = pipe(
  Record.values(GROUPS),
  Array.flatMap(({ requests }) => Array.fromIterable(requests)),
  Array.flatMap(([tag, rpc]) => [
    { name: `${tag}Payload`, object: true, ast: rpc.payloadSchema.ast },
    { name: `${tag}Success`, object: true, ast: rpc.successSchema.ast },
    { name: `${tag}Error`, object: false, ast: rpc.errorSchema.ast },
  ]),
);

const definitions = Effect.fn("definitions")(function* definitions() {
  const asts = yield* pipe(
    roots,
    Array.map(({ ast }) => ast),
    Array.match({ onEmpty: Option.none, onNonEmpty: Option.some }),
    Effect.fromOption,
  );
  const document = SchemaRepresentation.toJsonSchemaMultiDocument(
    SchemaRepresentation.toRepresentations(asts),
  );
  const named = Array.zip(roots, document.schemas);
  yield* pipe(
    named,
    Array.findFirst(([{ object }, schema]) => object && !isObjectSchema(schema)),
    Option.match({
      onNone: () => Effect.void,
      onSome: ([{ name }]) => Effect.fail(NotAnObject.make({ root: name })),
    }),
  );
  return {
    ...document.definitions,
    ...Record.fromIterableWith(named, ([{ name }, schema]) => [name, schema]),
  };
});

const types = Effect.fn("types")(function* types() {
  const $defs = yield* definitions();
  const input = new JSONSchemaInput(new FetchingJSONSchemaStore());
  yield* pipe(
    roots,
    Effect.forEach(({ name }) =>
      encodeJson({ $schema: JSON_SCHEMA_DIALECT, $ref: `#/$defs/${name}`, $defs }).pipe(
        Effect.flatMap((schema) => Effect.promise(() => input.addSource({ name, schema }))),
      ),
    ),
  );
  const inputData = new InputData();
  inputData.addInput(input);
  const { lines } = yield* Effect.promise(() =>
    quicktype({
      inputData,
      lang: "csharp",
      rendererOptions: {
        framework: "NewtonSoft",
        namespace: NAMESPACE,
        "array-type": "array",
        features: "complete",
      },
    }),
  );
  return lines;
});

const descriptor = (tag: string): string => {
  const type = `Rpc<${tag}Payload, ${tag}Success, ${tag}Error>`;
  return `        public static readonly ${type} ${tag} = new ${type}("${tag}");`;
};

const group = (name: string, tags: readonly string[]): readonly string[] => [
  "",
  `    public static class ${name}`,
  "    {",
  ...pipe(tags, Array.map(descriptor)),
  "    }",
];

const descriptors = (): readonly string[] => {
  const groups = pipe(
    Record.toEntries(GROUPS),
    Array.flatMap(([name, { requests }]) => group(name, Array.fromIterable(requests.keys()))),
  );
  return [
    `namespace ${NAMESPACE}`,
    "{",
    "    public sealed class Rpc<TPayload, TSuccess, TError>",
    "    {",
    "        internal Rpc(string method)",
    "        {",
    "            Method = method;",
    "        }",
    "",
    "        public string Method { get; }",
    "    }",
    ...groups,
    "}",
  ];
};

const csharp = Effect.fn("csharp")(function* csharp() {
  const lines = yield* types();
  return Array.join([...lines, "", ...descriptors(), ""], "\n");
});

export { csharp };
