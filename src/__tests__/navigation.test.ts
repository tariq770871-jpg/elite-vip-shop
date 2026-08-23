import { describe, expect, it } from "vitest";
import { getPageFromPath, getProductIdFromPath, getProductUrl } from "@/lib/navigation";

describe("Navigation contract", () => {
  it("maps storefront paths to the correct page", () => {
    expect(getPageFromPath("/")).toBe("home");
    expect(getPageFromPath("/products")).toBe("products");
    expect(getPageFromPath("/product/abc-123")).toBe("product-detail");
    expect(getPageFromPath("/blog/article")).toBe("blog");
  });

  it("extracts product identifiers without changing them", () => {
    expect(getProductIdFromPath("/product/abc-123")).toBe("abc-123");
    expect(getProductIdFromPath("/products/abc-123")).toBeNull();
  });

  it("builds a stable product detail URL", () => {
    expect(getProductUrl("abc-123")).toBe("/product/abc-123");
    expect(getProductUrl(42)).toBe("/product/42");
  });
});
