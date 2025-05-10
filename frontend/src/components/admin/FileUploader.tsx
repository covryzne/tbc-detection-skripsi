import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconUpload, IconX } from "@tabler/icons-react";

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
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);

      // Generate preview for image files
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }

      // Notify parent component
      onFileChange(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    onFileChange(null);
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
            <Label
              htmlFor={inputId}
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium cursor-pointer"
            >
              {buttonText}
            </Label>
            <Input
              id={inputId}
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleFileChange}
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
        <Button className="w-full" onClick={onProcess} disabled={isProcessing}>
          {isProcessing ? processingText : processButtonText}
        </Button>
      )}
    </div>
  );
}
