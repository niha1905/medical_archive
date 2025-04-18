import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (document: any) => void;
  isUploading: boolean;
  userId: number;
}

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  date: z.string().min(1, 'Please select a date'),
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
  
  // Fetch categories from the API
  const { data: categories } = useQuery({
    queryKey: [`/api/users/${userId}/categories`],
    enabled: isOpen,
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      files: []
    }
  });
  
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
        categoryId: parseInt(values.categoryId),
        userId,
        date: values.date,
        notes: values.notes || '',
        fileData: {
          files: fileDataArray.map((data, index) => ({
            name: values.files[index].name,
            type: values.files[index].type,
            size: values.files[index].size,
            data
          }))
        }
      };
      
      // Send to server
      onUpload(documentData);
      
      // Complete progress
      setUploadProgress(100);
      
      // Reset form after successful upload
      form.reset();
    });
  };
  
  const handleFileSelection = (files: File[]) => {
    form.setValue('files', files, { shouldValidate: true });
  };
  
  const removeFile = (index: number) => {
    const currentFiles = form.getValues('files');
    const updatedFiles = [...currentFiles];
    updatedFiles.splice(index, 1);
    form.setValue('files', updatedFiles, { shouldValidate: true });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">Upload Document</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Files Dropzone */}
            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileInput
                      selectedFiles={field.value}
                      onFilesSelected={handleFileSelection}
                      onRemoveFile={removeFile}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Document Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter document title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Document Category */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories && categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Document Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any notes about this document..." 
                      className="h-20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Uploading...</span>
                  <span className="text-sm text-slate-500">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading || !form.formState.isValid}
              >
                Upload Documents
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
