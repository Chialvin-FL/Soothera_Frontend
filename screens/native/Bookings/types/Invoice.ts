import { BookingDetails } from './BookingDetails';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceCalculations {
  // Gross amount (what customer pays)
  grossAmount: number;
  
  // For VAT (Inclusive)
  vatableSales?: number;
  vatAmount?: number;
  vatRate?: number; // e.g., 0.12 for 12%
  
  // For Non-VAT
  totalSales?: number;
  discounts?: number;
  
  // Common fields
  totalAmountDue: number;
  isVAT: boolean;
}

export type InvoiceDocumentType = 'invoice' | 'acknowledgementReceipt';

export interface InvoiceData extends BookingDetails {
  invoiceNumber: string;
  invoiceDate: string;
  documentType: InvoiceDocumentType;
  paymentLabel: string;
  isNonRefundable?: boolean;
  items: InvoiceItem[];
  calculations: InvoiceCalculations;
  customerName?: string;
  customerAddress?: string;
  customerEmail?: string;
  customerPhone?: string;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessTIN?: string;
  notes?: string;
}
