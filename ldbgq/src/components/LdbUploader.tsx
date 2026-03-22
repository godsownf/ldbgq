import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, XCircle } from "lucide-react";
import { parseLdbFile } from "../utils/ldbParser";
import { LdbEntry } from "../types";

interface LdbUploaderProps {
  onFileLoaded: (entries: LdbEntry[], fileName: string, fileSize: number) => void;
}

export default function LdbUploader({ onFileLoaded }: LdbUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      if (!file.name.endsWith('.ldb')) {
        throw new Error("Invalid file extension. Please select a .ldb file.");
      }

      const entries = await parseLdbFile(file);
      onFileLoaded(entries, file.name, file.size);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
          ${isDragging 
            ? 'border-emerald-500 bg-emerald-500/5' 
            : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          type="file"
          accept=".ldb"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={`
            p-4 rounded-full transition-colors
            ${isDragging ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}
          `}>
            {isLoading ? <UploadCloud className="w-8 h-8 animate-pulse" /> : <FileText className="w-8 h-8" />}
          </div>
          
          <div>
            <p className="text-lg font-medium text-zinc-200">
              {isLoading ? 'Performing Deep Scan...' : 'Drop .ldb file here'}
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              Hybrid UTF-8/Latin-1 Decoder with Zero Data Loss
            </p>
          </div>

          {!isLoading && (
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Select File
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}