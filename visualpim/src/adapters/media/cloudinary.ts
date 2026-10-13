import { v2 as cloudinary } from "cloudinary";
import { MediaPort, ImageVariant, UploadResult } from "../../ports/MediaPort";
import fs from "fs";
import path from "path";

const SAMPLE_IMAGE_MAP: Record<string, string> = {
  nike_air_max_impact: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
  patagonia_arbor_20l: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80",
  sony_wh1000xm5: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
  vans_old_skool: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80",
};

export class CloudinaryMediaAdapter implements MediaPort {
  private cloudName: string;
  private hasRealCredentials: boolean;

  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME || "demo";
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Check if real non-dummy credentials are provided
    this.hasRealCredentials = Boolean(
      apiKey &&
      apiSecret &&
      this.cloudName !== "demo_cloud" &&
      this.cloudName !== "demo" &&
      apiKey.length > 5
    );

    if (this.hasRealCredentials) {
      cloudinary.config({
        cloud_name: this.cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
    }
  }

  async uploadImage(fileBuffer: Buffer, filename: string, sku?: string): Promise<UploadResult> {
    const folder = "CommerceLens";
    const tags = ["pim", ...(sku ? [sku] : [])];

    // 1. If valid live Cloudinary credentials exist, upload to Cloudinary CDN
    if (this.hasRealCredentials) {
      try {
        const result = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder,
              tags,
              resource_type: "image",
            },
            (error, res) => {
              if (error || !res) return reject(error || new Error("Cloudinary upload failed"));
              resolve(res);
            }
          );
          uploadStream.end(fileBuffer);
        });

        return {
          publicId: result.public_id,
          url: result.secure_url,
          format: result.format,
          bytes: result.bytes,
        };
      } catch (cloudErr) {
        console.warn("Cloudinary live upload failed, gracefully falling back to local storage:", cloudErr);
      }
    }

    // 2. Reliable Local Storage Fallback (never fails, supports webcam & local uploads)
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const cleanBase = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueName = `${Date.now()}_${cleanBase}`;
      const destPath = path.join(uploadsDir, uniqueName);

      fs.writeFileSync(destPath, fileBuffer);

      return {
        publicId: uniqueName,
        url: `/uploads/${uniqueName}`,
        format: path.extname(filename).replace(".", "") || "jpeg",
        bytes: fileBuffer.length,
      };
    } catch (localErr) {
      console.error("Local storage fallback failed:", localErr);
      // Final base64 data URI fallback so the client never crashes
      const base64 = `data:image/jpeg;base64,${fileBuffer.toString("base64")}`;
      return {
        publicId: `data_${Date.now()}`,
        url: base64,
        format: "jpeg",
        bytes: fileBuffer.length,
      };
    }
  }

  getVariants(publicIdOrUrl: string): ImageVariant[] {
    const transformations = [
      {
        name: "original",
        label: "Original",
        transformation: "",
        useCase: "Comparison baseline",
      },
      {
        name: "optimized",
        label: "Optimized Web Delivery",
        transformation: "f_auto,q_auto",
        useCase: "Fast storefront delivery",
      },
      {
        name: "thumbnail",
        label: "Thumbnail",
        transformation: "c_fill,w_200,h_200,g_auto,f_auto,q_auto",
        useCase: "Catalog lists and cart previews",
      },
      {
        name: "card",
        label: "Product Card Frame",
        transformation: "c_pad,w_600,h_600,b_white,f_auto,q_auto",
        useCase: "Consistent white-frame storefront cards",
      },
      {
        name: "marketplace_square",
        label: "Marketplace Square",
        transformation: "c_pad,w_1000,h_1000,b_white,f_auto,q_auto",
        useCase: "Syndication for Amazon & Google Shopping",
      },
      {
        name: "webp",
        label: "WebP Format",
        transformation: "f_webp,q_auto",
        useCase: "Next-gen image format savings",
      },
    ];

    return transformations.map((t) => ({
      name: t.name,
      label: t.label,
      transformation: t.transformation,
      url: this.buildUrl(publicIdOrUrl, t.transformation, t.name),
      useCase: t.useCase,
    }));
  }

  private buildUrl(publicIdOrUrl: string, transformation: string, variantName?: string): string {
    if (!publicIdOrUrl) return "";

    // Resolve known sample ID to real high-res photography
    if (SAMPLE_IMAGE_MAP[publicIdOrUrl]) {
      publicIdOrUrl = SAMPLE_IMAGE_MAP[publicIdOrUrl];
    }

    // 1. If it's already a full Cloudinary URL
    if (publicIdOrUrl.includes("res.cloudinary.com")) {
      if (!transformation) return publicIdOrUrl;
      const uploadIdx = publicIdOrUrl.indexOf("/upload/");
      if (uploadIdx !== -1) {
        const prefix = publicIdOrUrl.slice(0, uploadIdx + 8);
        const suffix = publicIdOrUrl.slice(uploadIdx + 8);
        return `${prefix}${transformation}/${suffix}`;
      }
      return publicIdOrUrl;
    }

    // 2. If it's an Unsplash or external HTTP image
    if (publicIdOrUrl.startsWith("http://") || publicIdOrUrl.startsWith("https://")) {
      if (publicIdOrUrl.includes("images.unsplash.com")) {
        // Apply Unsplash dynamic transformation params
        const urlObj = new URL(publicIdOrUrl);
        if (variantName === "thumbnail") {
          urlObj.searchParams.set("w", "200");
          urlObj.searchParams.set("h", "200");
          urlObj.searchParams.set("fit", "crop");
        } else if (variantName === "card") {
          urlObj.searchParams.set("w", "600");
          urlObj.searchParams.set("h", "600");
          urlObj.searchParams.set("fit", "fill");
        } else if (variantName === "marketplace_square") {
          urlObj.searchParams.set("w", "1000");
          urlObj.searchParams.set("h", "1000");
          urlObj.searchParams.set("fit", "fill");
        } else if (variantName === "webp") {
          urlObj.searchParams.set("fm", "webp");
        }
        return urlObj.toString();
      }
      return publicIdOrUrl;
    }

    // 3. If it's a local uploaded image (/uploads/...) or data URI
    if (publicIdOrUrl.startsWith("/") || publicIdOrUrl.startsWith("data:")) {
      return publicIdOrUrl;
    }

    // 4. If real Cloudinary is configured with valid credentials
    if (this.hasRealCredentials) {
      if (!transformation) {
        return `https://res.cloudinary.com/${this.cloudName}/image/upload/${publicIdOrUrl}`;
      }
      return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformation}/${publicIdOrUrl}`;
    }

    // 5. Fallback for demo: use official Cloudinary demo account samples
    const demoBase = "https://res.cloudinary.com/demo/image/upload";
    if (!transformation) return `${demoBase}/${publicIdOrUrl}`;
    return `${demoBase}/${transformation}/${publicIdOrUrl}`;
  }
}
