import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileInput } from '@/components/ui/file-input';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Calendar, 
  FileText, 
  Upload, 
  X, 
  Tag, 
  MessageSquare, 
  Eye, 
  Download, 
  Share2 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (document: any) => void;
  isUploading: boolean;
  userId: number;
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  categoryId: z.string().optional().default("1"),
  date: z.string().optional().default(new Date().toISOString().split('T')[0]),
  notes: z.string().optional(),
  files: z.array(z.instanceof(File).refine(file => file.size < 10000000, {
    message: 'File must be less than 10MB'
  })).min(1, 'Please select at least one file')
});

const UploadModal: React.FC<UploadModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpload, 
  isUploading,
  userId
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  
  // Fetch categories from the API
  const { data: categories, isLoading: categoriesLoading } = useQuery<Array<{ id: number; name: string }>>({
    queryKey: [`/api/users/${userId}/categories`],
    enabled: isOpen,
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      categoryId: '1',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      files: []
    }
  });
  
  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setFilePreview(null);
      setUploadProgress(0);
    }
  }, [isOpen, form]);
  
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Simulate upload progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    
    // Convert files to Base64 data for storage
    const filePromises = values.files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(filePromises).then(fileDataArray => {
      // Prepare document data
      const documentData = {
        title: values.title,
        categoryId: values.categoryId ? parseInt(values.categoryId) : 1, // Default to category 1 if not provided
        userId,
        date: values.date || new Date().toISOString().split('T')[0],
        notes: values.notes || undefined, // Use undefined instead of null for empty notes
        fileData: fileDataArray[0] // Use the first file for now
      };
      
      // Send to server
      onUpload(documentData);
      
      // Complete progress
      setUploadProgress(100);
    });
  };
  
  const handleFileSelection = (files: File[]) => {
    form.setValue('files', files, { shouldValidate: true });
    
    // Generate preview for image files
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setFilePreview(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    } else {
      setFilePreview(null);
    }
  };
  
  const removeFile = (index: number) => {
    const currentFiles = form.getValues('files');
    const updatedFiles = [...currentFiles];
    updatedFiles.splice(index, 1);
    form.setValue('files', updatedFiles, { shouldValidate: true });
    
    if (updatedFiles.length === 0) {
      setFilePreview(null);
    } else if (index === 0 && filePreview) {
      // If we removed the first file, update preview with the new first file
      const newFirstFile = updatedFiles[0];
      if (newFirstFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setFilePreview(e.target.result as string);
          }
        };
        reader.readAsDataURL(newFirstFile);
      } else {
        setFilePreview(null);
      }
    }
  };
  
  const handleView = () => {
    if (filePreview) {
      setShowPreview(true);
    }
  };
  
  const handleDownload = () => {
    const files = form.getValues('files');
    if (files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  
  const handleShare = () => {
    const files = form.getValues('files');
    if (files.length > 0 && navigator.share) {
      const file = files[0];
      const shareData = {
        title: form.getValues('title') || 'Medical Document',
        text: 'Sharing a medical document',
        files: [file]
      };
      
      try {
        navigator.share(shareData as any)
          .catch(err => console.error('Error sharing:', err));
      } catch (err) {
        console.error('Share API not supported or error:', err);
        alert('Sharing is not supported on this device or browser.');
      }
    } else {
      alert('Sharing is not supported on this device or browser.');
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
        
        {/* Full-screen preview for images */}
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Files Dropzone */}
            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1 text-blue-700">
                    <FileText className="h-4 w-4" />
                    Document File
                  </FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors rounded-lg p-6">
                      {filePreview ? (
                        <div className="flex flex-col items-center">
                          <img src={filePreview} alt="Preview" className="max-h-40 mb-3 rounded-md shadow-md" />
                          <p className="text-sm text-blue-700 font-medium">
                            {field.value.length > 0 ? field.value[0].name : ''}
                          </p>
                          
                          {/* File action buttons */}
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
                        </div>
                      ) : (
                        <FileInput
                          selectedFiles={field.value}
                          onFilesSelected={handleFileSelection}
                          onRemoveFile={removeFile}
                          dropzoneText="Drag and drop your medical document here, or"
                          browseText="browse files"
                          supportedFormatsText="Supported formats: PDF, JPG, PNG (max. 10MB)"
                          className="border-0 p-0 hover:border-0"
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            
            {/* Document Title */}
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
            
            {/* Document Category */}
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
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-blue-200 focus:border-blue-400 bg-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                      ) : categories && categories.length > 0 ? (
                        categories.map((category: any, index: number) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
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
                              {category.name}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        // Fallback default categories if none are loaded
                        [
                          { id: 1, name: 'Lab Reports' },
                          { id: 2, name: 'Prescriptions' },
                          { id: 3, name: 'X-Rays' },
                          { id: 4, name: 'Vaccinations' }
                        ].map((category, index) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                index % 4 === 0 ? "default" :
                                index % 4 === 1 ? "secondary" :
                                index % 4 === 2 ? "destructive" :
                                "outline"
                              }>
                                {index + 1}
                              </Badge>
                              {category.name}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            
            {/* Document Date */}
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
                      {...field} 
                      className="border-blue-200 focus:border-blue-400 bg-white"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            
            {/* Notes */}
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
            
            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700">Uploading...</span>
                  <span className="text-sm text-blue-500">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2 bg-blue-100 [&>div]:bg-blue-600" />
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6 border-t border-blue-200 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isUploading}
                className="border-red-300 hover:bg-red-50 text-red-600"
              >
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isUploading ? (
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
