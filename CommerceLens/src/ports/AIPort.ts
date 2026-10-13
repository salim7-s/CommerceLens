import { Product, AttributeTemplate, AISuggestionPayload } from "../domain/schemas";

export interface AIPort {
  analyzeProduct(
    product: Product,
    templates: AttributeTemplate[],
    imageUrl?: string
  ): Promise<AISuggestionPayload>;
}
