import { BookingDetails } from '../types/BookingDetails';
import { BOOKING_STATUS } from '../types/Booking';
import { InvoiceData, InvoiceItem } from '../types/Invoice';
import { calculateVATInclusive, calculateNonVAT } from './invoiceCalculations';

/**
 * Generate invoice data from booking details
 */
export function generateInvoiceFromBooking(
  bookingDetails: BookingDetails,
  options: {
    isVAT?: boolean;
    vatRate?: number;
    discounts?: number;
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
  } = {}
): InvoiceData {
  const {
    isVAT = false,
    vatRate = 0.12,
    discounts = 0,
    customerName,
    customerAddress,
    customerEmail,
    customerPhone,
    businessName = 'Soothera',
    businessAddress = 'Cebu, Philippines',
    businessPhone,
    businessEmail,
    businessTIN,
    notes,
  } = options;

  const isCompleted = bookingDetails.status === BOOKING_STATUS.COMPLETED;
  const isCancelled = bookingDetails.status === BOOKING_STATUS.CANCELLED;
  const documentType = isCompleted ? 'invoice' : 'acknowledgementReceipt';
  const selectedPrice = bookingDetails.selectedPrice ?? bookingDetails.price;
  const selectedAddOns = bookingDetails.selectedAddOns ?? [];
  const selectedAddOnPrices = bookingDetails.selectedAddOnPrices ?? [];
  const transactionTotal = selectedPrice + selectedAddOnPrices.reduce((sum, price) => sum + price, 0);
  const paidAmount = isCompleted ? transactionTotal : bookingDetails.paidAmount;
  const paymentLabel = isCompleted
    ? 'Full Payment'
    : paidAmount >= transactionTotal
      ? 'Full Payment (100%)'
      : 'Partial Downpayment (50%)';
  const documentAmount = transactionTotal;

  // Generate document number (format: INV/AR-YYYYMMDD-XXX)
  const now = new Date();
  const documentPrefix = documentType === 'invoice' ? 'INV' : 'AR';
  const invoiceNumber = `${documentPrefix}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

  const buildDocumentAmount = (amount: number) => Number(amount.toFixed(2));

  // Create document items from the actual selected service and add-ons.
  const items: InvoiceItem[] = [
    {
      description: bookingDetails.serviceName,
      quantity: 1,
      unitPrice: buildDocumentAmount(selectedPrice),
      total: buildDocumentAmount(selectedPrice),
    },
    ...selectedAddOns.map((addOn, index) => {
      const addOnAmount = selectedAddOnPrices[index] ?? 0;
      const documentAddOnAmount = buildDocumentAmount(addOnAmount);
      return {
        description: addOn,
        quantity: 1,
        unitPrice: documentAddOnAmount,
        total: documentAddOnAmount,
      };
    }),
  ];

  // Calculate document totals
  const grossAmount = documentAmount;
  const calculations = isVAT
    ? calculateVATInclusive(grossAmount, vatRate, discounts)
    : calculateNonVAT(grossAmount, discounts);

  return {
    ...bookingDetails,
    paidAmount,
    invoiceNumber,
    invoiceDate: now.toISOString(),
    documentType,
    paymentLabel,
    isNonRefundable: isCancelled,
    items,
    calculations,
    customerName,
    customerAddress,
    customerEmail,
    customerPhone,
    businessName,
    businessAddress,
    businessPhone,
    businessEmail,
    businessTIN,
    notes,
  };
}
