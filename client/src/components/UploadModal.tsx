import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Document, InsertDocument, insertDocumentSchema, DOCUMENT_CATEGORIES, FILE_TYPES } from "@shared/schema";
import { format } from "date-fns";
import { FileIcon, Download, Eye, Share2, Upload, X, Calendar, FileText, Tag, MessageSquare } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

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
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const form = useForm<InsertDocument>({
    resolver: zodResolver(insertDocumentSchema),
    defaultValues: {
      title: "",
      categoryId: 0,
      date: new Date(),
      fileData: "",
      notes: "",
      userId: 0,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    const fileExtension = file.name.split('.').pop()?.toLowerCase() || "";
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB

    // Validate file type
    if (!FILE_TYPES.includes(fileExtension as any)) {
      form.setError("fileData", { message: "Unsupported file type. Please upload PDF, JPG, or PNG files." });
      setFilePreview(null);
      setFileName("");
      setFileData("");
      return;
    }

    // Validate file size
    if (file.size > maxSizeInBytes) {
      form.setError("fileData", { message: "File is too large. Maximum allowed size is 10MB." });
      setFilePreview(null);
      setFileName("");
      setFileData("");
      return;
    }

    setFileType(fileExtension);
    setFileName(file.name);

    reader.onload = (event) => {
      if (event.target?.result) {
        const data = event.target.result as string;
        form.setValue("fileData", data);
        setFileData(data);

        if (fileExtension === "jpg" || fileExtension === "jpeg" || fileExtension === "png") {
          setFilePreview(data);
        } else {
          setFilePreview(null);
        }
      }
    };

    reader.readAsDataURL(file);
  };
  const handleFormSubmit = (data: InsertDocument) => {
    if (!fileData) {
      form.setError("fileData", { message: "Please upload a file." });
      return;
    }

    onSubmit({
      ...data,
      date: new Date(data.date),
      fileData,
      createdAt: new Date(),
      notes: data.notes || null, // Convert undefined to null to match Document type
    });
  };
  
  const handleDownload = () => {
    if (!fileData || !fileName) return;
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = fileData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleView = () => {
    setShowPreview(true);
  };
  
  const handleShare = () => {
    if (navigator.share && fileData) {
      // Use Web Share API if available
      navigator.share({
        title: form.getValues().title || 'Medical Document',
        text: 'Sharing a medical document',
        url: fileData
      }).catch(error => console.log('Error sharing', error));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(fileData)
        .then(() => alert('Document link copied to clipboard!'))
        .catch(err => console.error('Failed to copy: ', err));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <DialogHeader className="bg-blue-600 text-white p-4 rounded-t-lg -mt-6 -mx-6 mb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6" />
            Upload Medical Document
          </DialogTitle>
          <DialogDescription className="text-blue-100">
            Add a medical document to your personal health record.
          </DialogDescription>
        </DialogHeader>

        {showPreview && filePreview && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="relative bg-white p-4 rounded-lg max-w-3xl max-h-[90vh] overflow-auto">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={() => setShowPreview(false)}
              >
                <X />
              </Button>
              <img src={filePreview} alt="Document Preview" className="max-w-full h-auto" />
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">

            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1 text-blue-700">
                    <FileText className="h-4 w-4" />
                    Document Title
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Blood Test Results" 
                      {...field} 
                      className="border-blue-200 focus:border-blue-400 bg-white"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* Category Field */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1 text-blue-700">
                    <Tag className="h-4 w-4" />
                    Category
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="border-blue-200 focus:border-blue-400 bg-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DOCUMENT_CATEGORIES.map((category, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              index % 7 === 0 ? "default" :
                              index % 7 === 1 ? "secondary" :
                              index % 7 === 2 ? "destructive" :
                              index % 7 === 3 ? "outline" :
                              index % 7 === 4 ? "default" :
                              index % 7 === 5 ? "secondary" :
                              "outline"
                            }>
                              {index + 1}
                            </Badge>
                            {category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* Date Field */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1 text-blue-700">
                    <Calendar className="h-4 w-4" />
                    Document Date
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={format(new Date(field.value), "yyyy-MM-dd")}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      className="border-blue-200 focus:border-blue-400 bg-white"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* File Upload Field */}
            <FormField
              control={form.control}
              name="fileData"
              render={() => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1 text-blue-700">
                    <FileIcon className="h-4 w-4" />
                    Document File
                  </FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors rounded-lg p-6 text-center">
                      <Input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer block" aria-label="Upload file">
                        {filePreview ? (
                          <div className="flex flex-col items-center">
                            <img src={filePreview} alt="Preview" className="max-h-40 mb-3 rounded-md shadow-md" />
                            <p className="text-sm text-blue-700 font-medium">{fileName}</p>
                            
                            {/* File action buttons */}
                            {fileData && (
                              <div className="flex gap-2 mt-3">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        className="bg-blue-100 border-blue-300 hover:bg-blue-200 text-blue-700"
                                        onClick={handleView}
                                      >
                                        <Eye className="h-4 w-4 mr-1" /> View
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>View document in full screen</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        className="bg-green-100 border-green-300 hover:bg-green-200 text-green-700"
                                        onClick={handleDownload}
                                      >
                                        <Download className="h-4 w-4 mr-1" /> Download
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Download document to your device</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        className="bg-purple-100 border-purple-300 hover:bg-purple-200 text-purple-700"
                                        onClick={handleShare}
                                      >
                                        <Share2 className="h-4 w-4 mr-1" /> Share
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Share this document</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="h-20 w-20 rounded-full bg-blue-200 flex items-center justify-center mb-3">
                              <Upload className="h-10 w-10 text-blue-600" />
                            </div>
                            <p className="text-sm text-blue-700 font-medium">
                              {fileName || "Click to upload or drag and drop"}
                            </p>
                            <p className="text-xs text-blue-500 mt-1">
                              PDF, JPG, PNG (max. 10MB)
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* Notes Field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1 text-blue-700">
                    <MessageSquare className="h-4 w-4" />
                    Notes (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional notes about this document..." 
                      className="border-blue-200 focus:border-blue-400 bg-white resize-none min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* Submit/Cancel Buttons */}
            <div className="flex justify-end space-x-3 mt-6 border-t border-blue-200 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="border-red-300 hover:bg-red-50 text-red-600"
              >
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-1" /> Upload Document
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
