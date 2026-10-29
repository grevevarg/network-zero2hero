import { concepts } from "./concepts.ts";
import natverk from "./sections/01-natverk/section.ts";
import lager from "./sections/02-lager/section.ts";
import kablar from "./sections/03-kablar/section.ts";
import markning from "./sections/04-markning/section.ts";

export const title = "Från noll till nätverk";
export { concepts };
export const sections = [natverk, lager, kablar, markning];
