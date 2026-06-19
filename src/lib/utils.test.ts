import { describe, expect, it } from "vitest";
import { cn, isValidEmail, listFromText, makeId, namesFromIds, overlap, slugify, unique } from "./utils";

describe("cn", () => {
  it("joins truthy class names with a space", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("filters out falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});

describe("namesFromIds", () => {
  const source = [
    { id: "1", name: "One" },
    { id: "2", name: "Two" },
  ];

  it("resolves names for matching ids", () => {
    expect(namesFromIds(["1", "2"], source)).toEqual(["One", "Two"]);
  });

  it("skips ids with no match", () => {
    expect(namesFromIds(["1", "missing"], source)).toEqual(["One"]);
  });
});

describe("overlap", () => {
  it("returns items present in both arrays", () => {
    expect(overlap(["a", "b", "c"], ["b", "c", "d"])).toEqual(["b", "c"]);
  });

  it("returns an empty array when there is no overlap", () => {
    expect(overlap(["a"], ["b"])).toEqual([]);
  });
});

describe("unique", () => {
  it("deduplicates values", () => {
    expect(unique(["a", "b", "a", "c"])).toEqual(["a", "b", "c"]);
  });

  it("removes falsy values", () => {
    expect(unique(["a", "", "b", undefined as unknown as string])).toEqual(["a", "b"]);
  });
});

describe("listFromText", () => {
  it("splits a comma-separated string and trims whitespace", () => {
    expect(listFromText("a, b ,  c")).toEqual(["a", "b", "c"]);
  });

  it("drops empty segments", () => {
    expect(listFromText("a,,b,")).toEqual(["a", "b"]);
  });

  it("returns an empty array for blank input", () => {
    expect(listFromText("")).toEqual([]);
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("MildewSense Pro")).toBe("mildewsense-pro");
  });

  it("strips leading/trailing hyphens produced by punctuation", () => {
    expect(slugify("--Hello World!--")).toBe("hello-world");
  });

  it("falls back to 'item' for empty input", () => {
    expect(slugify("")).toBe("item");
  });
});

describe("makeId", () => {
  it("prefixes the slugified label with the given prefix", () => {
    const id = makeId("sol", "My Solution");
    expect(id.startsWith("sol-my-solution-")).toBe(true);
  });
});

describe("isValidEmail", () => {
  it("accepts well-formed addresses", () => {
    expect(isValidEmail("jan@example.com")).toBe(true);
    expect(isValidEmail("  jan@example.com  ")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});
