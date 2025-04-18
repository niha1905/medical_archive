import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UploadModal from "@/components/UploadModal";
import QrCodeModal from "@/components/QrCodeModal";
import FilterBar from "@/components/FilterBar";
import DocumentsGrid from "@/components/DocumentsGrid";
import DocumentViewer from "@/components/DocumentViewer";
import { Document, DocumentFilter } from "@shared/schema";
import { getDocumentsFromLocalStorage, setDocumentsToLocalStorage } from "@/lib/localStorage";

const Home = () => {
  const { toast } = useToast();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [filters, setFilters] = useState<DocumentFilter>({
    category: "",
    date: "",
    search: "",
  });

  // Load documents from API or localStorage if offline
  const { data: documents, isLoading, isError } = useQuery({
    queryKey: ["/api/documents"],
    onError: () => {
      // If API fails, try to load from localStorage
      const localDocs = getDocumentsFromLocalStorage();
      if (localDocs.length > 0) {
        toast({
          title: "Using locally stored documents",
          description: "Could not connect to server, showing cached documents",
        });
      }
    }
  });

  // Since we're using localStorage as fallback, combine API and local storage data
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  
  useEffect(() => {
    // If we have API documents, use those and update localStorage
    if (documents) {
      setAllDocuments(documents);
      setDocumentsToLocalStorage(documents);
    } else if (!isLoading) {
      // If API failed or no documents, use localStorage
      setAllDocuments(getDocumentsFromLocalStorage());
    }
  }, [documents, isLoading]);

  // Create document mutation
  const createDocumentMutation = useMutation({
    mutationFn: async (document: Omit<Document, "id">) => {
      const res = await apiRequest("POST", "/api/documents", document);
      return res.json();
    },
    onSuccess: (newDocument) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document uploaded",
        description: "Your medical document has been saved successfully",
      });
      // Also save to localStorage as backup
      const currentDocs = getDocumentsFromLocalStorage();
      setDocumentsToLocalStorage([...currentDocs, newDocument]);
      setIsUploadModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    }
  });

  // QR code query
  const { data: qrCodeData } = useQuery({
    queryKey: ["/api/qrcode"],
    enabled: isQrModalOpen, // Only fetch when modal is open
  });

  // Handle document click to view
  const handleDocumentClick = (document: Document) => {
    setActiveDocument(document);
    setIsViewerOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onUploadClick={() => setIsUploadModalOpen(true)} 
        onQrClick={() => setIsQrModalOpen(true)} 
      />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FilterBar filters={filters} onFilterChange={setFilters} />
          
          <DocumentsGrid 
            documents={allDocuments}
            filters={filters}
            isLoading={isLoading}
            onDocumentClick={handleDocumentClick}
          />
        </div>
      </main>
      
      <Footer />
      
      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={(document) => createDocumentMutation.mutate(document)}
        isPending={createDocumentMutation.isPending}
      />
      
      <QrCodeModal 
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        qrCodeUrl={qrCodeData?.qrCode}
      />
      
      <DocumentViewer 
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        document={activeDocument}
      />
    </div>
  );
};

export default Home;
