import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Document, InsertDocument, insertDocumentSchema, DOCUMENT_CATEGORIES, FILE_TYPES } from "@shared/schema";
import { format } from "date-fns";
import { FileIcon } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (document: Omit<Document, "id">) => void;
  isPending: boolean;
}

const UploadModal = ({ isOpen, onClose, onSubmit, isPending }: UploadModalProps) => {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [fileData, setFileData] = useState<string>("");

  const form = useForm<InsertDocument>({
    resolver: zodResolver(insertDocumentSchema),
    defaultValues: {
      title: "",
      category: "other",
      date: format(new Date(), "yyyy-MM-dd"),
      fileType: "pdf",
      fileData: "",
      createdAt: new Date().toISOString(),
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    
    // Get file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || "";
    if (!FILE_TYPES.includes(fileExtension as any)) {
      form.setError("fileType", { 
        message: "Unsupported file type. Please upload PDF, JPG, or PNG files." 
      });
      return;
    }
    
    // Set file type in form
    form.setValue("fileType", fileExtension as any);
    setFileType(fileExtension);
    setFileName(file.name);

    reader.onload = (event) => {
      if (event.target?.result) {
        const fileData = event.target.result as string;
        form.setValue("fileData", fileData);
        setFileData(fileData);
        
        // Create preview for images
        if (fileExtension === "jpg" || fileExtension === "jpeg" || fileExtension === "png") {
          setFilePreview(fileData);
        } else {
          setFilePreview(null);
        }
      }
    };
    
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (data: InsertDocument) => {
    if (!fileData) {
      form.setError("fileData", { message: "Please upload a file" });
      return;
    }
    
    onSubmit({
      ...data,
      fileData,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Medical Document</DialogTitle>
          <DialogDescription>
            Add a medical document to your personal record.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Blood Test Results" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DOCUMENT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fileData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document File</FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                      <Input 
                        id="file-upload" 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer block">
                        {filePreview ? (
                          <div className="flex flex-col items-center">
                            <img src={filePreview} alt="Preview" className="max-h-32 mb-2" />
                            <p className="text-sm text-slate-600">{fileName}</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <FileIcon className="h-10 w-10 text-primary mb-2" />
                            <p className="text-sm text-slate-600">
                              {fileName || "Click to upload or drag and drop"}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              PDF, JPG, PNG (max. 10MB)
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
