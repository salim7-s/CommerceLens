import { describe, it, expect } from "vitest";
import { validateAttributes } from "../../src/domain/attributes";
import { AttributeTemplate } from "../../src/domain/schemas";

describe("validateAttributes domain logic", () => {
  const templates: AttributeTemplate[] = [
    { id: "1", category_id: "c1", name: "price", type: "number", required: true, options: [] },
    { id: "2", category_id: "c1", name: "in_stock", type: "boolean", required: true, options: [] },
    { id: "3", category_id: "c1", name: "size", type: "select", required: true, options: ["S", "M", "L", "XL"] },
    { id: "4", category_id: "c1", name: "notes", type: "text", required: false, options: [] },
  ];

  it("passes when all required attributes are valid", () => {
    const values = {
      price: "29.99",
      in_stock: "true",
      size: "M",
    };
    const res = validateAttributes(values, templates);
    expect(res.valid).toBe(true);
    expect(res.issues.length).toBe(0);
  });

  it("fails when a required attribute is missing", () => {
    const values = {
      price: "29.99",
      in_stock: "true",
      // size missing
    };
    const res = validateAttributes(values, templates);
    expect(res.valid).toBe(false);
    expect(res.issues.some((i) => i.attribute === "size")).toBe(true);
  });

  it("fails when a number attribute is not a valid number", () => {
    const values = {
      price: "not-a-number",
      in_stock: "true",
      size: "M",
    };
    const res = validateAttributes(values, templates);
    expect(res.valid).toBe(false);
    expect(res.issues.some((i) => i.attribute === "price")).toBe(true);
  });

  it("fails when a select attribute is not one of the allowed options", () => {
    const values = {
      price: "10",
      in_stock: "true",
      size: "XXXL", // not in S, M, L, XL
    };
    const res = validateAttributes(values, templates);
    expect(res.valid).toBe(false);
    expect(res.issues.some((i) => i.attribute === "size")).toBe(true);
  });

  it("fails when a boolean attribute is invalid", () => {
    const values = {
      price: "10",
      in_stock: "maybe",
      size: "S",
    };
    const res = validateAttributes(values, templates);
    expect(res.valid).toBe(false);
    expect(res.issues.some((i) => i.attribute === "in_stock")).toBe(true);
  });
});
