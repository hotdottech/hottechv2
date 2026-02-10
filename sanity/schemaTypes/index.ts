import { type SchemaTypeDefinition } from "sanity";
import { blockContent } from "./blockContent";
import { category } from "./category";
import { author } from "./author";
import { post } from "./post";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blockContent, category, author, post],
};
