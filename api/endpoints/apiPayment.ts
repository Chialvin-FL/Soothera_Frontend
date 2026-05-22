import axiosClient from '../axiosClient';
import { API_ENDPOINTS } from '../config';
import type {
  CreatePaymentRequest,
  UpdatePaymentRequest,
  GetPaymentsParams,
  GetPaymentsResponse,
  PaymentMutationResponse,
} from '../types';

// ---------------------------------------------------------------------------
// Payment Endpoints
// Base route: /api/Payment
// All endpoints require [Authorize] (Bearer token)
// ---------------------------------------------------------------------------

const BASE = API_ENDPOINTS.PAYMENT;
const PAYMENT_RESPONSE_CONFIG = {
  validateStatus: (status: number) => status !== 401,
};

type CreatePaymentDto = {
  BookingId: string;
  PaymentType: number;
  CardNumber: string;
  CVV: string;
  ExpiryDate: string;
  BillingName: string;
};

type UpdatePaymentDto = {
  CardNumber?: string;
  CVV?: string;
  ExpiryDate?: string;
  BillingName?: string;
};

function buildCreatePaymentDto(payload: CreatePaymentRequest): CreatePaymentDto {
  return {
    BookingId: payload.bookingId,
    PaymentType: payload.paymentType,
    CardNumber: payload.cardNumber,
    CVV: payload.cvv,
    ExpiryDate: payload.expiryDate,
    BillingName: payload.billingName,
  };
}

function buildUpdatePaymentDto(payload: UpdatePaymentRequest): UpdatePaymentDto {
  const dto: UpdatePaymentDto = {};

  if (payload.cardNumber != null) dto.CardNumber = payload.cardNumber;
  if (payload.cvv != null) dto.CVV = payload.cvv;
  if (payload.expiryDate != null) dto.ExpiryDate = payload.expiryDate;
  if (payload.billingName != null) dto.BillingName = payload.billingName;

  return dto;
}

/**
 * POST /api/Payment/create-payment
 * Creates and processes a payment for the authenticated customer.
 *
 * Backend derives CustomerId from the Bearer token and accepts:
 * BookingId, PaymentType, CardNumber, CVV, ExpiryDate, BillingName.
 */
export async function createPayment(
  payload: CreatePaymentRequest
): Promise<PaymentMutationResponse> {
  console.log(
    '[apiPayment] createPayment: payload =',
    JSON.stringify({
      bookingId: payload.bookingId,
      paymentType: payload.paymentType,
      billingName: payload.billingName,
    })
  );
  console.log('[apiPayment] createPayment: sending POST to', BASE.CREATE);

  const { data } = await axiosClient.post<PaymentMutationResponse>(
    BASE.CREATE,
    buildCreatePaymentDto(payload),
    PAYMENT_RESPONSE_CONFIG
  );

  console.log(
    '[apiPayment] createPayment: response =',
    JSON.stringify({
      success: data.success,
      statusCode: data.statusCode,
      message: data.message,
      id: data.id,
      hasInvoice: !!data.invoice,
    })
  );
  return data;
}

/**
 * GET /api/Payment/get-payments
 * Retrieves payments with optional filters and pagination.
 *
 * Filters: paymentId, bookingId, customerId, status
 * Pagination: page (default 1), pageSize (default 10)
 */
export async function getPayments(params?: GetPaymentsParams): Promise<GetPaymentsResponse> {
  console.log('[apiPayment] getPayments: params =', JSON.stringify(params ?? {}));
  console.log('[apiPayment] getPayments: sending GET to', BASE.LIST);

  const { data } = await axiosClient.get<GetPaymentsResponse>(BASE.LIST, {
    params,
    ...PAYMENT_RESPONSE_CONFIG,
  });

  console.log(
    '[apiPayment] getPayments: response =',
    JSON.stringify({
      success: data.success,
      message: data.message,
      totalCount: data.data?.totalCount,
      itemCount: data.data?.items?.length,
    })
  );
  return data;
}

/**
 * GET /api/Payment/get-payments?paymentId=...
 * Convenience wrapper to fetch a single payment by its ID.
 */
export async function getPaymentById(paymentId: string): Promise<GetPaymentsResponse> {
  return getPayments({ paymentId });
}

/**
 * PUT /api/Payment/update-payment/:id
 * Retries/updates an existing failed payment with optional new card details.
 */
export async function updatePayment(
  id: string,
  payload: UpdatePaymentRequest
): Promise<PaymentMutationResponse> {
  console.log(
    '[apiPayment] updatePayment: id =',
    id,
    '| payload =',
    JSON.stringify({
      hasCardNumber: payload.cardNumber != null,
      hasCvv: payload.cvv != null,
      hasExpiryDate: payload.expiryDate != null,
      billingName: payload.billingName,
    })
  );
  console.log('[apiPayment] updatePayment: sending PUT to', BASE.UPDATE(id));

  const { data } = await axiosClient.put<PaymentMutationResponse>(
    BASE.UPDATE(id),
    buildUpdatePaymentDto(payload),
    PAYMENT_RESPONSE_CONFIG
  );

  console.log(
    '[apiPayment] updatePayment: response =',
    JSON.stringify({
      success: data.success,
      statusCode: data.statusCode,
      message: data.message,
      id: data.id,
      hasInvoice: !!data.invoice,
    })
  );
  return data;
}

/**
 * DELETE /api/Payment/delete-payment/:id
 * Deletes a payment by its document ID and lets the backend recalculate booking payment status.
 */
export async function deletePayment(id: string): Promise<PaymentMutationResponse> {
  console.log('[apiPayment] deletePayment: id =', id);
  console.log('[apiPayment] deletePayment: sending DELETE to', BASE.DELETE(id));

  const { data } = await axiosClient.delete<PaymentMutationResponse>(
    BASE.DELETE(id),
    PAYMENT_RESPONSE_CONFIG
  );

  console.log('[apiPayment] deletePayment: response =', JSON.stringify(data));
  return data;
}
