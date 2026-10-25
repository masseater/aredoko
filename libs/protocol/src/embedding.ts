import { Schema } from "effect";

import { Vector } from "./vector.ts";

const Embedding = Schema.Struct({ vector: Vector });

export { Embedding };
