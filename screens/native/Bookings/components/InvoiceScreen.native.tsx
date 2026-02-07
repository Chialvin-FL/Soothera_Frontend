import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { InvoiceData } from '../types/Invoice';
import {
  calculateVATInclusive,
  calculateNonVAT,
  formatCurrency,
  formatDate,
} from '../utils/invoiceCalculations';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SuccessModal } from '@/components/native/SuccessModal';
import { STORAGE_KEYS } from '@/env';

// Invoice Registry Types
interface InvoiceMetadata {
  uri: string;
  fileName: string;
  downloadDate: string;
  folderUri: string;
}

type InvoiceRegistry = Record<string, InvoiceMetadata>;

interface InvoiceScreenProps {
  invoiceData: InvoiceData;
  onBack: () => void;
  isVAT?: boolean; // Whether this invoice is VAT or Non-VAT
  vatRate?: number; // VAT rate (default 0.12 for 12%)
  discounts?: number; // Discount amount
}

export default function InvoiceScreen({
  invoiceData,
  onBack,
  isVAT = false,
  vatRate = 0.12,
  discounts = 0,
}: InvoiceScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  // Calculate invoice based on VAT or Non-VAT
  // Use the gross amount from calculations if available, otherwise calculate from items
  const grossAmount = invoiceData.calculations?.grossAmount || 
    invoiceData.items.reduce((sum, item) => sum + item.total, 0);
  
  const calculations = isVAT
    ? calculateVATInclusive(grossAmount, vatRate, discounts)
    : calculateNonVAT(grossAmount, discounts);

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [sootheraFolderUri, setSootheraFolderUri] = useState<string | null>(null);
  const [existingInvoice, setExistingInvoice] = useState<InvoiceMetadata | null>(null);
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);
  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    variant: 'success' | 'error';
  }>({ visible: false, title: '', message: '', variant: 'success' });

  const showSuccessModal = (title: string, message: string, variant: 'success' | 'error' = 'success') => {
    setSuccessModal({ visible: true, title, message, variant });
  };

  const hideSuccessModal = () => {
    setSuccessModal((prev) => ({ ...prev, visible: false }));
  };

  // Load invoice registry
  const loadInvoiceRegistry = async (): Promise<InvoiceRegistry> => {
    try {
      const registryJson = await AsyncStorage.getItem(STORAGE_KEYS.INVOICE_REGISTRY);
      return registryJson ? JSON.parse(registryJson) : {};
    } catch (error) {
      console.error('Error loading invoice registry:', error);
      return {};
    }
  };

  // Save invoice registry
  const saveInvoiceRegistry = async (registry: InvoiceRegistry): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.INVOICE_REGISTRY, JSON.stringify(registry));
    } catch (error) {
      console.error('Error saving invoice registry:', error);
    }
  };

  // Check if invoice already exists
  const checkExistingInvoice = async () => {
    setIsCheckingExisting(true);
    try {
      const registry = await loadInvoiceRegistry();
      const invoiceNumber = invoiceData.invoiceNumber;
      const metadata = registry[invoiceNumber];

      if (metadata) {
        // Verify file still exists
        try {
          if (Platform.OS === 'android') {
            // For Android SAF URIs, we can try to read file info
            const fileInfo = await FileSystem.getInfoAsync(metadata.uri);
            if (fileInfo.exists) {
              setExistingInvoice(metadata);
            } else {
              // File was deleted, remove from registry
              delete registry[invoiceNumber];
              await saveInvoiceRegistry(registry);
              setExistingInvoice(null);
            }
          } else {
            // iOS
            const fileInfo = await FileSystem.getInfoAsync(metadata.uri);
            if (fileInfo.exists) {
              setExistingInvoice(metadata);
            } else {
              delete registry[invoiceNumber];
              await saveInvoiceRegistry(registry);
              setExistingInvoice(null);
            }
          }
        } catch (verifyError) {
          // File doesn't exist or can't be accessed
          console.log('Invoice file not accessible, will re-download');
          delete registry[invoiceNumber];
          await saveInvoiceRegistry(registry);
          setExistingInvoice(null);
        }
      }
    } catch (error) {
      console.error('Error checking existing invoice:', error);
    } finally {
      setIsCheckingExisting(false);
    }
  };

  // Save invoice metadata to registry
  const saveInvoiceMetadata = async (uri: string, fileName: string, folderUri: string) => {
    try {
      const registry = await loadInvoiceRegistry();
      registry[invoiceData.invoiceNumber] = {
        uri,
        fileName,
        downloadDate: new Date().toISOString(),
        folderUri,
      };
      await saveInvoiceRegistry(registry);
      setExistingInvoice(registry[invoiceData.invoiceNumber]);
    } catch (error) {
      console.error('Error saving invoice metadata:', error);
    }
  };

  // Load saved folder URI and check for existing invoice on mount
  useEffect(() => {
    const initialize = async () => {
      if (Platform.OS === 'android') {
        const savedUri = await AsyncStorage.getItem(STORAGE_KEYS.SOOTHERA_FOLDER_URI);
        if (savedUri) {
          setSootheraFolderUri(savedUri);
        }
      }
      await checkExistingInvoice();
    };
    initialize();
  }, []);

  // Setup Soothera folder on Android (one-time)
  const setupSootheraFolder = async (): Promise<string | null> => {
    if (Platform.OS !== 'android') return null;

    // Request directory access (user picks Downloads or any folder)
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    
    if (!permissions.granted) {
      showSuccessModal('Permission Required', 'Please select a folder (Downloads recommended) to save invoices.', 'error');
      return null;
    }

      try {
        // Create "Soothera" subfolder in the selected directory
        const sootheraFolder = await FileSystem.StorageAccessFramework.makeDirectoryAsync(
          permissions.directoryUri,
          'Soothera'
        );

        // Save the folder URI for future use
        await AsyncStorage.setItem(STORAGE_KEYS.SOOTHERA_FOLDER_URI, sootheraFolder);
        setSootheraFolderUri(sootheraFolder);

        return sootheraFolder;
      } catch (folderError) {
        console.error('Error creating Soothera folder (may already exist):', folderError);
        // Folder might already exist, try to use the granted directory
        await AsyncStorage.setItem(STORAGE_KEYS.SOOTHERA_FOLDER_URI, permissions.directoryUri);
        setSootheraFolderUri(permissions.directoryUri);
        return permissions.directoryUri;
      }
  };

  // Open existing invoice
  const openExistingInvoice = async () => {
    if (!existingInvoice) return;

    try {
      setIsGeneratingPDF(true);

      if (Platform.OS === 'android') {
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: existingInvoice.uri,
          flags: 1,
          type: 'application/pdf',
        });
      } else {
        await Linking.openURL(existingInvoice.uri);
      }

      showSuccessModal('Invoice Opened', `Opened existing invoice:\n\nFile path: Soothera/${existingInvoice.fileName}`);
    } catch (error) {
      console.error('Error opening existing invoice:', error);
      showSuccessModal('Error', 'Failed to open invoice. The file may have been moved or deleted.', 'error');
      // Remove from registry since it's not accessible
      const registry = await loadInvoiceRegistry();
      delete registry[invoiceData.invoiceNumber];
      await saveInvoiceRegistry(registry);
      setExistingInvoice(null);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Generate PDF from HTML
  const generatePDF = async () => {
    try {
      setIsGeneratingPDF(true);

      const html = generateInvoiceHTML(invoiceData, calculations, isVAT, vatRate);

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html,
        width: 612, // 8.5 inches * 72 points/inch (A4 width)
        height: 792, // 11 inches * 72 points/inch (A4 height)
        base64: false,
      });

      // Create filename with invoice number and timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `Invoice_${invoiceData.invoiceNumber}_${timestamp}.pdf`;

      let savedUri: string = uri;

      if (Platform.OS === 'android') {
        // Android: Save to Soothera folder in user-accessible storage
        let folderUri = sootheraFolderUri;

        // If no folder setup yet, set it up (one-time)
        if (!folderUri) {
          folderUri = await setupSootheraFolder();
          if (!folderUri) {
            // User cancelled folder selection
            return;
          }
        }

        try {
          // Create the PDF file in the Soothera folder
          savedUri = await FileSystem.StorageAccessFramework.createFileAsync(
            folderUri,
            fileName,
            'application/pdf'
          );

          // Read the generated PDF and write it to the selected location
          const fileContent = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          await FileSystem.writeAsStringAsync(savedUri, fileContent, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Verify file was created
          console.log('PDF saved to:', savedUri);

          // Save to registry
          await saveInvoiceMetadata(savedUri, fileName, folderUri);
        } catch (saveError) {
          console.error('Error saving to Soothera folder:', saveError);
          showSuccessModal('Error', 'Failed to save PDF. Please try again.', 'error');
          return;
        }
      } else {
        // iOS: Save to app's document directory in a "Soothera" folder
        const documentsDir = FileSystem.documentDirectory;
        if (!documentsDir) {
          throw new Error('Document directory not available');
        }

        // Create "Soothera" folder if it doesn't exist
        const folderPath = `${documentsDir}Soothera/`;
        const folderInfo = await FileSystem.getInfoAsync(folderPath);
        if (!folderInfo.exists) {
          await FileSystem.makeDirectoryAsync(folderPath, { intermediates: true });
        }

        savedUri = `${folderPath}${fileName}`;
        await FileSystem.copyAsync({ from: uri, to: savedUri });

        // Save to registry (iOS)
        await saveInvoiceMetadata(savedUri, fileName, folderPath);
      }

      // Automatically open the PDF file
      try {
        if (Platform.OS === 'android') {
          // Open the saved file using IntentLauncher
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: savedUri, // Use the SAF URI directly
            flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
            type: 'application/pdf',
          });
        } else {
          // iOS: Use Linking to open
          await Linking.openURL(savedUri);
        }
        
        showSuccessModal('PDF Downloaded', `Invoice saved and opened successfully!\n\nFile path: Soothera/${fileName}`);
      } catch (openError) {
        console.error('Error opening PDF:', openError);
        showSuccessModal('PDF Downloaded', `Invoice saved successfully!\n\nFile path: Soothera/${fileName}\n\nYou can find it in your file manager.`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      showSuccessModal('Error', `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Generate HTML for PDF
  const generateInvoiceHTML = (
    data: InvoiceData,
    calc: typeof calculations,
    isVAT: boolean,
    vatRate: number
  ): string => {
    const businessName = data.businessName || 'Soothera';
    const businessAddress = data.businessAddress || 'Cebu, Philippines';
    const businessPhone = data.businessPhone || '';
    const businessEmail = data.businessEmail || '';
    const businessTIN = data.businessTIN || '';

    const customerName = data.customerName || 'Customer';
    const customerAddress = data.customerAddress || '';
    const customerEmail = data.customerEmail || '';
    const customerPhone = data.customerPhone || '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      font-size: 12px;
      color: #333;
      padding: 40px;
      background: white;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid ${primaryColor};
    }
    .business-info {
      flex: 1;
    }
    .business-name {
      font-size: 24px;
      font-weight: bold;
      color: ${primaryColor};
      margin-bottom: 10px;
    }
    .invoice-title {
      font-size: 32px;
      font-weight: bold;
      color: ${primaryColor};
      text-align: right;
    }
    .invoice-meta {
      text-align: right;
      margin-top: 10px;
    }
    .invoice-meta p {
      margin: 3px 0;
      color: #666;
    }
    .customer-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
    }
    .customer-info, .bill-to {
      flex: 1;
    }
    .section-title {
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 10px;
      color: ${primaryColor};
    }
    .info-line {
      margin: 5px 0;
      color: #555;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .items-table th {
      background: ${primaryColor};
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }
    .items-table tr:nth-child(even) {
      background: #f9f9f9;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .totals-section {
      margin-left: auto;
      width: 350px;
      margin-bottom: 30px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #ddd;
    }
    .total-row.final {
      border-top: 2px solid ${primaryColor};
      border-bottom: 2px solid ${primaryColor};
      font-weight: bold;
      font-size: 16px;
      padding: 12px 0;
      margin-top: 10px;
    }
    .total-label {
      font-weight: bold;
    }
    .notes-section {
      margin-top: 30px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 8px;
    }
    .notes-title {
      font-weight: bold;
      margin-bottom: 10px;
      color: ${primaryColor};
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #666;
      font-size: 10px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="business-info">
        <div class="business-name">${businessName}</div>
        <p>${businessAddress}</p>
        ${businessPhone ? `<p>Phone: ${businessPhone}</p>` : ''}
        ${businessEmail ? `<p>Email: ${businessEmail}</p>` : ''}
        ${businessTIN ? `<p>TIN: ${businessTIN}</p>` : ''}
      </div>
      <div>
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-meta">
          <p><strong>Invoice #:</strong> ${data.invoiceNumber}</p>
          <p><strong>Date:</strong> ${formatDate(data.invoiceDate)}</p>
          <p><strong>Booking ID:</strong> ${data.bookingId}</p>
        </div>
      </div>
    </div>

    <div class="customer-section">
      <div class="customer-info">
        <div class="section-title">Customer Information</div>
        <p class="info-line"><strong>Name:</strong> ${customerName}</p>
        ${customerAddress ? `<p class="info-line"><strong>Address:</strong> ${customerAddress}</p>` : ''}
        ${customerEmail ? `<p class="info-line"><strong>Email:</strong> ${customerEmail}</p>` : ''}
        ${customerPhone ? `<p class="info-line"><strong>Phone:</strong> ${customerPhone}</p>` : ''}
      </div>
      <div class="bill-to">
        <div class="section-title">Service Details</div>
        <p class="info-line"><strong>Service:</strong> ${data.serviceName}</p>
        <p class="info-line"><strong>Spa:</strong> ${data.spaName}</p>
        <p class="info-line"><strong>Therapist:</strong> ${data.therapistName}</p>
        <p class="info-line"><strong>Date:</strong> ${data.date}</p>
        <p class="info-line"><strong>Time:</strong> ${data.time}</p>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th class="text-center">Qty</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${data.items
          .map(
            (item) => `
        <tr>
          <td>${item.description}</td>
          <td class="text-center">${item.quantity}</td>
          <td class="text-right">${formatCurrency(item.unitPrice)}</td>
          <td class="text-right">${formatCurrency(item.total)}</td>
        </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="totals-section">
      ${isVAT ? `
      <div class="total-row">
        <span class="total-label">Vatable Sales:</span>
        <span>${formatCurrency(calc.vatableSales || 0)}</span>
      </div>
      <div class="total-row">
        <span class="total-label">VAT (${(vatRate * 100).toFixed(0)}%):</span>
        <span>${formatCurrency(calc.vatAmount || 0)}</span>
      </div>
      ` : `
      <div class="total-row">
        <span class="total-label">Total Sales:</span>
        <span>${formatCurrency(calc.totalSales || 0)}</span>
      </div>
      ${discounts > 0 ? `
      <div class="total-row">
        <span class="total-label">Less: Discounts:</span>
        <span>${formatCurrency(discounts)}</span>
      </div>
      ` : ''}
      `}
      <div class="total-row final">
        <span class="total-label">Total Amount Due:</span>
        <span>${formatCurrency(calc.totalAmountDue)}</span>
      </div>
      ${data.paidAmount > 0 ? `
      <div class="total-row">
        <span class="total-label">Paid Amount:</span>
        <span>${formatCurrency(data.paidAmount)}</span>
      </div>
      <div class="total-row">
        <span class="total-label">Balance:</span>
        <span>${formatCurrency(calc.totalAmountDue - data.paidAmount)}</span>
      </div>
      ` : ''}
    </div>

    ${data.notes ? `
    <div class="notes-section">
      <div class="notes-title">Notes</div>
      <p>${data.notes}</p>
    </div>
    ` : ''}

    <div class="footer">
      <p>Thank you for your business!</p>
      <p>This is a computer-generated invoice.</p>
    </div>
  </div>
</body>
</html>
    `;
  };

  // Custom header component (non-transparent version of TransparentHeader)
  const InvoiceHeader = () => (
    <View 
      className="absolute left-0 right-0 flex-row items-center px-5 py-4 z-10"
      style={{ 
        backgroundColor: colors.background,
        top: 0,
        paddingTop: insets.top,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
      }}
    >
      <TouchableOpacity 
        onPress={onBack} 
        className="w-10 h-10 items-center justify-center rounded-full mr-3"
        style={{ backgroundColor: colors.background === '#fff' ? '#F3F4F6' : '#2a2a2a' }}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text className="text-lg font-semibold" style={{ color: colors.text }}>
        Invoice
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white dark:bg-[#151718]">
      <InvoiceHeader />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingTop: insets.top + 45, // Top safe area + header height
          paddingBottom: insets.bottom + 100,
          paddingLeft: Math.max(insets.left, 0), // Horizontal safe area
          paddingRight: Math.max(insets.right, 0),
        }}
      >
        {/* Invoice Header */}
        <View className="px-5 py-4 border-b" style={{ borderBottomColor: '#E5E7EB' }}>
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>
                {invoiceData.businessName || 'Soothera'}
              </Text>
              <Text className="text-sm" style={{ color: colors.icon }}>
                {invoiceData.businessAddress || 'Cebu, Philippines'}
              </Text>
              {invoiceData.businessPhone && (
                <Text className="text-sm" style={{ color: colors.icon }}>
                  Phone: {invoiceData.businessPhone}
                </Text>
              )}
              {invoiceData.businessEmail && (
                <Text className="text-sm" style={{ color: colors.icon }}>
                  Email: {invoiceData.businessEmail}
                </Text>
              )}
              {invoiceData.businessTIN && (
                <Text className="text-sm" style={{ color: colors.icon }}>
                  TIN: {invoiceData.businessTIN}
                </Text>
              )}
            </View>
            <View className="items-end">
              <Text className="text-3xl font-bold mb-2" style={{ color: primaryColor }}>
                INVOICE
              </Text>
              <Text className="text-sm" style={{ color: colors.icon }}>
                Invoice #: {invoiceData.invoiceNumber}
              </Text>
              <Text className="text-sm" style={{ color: colors.icon }}>
                Date: {formatDate(invoiceData.invoiceDate)}
              </Text>
              <Text className="text-sm" style={{ color: colors.icon }}>
                Booking ID: {invoiceData.bookingId}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer & Service Info */}
        <View className="px-5 py-4 bg-gray-50 dark:bg-[#2a2a2a] mx-5 mt-4 rounded-xl">
          <View className="flex-row justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-base font-semibold mb-2" style={{ color: primaryColor }}>
                Customer Information
              </Text>
              <Text className="text-sm mb-1" style={{ color: colors.text }}>
                <Text className="font-semibold">Name:</Text> {invoiceData.customerName || 'Customer'}
              </Text>
              {invoiceData.customerAddress && (
                <Text className="text-sm mb-1" style={{ color: colors.text }}>
                  <Text className="font-semibold">Address:</Text> {invoiceData.customerAddress}
                </Text>
              )}
              {invoiceData.customerEmail && (
                <Text className="text-sm mb-1" style={{ color: colors.text }}>
                  <Text className="font-semibold">Email:</Text> {invoiceData.customerEmail}
                </Text>
              )}
              {invoiceData.customerPhone && (
                <Text className="text-sm mb-1" style={{ color: colors.text }}>
                  <Text className="font-semibold">Phone:</Text> {invoiceData.customerPhone}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold mb-2" style={{ color: primaryColor }}>
                Service Details
              </Text>
              <Text className="text-sm mb-1" style={{ color: colors.text }}>
                <Text className="font-semibold">Service:</Text> {invoiceData.serviceName}
              </Text>
              <Text className="text-sm mb-1" style={{ color: colors.text }}>
                <Text className="font-semibold">Spa:</Text> {invoiceData.spaName}
              </Text>
              <Text className="text-sm mb-1" style={{ color: colors.text }}>
                <Text className="font-semibold">Therapist:</Text> {invoiceData.therapistName}
              </Text>
              <Text className="text-sm mb-1" style={{ color: colors.text }}>
                <Text className="font-semibold">Date:</Text> {invoiceData.date}
              </Text>
              <Text className="text-sm mb-1" style={{ color: colors.text }}>
                <Text className="font-semibold">Time:</Text> {invoiceData.time}
              </Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View className="px-5 py-4 mt-4">
          <View className="border rounded-xl overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
            {/* Table Header */}
            <View
              className="flex-row px-4 py-3"
              style={{ backgroundColor: primaryColor }}
            >
              <View className="flex-1">
                <Text className="text-sm font-semibold" style={{ color: 'white' }}>
                  Description
                </Text>
              </View>
              <View className="w-16 items-center">
                <Text className="text-sm font-semibold" style={{ color: 'white' }}>
                  Qty
                </Text>
              </View>
              <View className="w-24 items-end">
                <Text className="text-sm font-semibold" style={{ color: 'white' }}>
                  Unit Price
                </Text>
              </View>
              <View className="w-24 items-end">
                <Text className="text-sm font-semibold" style={{ color: 'white' }}>
                  Total
                </Text>
              </View>
            </View>

            {/* Table Rows */}
            {invoiceData.items.map((item, index) => (
              <View
                key={index}
                className="flex-row px-4 py-3 border-b"
                style={{
                  borderBottomColor: '#E5E7EB',
                  backgroundColor: index % 2 === 0 ? 'white' : '#F9F9F9',
                }}
              >
                <View className="flex-1">
                  <Text className="text-sm" style={{ color: colors.text }}>
                    {item.description}
                  </Text>
                </View>
                <View className="w-16 items-center">
                  <Text className="text-sm" style={{ color: colors.text }}>
                    {item.quantity}
                  </Text>
                </View>
                <View className="w-24 items-end">
                  <Text className="text-sm" style={{ color: colors.text }}>
                    {formatCurrency(item.unitPrice)}
                  </Text>
                </View>
                <View className="w-24 items-end">
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    {formatCurrency(item.total)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Totals Section */}
        <View className="px-5 py-4">
          <View className="items-end">
            <View className="w-full max-w-sm">
              {isVAT ? (
                <>
                  <View className="flex-row justify-between py-2 border-b" style={{ borderBottomColor: '#E5E7EB' }}>
                    <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                      Vatable Sales:
                    </Text>
                    <Text className="text-sm" style={{ color: colors.text }}>
                      {formatCurrency(calculations.vatableSales || 0)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between py-2 border-b" style={{ borderBottomColor: '#E5E7EB' }}>
                    <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                      VAT ({(vatRate * 100).toFixed(0)}%):
                    </Text>
                    <Text className="text-sm" style={{ color: colors.text }}>
                      {formatCurrency(calculations.vatAmount || 0)}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View className="flex-row justify-between py-2 border-b" style={{ borderBottomColor: '#E5E7EB' }}>
                    <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                      Total Sales:
                    </Text>
                    <Text className="text-sm" style={{ color: colors.text }}>
                      {formatCurrency(calculations.totalSales || 0)}
                    </Text>
                  </View>
                  {discounts > 0 && (
                    <View className="flex-row justify-between py-2 border-b" style={{ borderBottomColor: '#E5E7EB' }}>
                      <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                        Less: Discounts:
                      </Text>
                      <Text className="text-sm" style={{ color: colors.text }}>
                        {formatCurrency(discounts)}
                      </Text>
                    </View>
                  )}
                </>
              )}
              <View
                className="flex-row justify-between py-3 mt-2 border-t-2 border-b-2"
                style={{ borderTopColor: primaryColor, borderBottomColor: primaryColor }}
              >
                <Text className="text-lg font-bold" style={{ color: primaryColor }}>
                  Total Amount Due:
                </Text>
                <Text className="text-lg font-bold" style={{ color: primaryColor }}>
                  {formatCurrency(calculations.totalAmountDue)}
                </Text>
              </View>
              {invoiceData.paidAmount > 0 && (
                <>
                  <View className="flex-row justify-between py-2 border-b" style={{ borderBottomColor: '#E5E7EB' }}>
                    <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                      Paid Amount:
                    </Text>
                    <Text className="text-sm" style={{ color: colors.text }}>
                      {formatCurrency(invoiceData.paidAmount)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                      Balance:
                    </Text>
                    <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                      {formatCurrency(calculations.totalAmountDue - invoiceData.paidAmount)}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Notes */}
        {invoiceData.notes && (
          <View className="px-5 py-4">
            <View className="bg-gray-50 dark:bg-[#2a2a2a] p-4 rounded-xl">
              <Text className="text-base font-semibold mb-2" style={{ color: primaryColor }}>
                Notes
              </Text>
              <Text className="text-sm" style={{ color: colors.text }}>
                {invoiceData.notes}
              </Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View className="px-5 py-4 mt-4">
          <View className="items-center border-t pt-4" style={{ borderTopColor: '#E5E7EB' }}>
            <Text className="text-sm" style={{ color: colors.icon }}>
              Thank you for your business!
            </Text>
            <Text className="text-xs mt-1" style={{ color: colors.icon }}>
              This is a computer-generated invoice.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Download/Open PDF Button */}
      <View
        className="px-5 py-4 border-t absolute bottom-0 left-0 right-0"
        style={{
          borderTopColor: '#E5E7EB',
          backgroundColor: colors.background,
          paddingBottom: insets.bottom + 16,
          paddingLeft: Math.max(insets.left, 0), // Horizontal safe area
          paddingRight: Math.max(insets.right, 0),
        }}
      >
        <TouchableOpacity
          className="w-full flex-row items-center justify-center px-4 py-4 rounded-xl"
          style={{ backgroundColor: primaryColor }}
          onPress={existingInvoice ? openExistingInvoice : generatePDF}
          disabled={isGeneratingPDF || isCheckingExisting}
        >
          <Ionicons
            name={isGeneratingPDF ? 'hourglass-outline' : existingInvoice ? 'open-outline' : 'download-outline'}
            size={20}
            color="white"
          />
          <Text className="text-base text-white font-semibold ml-2">
            {isGeneratingPDF 
              ? (existingInvoice ? 'Opening PDF...' : 'Generating PDF...') 
              : existingInvoice 
                ? 'Open Invoice as PDF' 
                : 'Download Invoice as PDF'}
          </Text>
        </TouchableOpacity>
      </View>

      <SuccessModal
        visible={successModal.visible}
        title={successModal.title}
        message={successModal.message}
        variant={successModal.variant}
        onClose={hideSuccessModal}
      />
    </View>
  );
}
