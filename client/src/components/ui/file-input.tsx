import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Upload, X } from 'lucide-react';

export interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFilesSelected: (files: File[]) => void;
  selectedFiles?: File[];
  onRemoveFile?: (index: number) => void;
  className?: string;
  dropzoneText?: string;
  browseText?: string;
  supportedFormatsText?: string;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ 
    className,
    onFilesSelected,
    selectedFiles = [],
    onRemoveFile,
    dropzoneText = 'Drag and drop your documents here, or',
    browseText = 'browse',
    supportedFormatsText = 'Supported formats: PDF, JPG, PNG, DOC',
    accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
    multiple = true,
    ...props
  }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFilesSelected(Array.from(files));
      }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        onFilesSelected(Array.from(files));
      }
    };

    const getFileIcon = (fileName: string) => {
      const extension = fileName.split('.').pop()?.toLowerCase();
      
      switch(extension) {
        case 'pdf':
          return 'file-text';
        case 'jpg':
        case 'jpeg':
        case 'png':
          return 'image';
        case 'doc':
        case 'docx':
          return 'file-text';
        default:
          return 'file';
      }
    };

    return (
      <div className={className}>
        {/* Hidden file input */}
        <input
          type="file"
          ref={ref || fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
          {...props}
        />
        
        {/* Dropzone */}
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer",
            isDragging && "border-primary bg-primary/5",
            className
          )}
        >
          <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <p className="text-sm text-slate-600">
            {dropzoneText} <span className="text-primary font-medium">{browseText}</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">{supportedFormatsText}</p>
        </div>
        
        {/* Selected files list */}
        {selectedFiles.length > 0 && (
          <div className="border rounded-lg p-3 bg-slate-50 mt-4">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Selected Documents</h4>
            <ul className="text-sm divide-y divide-slate-200">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <span className={`mr-2 text-${file.type.includes('pdf') ? 'red' : file.type.includes('image') ? 'blue' : 'green'}-500`}>
                      <i className={`fas fa-${getFileIcon(file.name)}`}></i>
                    </span>
                    <span className="truncate max-w-[200px]">{file.name}</span>
                  </div>
                  {onRemoveFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onRemoveFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';

export { FileInput };
