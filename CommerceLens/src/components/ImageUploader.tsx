"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { UploadCloud, Camera, Link as LinkIcon, Loader2, Sparkles, Check, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  currentUrl?: string;
  sku?: string;
  onUploaded: (data: { url: string; publicId: string }) => void;
}

export function ImageUploader({ currentUrl, sku, onUploaded }: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<"file" | "camera" | "url">("file");
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentUrl || "");
  const [urlInput, setUrlInput] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Cleanup on unmount or tab change
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    if (currentUrl) setPreviewUrl(currentUrl);
  }, [currentUrl]);

  const startCamera = async () => {
    setCameraError(null);
    setCapturedBlob(null);
    setCapturedDataUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to access camera";
      setCameraError(msg);
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedDataUrl(dataUrl);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
        }
      },
      "image/jpeg",
      0.9
    );

    stopCamera();
  };

  const uploadBlobOrFile = async (fileOrBlob: File | Blob, filename: string) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", fileOrBlob, filename);
      if (sku) formData.append("sku", sku);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setPreviewUrl(data.url);
        onUploaded({ url: data.url, publicId: data.publicId || filename });
        setCapturedBlob(null);
        setCapturedDataUrl(null);
      } else {
        const errorText = typeof data.error === "object" ? JSON.stringify(data.error) : (data.error || "Upload failed");
        alert("Upload notice: " + errorText);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload image. Please try again or use sample image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void uploadBlobOrFile(file, file.name);
    }
  };

  const handleUrlApply = () => {
    if (!urlInput.trim()) return;
    const cleanUrl = urlInput.trim();
    setPreviewUrl(cleanUrl);
    onUploaded({ url: cleanUrl, publicId: "" });
  };

  const handleSampleSelect = (url: string, label: string) => {
    setPreviewUrl(url);
    onUploaded({ url, publicId: label });
  };

  return (
    <div className="space-y-3">
      {/* Upload mode tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#f4efe6] border border-[#ded7cb] w-fit text-xs font-medium">
        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveTab("file");
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
            activeTab === "file" ? "bg-stone-900 text-stone-50 font-semibold" : "text-stone-600 hover:text-stone-900"
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("camera");
            void startCamera();
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
            activeTab === "camera" ? "bg-stone-900 text-stone-50 font-semibold" : "text-stone-600 hover:text-stone-900"
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          Click with Camera
        </button>
        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveTab("url");
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
            activeTab === "url" ? "bg-stone-900 text-stone-50 font-semibold" : "text-stone-600 hover:text-stone-900"
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          Image URL
        </button>
      </div>

      {/* Tab 1: File Upload */}
      {activeTab === "file" && (
        <div className="border-2 border-dashed border-[#ded7cb] rounded-xl p-5 text-center bg-[#fbf9f5] hover:border-stone-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            id="file-input"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-2">
            <UploadCloud className="w-7 h-7 text-stone-400" />
            <div className="text-xs text-stone-600">
              <span className="font-semibold text-stone-900">Click to upload photo</span> or drag and drop
            </div>
            <span className="text-[11px] text-stone-400">PNG, JPG, WEBP up to 10MB (Cloudinary Media Engine)</span>
          </label>
        </div>
      )}

      {/* Tab 2: Camera Snap */}
      {activeTab === "camera" && (
        <div className="p-4 rounded-xl border border-[#ded7cb] bg-[#fbf9f5] space-y-3">
          {cameraError ? (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {cameraError}
            </div>
          ) : !capturedDataUrl ? (
            <div className="space-y-3">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-semibold shadow-sm hover:bg-stone-800 active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" /> Snap Photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-2 rounded-xl text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="aspect-video rounded-lg overflow-hidden bg-stone-100 flex items-center justify-center border border-[#ded7cb]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={capturedDataUrl} alt="Captured preview" className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (capturedBlob) {
                      void uploadBlobOrFile(capturedBlob, `camera_${Date.now()}.jpg`);
                    }
                  }}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-semibold shadow-sm hover:bg-stone-800 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading to Cloudinary...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Use This Snapshot
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCapturedBlob(null);
                    setCapturedDataUrl(null);
                    void startCamera();
                  }}
                  disabled={isUploading}
                  className="px-3 py-2 rounded-xl text-xs text-stone-600 hover:text-stone-900"
                >
                  Retake
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: URL Input */}
      {activeTab === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/... or Cloudinary URL"
            className="flex-1 bg-[#f8f6f0] border border-[#ded7cb] rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-600"
          />
          <button
            type="button"
            onClick={handleUrlApply}
            className="px-4 py-2 rounded-lg bg-stone-900 text-stone-50 text-xs font-medium hover:bg-stone-800 transition-colors"
          >
            Apply URL
          </button>
        </div>
      )}

      {/* Quick Sample Photos for Instant 1-Click Testing */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-500">
        <span className="text-[11px] font-medium text-stone-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-600" />
          Test with demo photo:
        </span>
        <button
          type="button"
          onClick={() =>
            handleSampleSelect(
              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
              "sample_red_sneakers"
            )
          }
          className="px-2.5 py-1 rounded-md bg-white hover:bg-[#f4efe6] text-stone-800 border border-[#ded7cb] text-[11px] transition-colors"
        >
          Red Sneakers
        </button>
        <button
          type="button"
          onClick={() =>
            handleSampleSelect(
              "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80",
              "sample_backpack"
            )
          }
          className="px-2.5 py-1 rounded-md bg-white hover:bg-[#f4efe6] text-stone-800 border border-[#ded7cb] text-[11px] transition-colors"
        >
          Travel Backpack
        </button>
        <button
          type="button"
          onClick={() =>
            handleSampleSelect(
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
              "sample_headphones"
            )
          }
          className="px-2.5 py-1 rounded-md bg-white hover:bg-[#f4efe6] text-stone-800 border border-[#ded7cb] text-[11px] transition-colors"
        >
          Studio Headphones
        </button>
      </div>

      {/* Uploading progress indicator */}
      {isUploading && (
        <div className="flex items-center gap-2 text-xs text-stone-600 p-2.5 rounded-lg bg-[#f4efe6] border border-[#ded7cb]">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-700" />
          <span>Processing photo and generating Cloudinary transforms...</span>
        </div>
      )}

      {/* Thumbnail preview if URL is set */}
      {previewUrl && !isUploading && (
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#ded7cb] shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-[#f8f6f0] overflow-hidden border border-[#ded7cb] flex-shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Product visual" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-stone-900 block truncate">Photo Configured</span>
            <span className="text-[10px] text-stone-400 font-mono block truncate">{previewUrl}</span>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            Active
          </span>
        </div>
      )}
    </div>
  );
}
