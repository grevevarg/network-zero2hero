import { describe, expect, it } from "vitest";
import { parseHash, sectionHref } from "../../src/ui/router.ts";

describe("router", () => {
  it("round-trips section links with and without a card number", () => {
    expect(parseHash(sectionHref("natverk"))).toEqual({ page: "section", id: "natverk" });
    expect(parseHash(sectionHref("natverk", 4))).toEqual({ page: "section", id: "natverk", card: 4 });
  });

  it("falls back to home for anything else", () => {
    expect(parseHash("")).toEqual({ page: "home" });
    expect(parseHash("#/okänd")).toEqual({ page: "home" });
    expect(parseHash("#/avsnitt/natverk/x")).toEqual({ page: "home" });
  });
});
