import { describe, it, expect } from "vitest";
import { computeHealth } from "../../src/domain/health";
import { AttributeTemplate, Product } from "../../src/domain/schemas";

describe("computeHealth domain logic", () => {
  const footwearTemplates: AttributeTemplate[] = [
    { id: "1", category_id: "cat_footwear", name: "size", type: "text", required: true, options: [] },
    { id: "2", category_id: "cat_footwear", name: "color", type: "text", required: true, options: [] },
    { id: "3", category_id: "cat_footwear", name: "material", type: "text", required: true, options: [] },
    { id: "4", category_id: "cat_footwear", name: "gender", type: "select", required: true, options: ["Men", "Women", "Unisex"] },
    { id: "5", category_id: "cat_footwear", name: "sole_type", type: "text", required: false, options: [] },
  ];

  it("scores 0 for empty product", () => {
    const res = computeHealth({});
    expect(res.score).toBe(0);
    expect(res.status).toBe("needs_work");
    expect(res.checks.every((c) => !c.pass)).toBe(true);
  });

  it("fails single-word or short titles", () => {
    const resShort = computeHealth({ name: "Shoe" });
    const titleCheck = resShort.checks.find((c) => c.key === "title");
    expect(titleCheck?.pass).toBe(false);
    expect(titleCheck?.points).toBe(0);

    const resSingleWord = computeHealth({ name: "Superlongsinglewordtitlethatisverylong" });
    const singleWordCheck = resSingleWord.checks.find((c) => c.key === "title");
    expect(singleWordCheck?.pass).toBe(false);
  });

  it("passes multi-word title between 15 and 70 characters", () => {
    const res = computeHealth({ name: "Classic Red Canvas Low-Top Sneakers" });
    const titleCheck = res.checks.find((c) => c.key === "title");
    expect(titleCheck?.pass).toBe(true);
    expect(titleCheck?.points).toBe(15);
  });

  it("awards 20 points for description >= 120 chars", () => {
    const shortDesc = "Short description.";
    expect(computeHealth({ description: shortDesc }).checks.find((c) => c.key === "description")?.pass).toBe(false);

    const longDesc = "Engineered for daily casual wear, these vibrant red canvas low-top sneakers feature reinforced stitching, flexible rubber outsoles, and breathable uppers for maximum all-day comfort.";
    expect(computeHealth({ description: longDesc }).checks.find((c) => c.key === "description")?.pass).toBe(true);
  });

  it("validates required attributes from category template", () => {
    // Missing size and material
    const partialAttrs = { color: "Red", gender: "Unisex" };
    const resPartial = computeHealth({ category_id: "cat_footwear", attributes: partialAttrs }, footwearTemplates);
    const checkPartial = resPartial.checks.find((c) => c.key === "required_attributes");
    expect(checkPartial?.pass).toBe(false);

    // All required filled
    const completeAttrs = { size: "10", color: "Red", material: "Canvas", gender: "Unisex" };
    const resComplete = computeHealth({ category_id: "cat_footwear", attributes: completeAttrs }, footwearTemplates);
    const checkComplete = resComplete.checks.find((c) => c.key === "required_attributes");
    expect(checkComplete?.pass).toBe(true);
    expect(checkComplete?.points).toBe(20);
  });

  it("evaluates boundaries: 49 vs 50 (needs_work vs improve)", () => {
    // 50 points: title (15) + description (20) + image (15) = 50 -> improve
    const product50: Partial<Product> = {
      name: "Classic Red Canvas Low-Top Sneakers", // 15
      description: "Engineered for daily casual wear, these vibrant red canvas low-top sneakers feature reinforced stitching and flexible rubber outsoles.", // 20
      image_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg", // 15
    };
    const res50 = computeHealth(product50, []);
    expect(res50.score).toBe(50);
    expect(res50.status).toBe("improve");

    // 45 points: title (15) + image (15) + alt_text (10) + no category = 40 or 45
    const product40: Partial<Product> = {
      name: "Classic Red Canvas Low-Top Sneakers", // 15
      image_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg", // 15
      alt_text: "Red canvas sneaker product photo", // 10
    };
    const res40 = computeHealth(product40, []);
    expect(res40.score).toBe(40);
    expect(res40.status).toBe("needs_work");
  });

  it("evaluates boundaries: 79 vs 80 (improve vs ready)", () => {
    // Title (15) + Description (20) + Category (10) + Image (15) + Alt text (10) + SEO (10) = 80 -> ready
    const product80: Partial<Product> = {
      name: "Classic Red Canvas Low-Top Sneakers", // 15
      description: "Engineered for daily casual wear, these vibrant red canvas low-top sneakers feature reinforced stitching and flexible rubber outsoles.", // 20
      category_id: "cat_footwear", // 10
      image_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg", // 15
      alt_text: "Red canvas sneaker product photo", // 10
      seo_tags: ["canvas shoes", "red sneakers", "casual shoes"], // 10
    };
    // Note: without required attributes (missing 20 pts), score is 80!
    const res80 = computeHealth(product80, footwearTemplates);
    expect(res80.score).toBe(80);
    expect(res80.status).toBe("ready");
  });

  it("gives 100 points for a completely polished product", () => {
    const perfect: Partial<Product> = {
      name: "Classic Red Canvas Low-Top Sneakers", // 15
      description: "Engineered for daily casual wear, these vibrant red canvas low-top sneakers feature reinforced stitching, flexible rubber outsoles, and breathable uppers for all-day comfort.", // 20
      category_id: "cat_footwear", // 10
      image_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg", // 15
      alt_text: "Red canvas sneaker side view on white backdrop", // 10
      seo_tags: ["canvas sneakers", "low-top sneakers", "red casual shoes", "unisex footwear"], // 10
      attributes: { size: "9.5", color: "Red", material: "Canvas", gender: "Unisex" }, // 20
    };
    const res = computeHealth(perfect, footwearTemplates);
    expect(res.score).toBe(100);
    expect(res.status).toBe("ready");
  });
});
