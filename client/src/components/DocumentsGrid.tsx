import { Document, DocumentFilter } from "@shared/schema";
import DocumentCard from "./DocumentCard";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { format, sub, parseISO, isAfter } from "date-fns";

interface DocumentsGridProps {
  documents: Document[];
  filters: DocumentFilter;
  isLoading: boolean;
  onDocumentClick: (document: Document) => void;
}

const DocumentsGrid = ({ documents, filters, isLoading, onDocumentClick }: DocumentsGridProps) => {
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);

  // Apply filters whenever documents or filters change
  useEffect(() => {
    let result = [...documents];
    
    // Filter by category
    if (filters.category) {
      result = result.filter(doc => doc.category === filters.category);
    }
    
    // Filter by date
    if (filters.date) {
      const now = new Date();
      let dateThreshold: Date | null = null;
      
      switch (filters.date) {
        case 'last_month':
          dateThreshold = sub(now, { months: 1 });
          break;
        case 'last_3_months':
          dateThreshold = sub(now, { months: 3 });
          break;
        case 'last_6_months':
          dateThreshold = sub(now, { months: 6 });
          break;
        case 'last_year':
          dateThreshold = sub(now, { years: 1 });
          break;
      }
      
      if (dateThreshold) {
        result = result.filter(doc => isAfter(parseISO(doc.date), dateThreshold!));
      }
    }
    
    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(doc => 
        doc.title.toLowerCase().includes(searchLower) || 
        doc.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredDocuments(result);
  }, [documents, filters]);

  // Show skeleton loading state
  if (isLoading) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Medical Documents</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
              <Skeleton className="h-36 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <div className="flex space-x-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show empty state if no documents (after filtering)
  if (filteredDocuments.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Medical Documents</h2>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="flex flex-col items-center">
            <UploadIcon className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">
              {documents.length === 0
                ? "No documents yet"
                : "No documents match your filters"}
            </h3>
            <p className="text-slate-500 mb-6 max-w-md">
              {documents.length === 0
                ? "Upload your first medical document to start building your health record."
                : "Try changing your filters to see more documents."}
            </p>
            {documents.length === 0 && (
              <Button onClick={() => document.getElementById("upload-button")?.click()}>
                <UploadIcon className="mr-2 h-4 w-4" />
                <span>Upload Document</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show document grid
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Your Medical Documents</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            onClick={() => onDocumentClick(document)}
          />
        ))}
      </div>
    </div>
  );
};

export default DocumentsGrid;
