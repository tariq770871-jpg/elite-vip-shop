import { describe, expect, it } from "vitest";
import { formatCurrency, formatNumber, normalizeLocale } from "@/lib/intl";

describe("intl helpers", () => {
  it("normalizes Arabic and English locale families", () => {
    expect(normalizeLocale("ar-YE")).toBe("ar-YE");
    expect(normalizeLocale("en-GB")).toBe("en-US");
    expect(normalizeLocale()).toBe("ar-YE");
  });

  it("formats storefront numbers using the requested locale", () => {
    expect(formatNumber(2500, "en")).toBe("2,500");
    expect(formatNumber(2500, "ar-YE")).toContain("٢٬٥٠٠");
  });

  it("formats YER currency and rejects invalid values", () => {
    expect(formatCurrency(2500, "en")).toContain("2,500");
    expect(formatCurrency("not-a-number", "en")).toBe("—");
  });
});
