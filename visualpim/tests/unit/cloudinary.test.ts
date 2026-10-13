import { describe, it, expect } from "vitest";
import { CloudinaryMediaAdapter } from "../../src/adapters/media/cloudinary";

describe("CloudinaryMediaAdapter URL transformations", () => {
  const adapter = new CloudinaryMediaAdapter();

  it("builds correct URL transformations for public ID", () => {
    const variants = adapter.getVariants("shoe_red_123");

    const optimized = variants.find((v) => v.name === "optimized");
    expect(optimized?.transformation).toBe("f_auto,q_auto");
    expect(optimized?.url).toContain("/upload/f_auto,q_auto/shoe_red_123");

    const thumbnail = variants.find((v) => v.name === "thumbnail");
    expect(thumbnail?.transformation).toBe("c_fill,w_200,h_200,g_auto,f_auto,q_auto");
    expect(thumbnail?.url).toContain("/upload/c_fill,w_200,h_200,g_auto,f_auto,q_auto/shoe_red_123");

    const card = variants.find((v) => v.name === "card");
    expect(card?.transformation).toBe("c_pad,w_600,h_600,b_white,f_auto,q_auto");
    expect(card?.url).toContain("/upload/c_pad,w_600,h_600,b_white,f_auto,q_auto/shoe_red_123");

    const square = variants.find((v) => v.name === "marketplace_square");
    expect(square?.transformation).toBe("c_pad,w_1000,h_1000,b_white,f_auto,q_auto");
    expect(square?.url).toContain("/upload/c_pad,w_1000,h_1000,b_white,f_auto,q_auto/shoe_red_123");

    const webp = variants.find((v) => v.name === "webp");
    expect(webp?.transformation).toBe("f_webp,q_auto");
    expect(webp?.url).toContain("/upload/f_webp,q_auto/shoe_red_123");
  });

  it("injects transformations into full Cloudinary URLs", () => {
    const fullUrl = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
    const variants = adapter.getVariants(fullUrl);

    const card = variants.find((v) => v.name === "card");
    expect(card?.url).toBe("https://res.cloudinary.com/demo/image/upload/c_pad,w_600,h_600,b_white,f_auto,q_auto/sample.jpg");
  });
});
