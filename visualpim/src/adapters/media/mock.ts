import { MediaPort, ImageVariant, UploadResult } from "../../ports/MediaPort";

export class MockMediaAdapter implements MediaPort {
  async uploadImage(fileBuffer: Buffer, filename: string, sku?: string): Promise<UploadResult> {
    const publicId = `CommerceLens/mock_${sku || "item"}_${Date.now()}`;
    return {
      publicId,
      url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      format: "jpg",
      bytes: fileBuffer.length,
    };
  }

  getVariants(publicIdOrUrl: string): ImageVariant[] {
    const baseUrl = publicIdOrUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80";

    return [
      {
        name: "original",
        label: "Original",
        transformation: "",
        url: baseUrl,
        useCase: "Comparison baseline",
      },
      {
        name: "optimized",
        label: "Optimized Web Delivery",
        transformation: "f_auto,q_auto",
        url: baseUrl,
        useCase: "Fast storefront delivery",
      },
      {
        name: "thumbnail",
        label: "Thumbnail",
        transformation: "c_fill,w_200,h_200,g_auto,f_auto,q_auto",
        url: baseUrl,
        useCase: "Catalog lists and cart previews",
      },
      {
        name: "card",
        label: "Product Card Frame",
        transformation: "c_pad,w_600,h_600,b_white,f_auto,q_auto",
        url: baseUrl,
        useCase: "Consistent white-frame storefront cards",
      },
      {
        name: "marketplace_square",
        label: "Marketplace Square",
        transformation: "c_pad,w_1000,h_1000,b_white,f_auto,q_auto",
        url: baseUrl,
        useCase: "Syndication for Amazon & Google Shopping",
      },
      {
        name: "webp",
        label: "WebP Format",
        transformation: "f_webp,q_auto",
        url: baseUrl,
        useCase: "Next-gen image format savings",
      },
    ];
  }
}
