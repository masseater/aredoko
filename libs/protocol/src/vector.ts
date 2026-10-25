import { Schema } from "effect";

const Vector = Schema.Array(Schema.Finite);

export { Vector };
