import { describe, expect, it } from "vitest";
import { parseHash, sectionHref } from "../../src/ui/router.ts";

describe("router", () => {
  it("round-trips section links and falls back to home", () => {
    expect(parseHash(sectionHref("natverk"))).toEqual({ page: "section", id: "natverk" });
    expect(parseHash("")).toEqual({ page: "home" });
    expect(parseHash("#/okänd")).toEqual({ page: "home" });
  });
});
