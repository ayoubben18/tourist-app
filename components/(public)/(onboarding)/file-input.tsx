"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UploadCloud, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FileInputProps {
  id: string;
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  required?: boolean;
  className?: string;
  error?: string;
}

const FileInput = ({
  id,
  label,
  value,
  onChange,
  accept,
  required,
  className,
  error
}: FileInputProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        onChange(file);
      }
    },
    [onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const handleClear = () => {
    onChange(null); // Pass null to indicate the file is removed
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input value
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the file input
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/10"
            : "border-muted-foreground/30",
          value && "border-solid border-gray-300"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick} // Trigger file input on click
      >
        {value ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">{value.name}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the file input
                handleClear();
              }}
              className="text-red-600 hover:text-red-800 bg-red-200 hover:bg-red-300"
            >
              <X className="h-4 w-4 mr-2" />
              <p className="font-bold">Remove File</p>
            </Button>
          </div>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Drag & drop a file here, or{" "}
              <span className="text-primary font-medium">click to upload</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supported formats: {accept || "Any"}
            </p>
          </>
        )}
        <Input
          id={id}
          type="file"
          accept={accept}
          required={required}
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef} // Ref to the file input
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default FileInput;
