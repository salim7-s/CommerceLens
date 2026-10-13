import { AIPort } from "../../ports/AIPort";
import { Product, AttributeTemplate, AISuggestionPayload } from "../../domain/schemas";

export class MockAIAdapter implements AIPort {
  async analyzeProduct(
    product: Product,
    templates: AttributeTemplate[],
    _imageUrl?: string
  ): Promise<AISuggestionPayload> {
    void _imageUrl;
    void templates;
    const isFootwear = product.category_id?.includes("footwear") || product.name.toLowerCase().includes("shoe");

    if (isFootwear) {
      return {
        improvedTitle: "Classic Red Canvas Low-Top Sneakers",
        description:
          "Engineered for daily casual wear, these vibrant red canvas low-top sneakers feature reinforced stitching, flexible vulcanized rubber outsoles, and breathable uppers for maximum all-day comfort.",
        seoKeywords: ["red sneakers", "canvas low top", "casual red footwear", "unisex canvas shoes"],
        altText: "Vibrant red canvas low-top sneaker on clean white backdrop",
        attributes: [
          { name: "color", value: "Red", confidence: "high", source: "image" },
          { name: "material", value: "Canvas", confidence: "high", source: "image" },
          { name: "gender", value: "Unisex", confidence: "medium", source: "inferred" },
          { name: "sole_type", value: "Rubber", confidence: "high", source: "image" },
        ],
        missingAttributes: ["size"],
      };
    }

    // Default general template suggestion
    const categoryName = product.category_name || "General";
    return {
      improvedTitle: `Premium ${product.name.trim()} Edition`,
      description: `Upgrade your collection with the all-new ${product.name.trim()}. Built with premium-grade construction and modern ergonomic design for optimal durability and style.`,
      seoKeywords: [product.name.toLowerCase(), `${categoryName.toLowerCase()} product`, "online shopping", "premium edition"],
      altText: `High resolution specimen view of ${product.name}`,
      attributes: templates.slice(0, 3).map((t) => ({
        name: t.name,
        value: t.type === "select" && t.options[0] ? t.options[0] : "Standard",
        confidence: "medium" as const,
        source: "inferred" as const,
      })),
      missingAttributes: templates.filter((t) => t.required).slice(3).map((t) => t.name),
    };
  }
}
