export interface ImageVariant {
  name: string;
  label: string;
  transformation: string;
  url: string;
  useCase: string;
}

export interface UploadResult {
  publicId: string;
  url: string;
  format?: string;
  bytes?: number;
}

export interface MediaPort {
  uploadImage(fileBuffer: Buffer, filename: string, sku?: string): Promise<UploadResult>;
  getVariants(publicIdOrUrl: string): ImageVariant[];
}
