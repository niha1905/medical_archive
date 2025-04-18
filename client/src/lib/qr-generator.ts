import { QrCode } from '@shared/schema';
import { apiRequest } from './queryClient';

/**
 * Handles QR code generation and management
 */
export const QrGenerator = {
  /**
   * Get or create a QR code for a user
   */
  async getUserQrCode(userId: number): Promise<QrCode> {
    try {
      const response = await fetch(`/api/users/${userId}/qrcode`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error getting QR code: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting user QR code:', error);
      throw error;
    }
  },
  
  /**
   * Create a new QR code for a user
   */
  async createQrCode(userId: number): Promise<QrCode> {
    try {
      // Generate a token
      const token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // Set expiration date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      const response = await apiRequest('POST', `/api/qrcodes`, {
        userId,
        token,
        expiresAt
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error creating QR code:', error);
      throw error;
    }
  },
  
  /**
   * Get patient data from a QR code token
   */
  async getPatientDataFromToken(token: string): Promise<any> {
    try {
      const response = await fetch(`/api/qrcode/${token}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error accessing patient data: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting patient data from token:', error);
      throw error;
    }
  }
};
