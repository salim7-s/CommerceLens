import { AIPort } from "../../ports/AIPort";
import { Product, AttributeTemplate, AISuggestionPayload, AISuggestionPayloadSchema } from "../../domain/schemas";
import { MockAIAdapter } from "./mock";

export class GeminiAIAdapter implements AIPort {
  private apiKey: string;
  private mockFallback: MockAIAdapter;

  constructor() {
    this.apiKey = process.env.AI_API_KEY || "";
    this.mockFallback = new MockAIAdapter();
  }

  async analyzeProduct(
    product: Product,
    templates: AttributeTemplate[],
    imageUrl?: string
  ): Promise<AISuggestionPayload> {
    if (!this.apiKey) {
      console.warn("⚠️ AI_API_KEY is not set. Using MockAIAdapter fallback.");
      return this.mockFallback.analyzeProduct(product, templates, imageUrl);
    }

    const templateSpecs = templates
      .map((t) => `- ${t.name} (type: ${t.type}, required: ${t.required}${t.options.length ? `, options: ${t.options.join("/")}` : ""})`)
      .join("\n");

    const systemPrompt = `You are an expert ecommerce catalog and visual PIM specialist.
Given a product's current data, image URL, and required category attribute template, enrich this product into an SEO-ready, high-converting listing.

RULES:
1. Return strictly a raw JSON object matching the schema below. No markdown fences, no explanation.
2. Never invent or hallucinate specifications without evidence in the image or existing text.
3. If an attribute cannot be determined with evidence, list it under "missingAttributes" so a human merchant can provide it.
4. "improvedTitle": Must be 15 to 70 characters, descriptive, not a generic single word.
5. "description": Must be 120 to 400 characters, marketing-oriented and factual.
6. "seoKeywords": Array of 3 to 8 search terms.
7. "altText": 10 to 125 characters, accessible description of the product image.
8. "attributes": Array of { "name": string, "value": string, "confidence": "high"|"medium"|"low", "source": "text"|"image"|"inferred" }.
9. "missingAttributes": Array of string attribute names requiring human input.`;

    const userPrompt = `Product Current State:
- SKU: ${product.sku}
- Current Name: ${product.name}
- Category: ${product.category_name || product.category_id || "Unspecified"}
- Price: $${product.price}
- Current Description: ${product.description || "None"}
- Image URL: ${imageUrl || product.image_url || "None"}
- Existing Attributes: ${JSON.stringify(product.attributes || {})}

Category Attribute Requirements:
${templateSpecs || "No specific template"}

JSON Output:`;

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error("Empty response from Gemini API");

      const parsed = JSON.parse(rawText);
      return AISuggestionPayloadSchema.parse(parsed);
    } catch (err) {
      console.error("AI Generation error, falling back to mock:", err);
      return this.mockFallback.analyzeProduct(product, templates, imageUrl);
    }
  }
}
