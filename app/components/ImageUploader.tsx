import { ChangeEvent } from "react";
import { Upload } from "lucide-react";

interface ImageUploaderProps {
  onImageSelect?: (file: File) => void;
}

export default function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageSelect) {
      onImageSelect(file);
    }
  };

  return (
    <div className="p-4">
      <label className="flex flex-col items-center gap-2 cursor-pointer">
        <Upload className="h-6 w-6" />
        <span className="text-sm">Upload Image</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
