import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconUpload, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FileUploaderProps {
  onFileChange: (file: File | null) => void;
  accept?: string;
  label?: string;
  description?: string;
  buttonText?: string;
  isProcessing?: boolean;
  onProcess?: () => void;
  processButtonText?: string;
  processingText?: string;
  hasUser?: boolean;
  onValidationError?: () => void;
}

export function FileUploader({
  onFileChange,
  accept = "image/*",
  label = "Upload File",
  description = "Upload file in supported formats",
  buttonText = "Choose File",
  isProcessing = false,
  onProcess,
  processButtonText = "Process File",
  processingText = "Processing...",
  hasUser = true,
  onValidationError,
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fungsi untuk mengonversi gambar ke grayscale
  const convertToGrayscale = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Konversi ke grayscale menggunakan formula luminance
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Formula luminance: 0.299R + 0.587G + 0.114B
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          data[i] = gray; // R
          data[i + 1] = gray; // G
          data[i + 2] = gray; // B
          // Alpha (data[i + 3]) tetap
        }

        ctx.putImageData(imageData, 0, 0);

        // Konversi canvas ke blob, lalu ke file
        canvas.toBlob((blob) => {
          if (blob) {
            const grayscaleFile = new File([blob], file.name, {
              type: file.type,
              lastModified: file.lastModified,
            });
            resolve(grayscaleFile);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        }, file.type);
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validasi tipe file
      const validTypes = ["image/png", "image/jpeg"];
      if (!validTypes.includes(file.type)) {
        toast.error("Format file tidak valid", {
          description: "Hanya file PNG atau JPG yang diizinkan.",
        });
        // Kosongkan input file
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setSelectedFile(null);
        setPreview(null);
        onFileChange(null);
        return;
      }

      try {
        // Konversi ke grayscale jika file adalah gambar
        if (file.type.startsWith("image/")) {
          const grayscaleFile = await convertToGrayscale(file);
          setSelectedFile(grayscaleFile);

          // Generate preview untuk grayscale
          const reader = new FileReader();
          reader.onload = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(grayscaleFile);

          // Notify parent component dengan file grayscale
          onFileChange(grayscaleFile);
        } else {
          setSelectedFile(file);
          setPreview(null);
          onFileChange(file);
        }
      } catch (error) {
        console.error("Error converting to grayscale:", error);
        toast.error("Gagal memproses file", {
          description: "Terjadi kesalahan saat mengonversi gambar.",
        });
        setSelectedFile(null);
        setPreview(null);
        onFileChange(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } else {
      setSelectedFile(null);
      setPreview(null);
      onFileChange(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChooseFileClick = () => {
    if (!hasUser && onValidationError) {
      onValidationError();
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const uniqueId = React.useId();
  const inputId = `file-upload-${uniqueId}`;

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <IconUpload className="h-10 w-10 text-gray-400" />
            <div className="text-sm text-gray-500">{description}</div>
            <Button
              className={cn(
                "inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium cursor-pointer hover:bg-primary/90"
              )}
              onClick={handleChooseFileClick}
            >
              {buttonText}
            </Button>
            <Input
              id={inputId}
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </div>
        ) : (
          <div className="relative">
            {preview ? (
              <img
                src={preview}
                alt="File preview"
                className="max-h-64 max-w-full mx-auto"
              />
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-100 rounded">
                <span className="text-sm text-gray-500">
                  {selectedFile.name}
                </span>
              </div>
            )}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white shadow-sm"
              onClick={clearFile}
            >
              <IconX className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {selectedFile && onProcess && (
        <Button
          className="w-full"
          onClick={onProcess}
          disabled={isProcessing || !selectedFile}
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <svg
                className="h-4 w-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{processingText}</span>
            </div>
          ) : (
            processButtonText
          )}
        </Button>
      )}
    </div>
  );
}
