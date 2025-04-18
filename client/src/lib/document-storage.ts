import { Document, DocumentWithCategory } from '@shared/schema';
import { apiRequest } from './queryClient';

/**
 * Handles document storage operations
 */
export const DocumentStorage = {
  /**
   * Save a document to storage
   */
  async saveDocument(document: any): Promise<Document> {
    try {
      const response = await apiRequest('POST', '/api/documents', document);
      return await response.json();
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  },
  
  /**
   * Get all documents for a user
   */
  async getUserDocuments(userId: number): Promise<DocumentWithCategory[]> {
    try {
      const response = await fetch(`/api/users/${userId}/documents`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching documents: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting user documents:', error);
      throw error;
    }
  },
  
  /**
   * Get documents by category
   */
  async getDocumentsByCategory(userId: number, categoryId: number): Promise<DocumentWithCategory[]> {
    try {
      const response = await fetch(`/api/users/${userId}/documents?categoryId=${categoryId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching documents: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting documents by category:', error);
      throw error;
    }
  },
  
  /**
   * Download document as a file
   */
  downloadDocument(document: Document): void {
    if (!document.fileData || !document.fileData.files || document.fileData.files.length === 0) {
      console.error('Document has no file data');
      return;
    }
    
    // Create a download for each file in the document
    document.fileData.files.forEach((file: any, index: number) => {
      const link = document.createElement('a');
      link.href = file.data;
      
      // Use the file name if available, otherwise generate one
      const fileName = file.name || `${document.title.replace(/\s+/g, '_')}_${index + 1}`;
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  },
  
  /**
   * Delete a document
   */
  async deleteDocument(documentId: number): Promise<boolean> {
    try {
      const response = await apiRequest('DELETE', `/api/documents/${documentId}`, undefined);
      return response.ok;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
};
