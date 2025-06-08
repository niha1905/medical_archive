import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Upload, Plus } from 'lucide-react';
import UploadModal from '@/components/modals/upload-modal';
import { apiRequest } from '@/lib/queryClient';

interface DocumentUploaderProps {
  userId: number;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ userId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const uploadMutation = useMutation({
    mutationFn: async (formData: any) => {
      const response = await apiRequest('POST', '/api/documents', formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/documents`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/categories`] });
      
      toast({
        title: 'Success!',
        description: 'Your document was uploaded successfully.',
      });
      
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Upload failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const handleUpload = (documentData: any) => {
    uploadMutation.mutate({
      ...documentData,
      userId
    });
  };

  return (
    <>
      <Button 
        className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
        onClick={() => setIsModalOpen(true)}
      >
        <Upload className="mr-2 h-4 w-4" />
        <span>Upload Document</span>
      </Button>
      
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
        isUploading={uploadMutation.isPending}
        userId={userId}
      />
    </>
  );
};

export default DocumentUploader;
