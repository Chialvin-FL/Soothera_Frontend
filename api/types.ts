// ─────────────────────────────────────────────────────────────
// Global API Response Types
// Mirrors the backend's StatusResponse + pagination contracts
// ─────────────────────────────────────────────────────────────

/**
 * Standard API response wrapper.
 * Every endpoint returns this shape from the backend (StatusResponse).
 *
 * @template T - The type of the optional `data` payload.
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    statusCode: number;
    data: T | null;
}

// ─── Pagination ──────────────────────────────────────────────

/** Pagination metadata returned by paginated endpoints. */
export interface PaginationMeta {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/** Paginated list wrapper (matches PaginatedUsersResponse shape). */
export interface PaginatedResponse<T> extends PaginationMeta {
    items: T[]; // matches backend's Items
}

/** Query params accepted by paginated endpoints. */
export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

// ─── Auth ────────────────────────────────────────────────────

/** POST /api/Authentication/login  — request body. */
export interface LoginRequest {
    email: string;
    password: string;
}

/** POST /api/Authentication/register — request body. */
export interface RegisterRequest {
    email: string;
    password: string;
    role: UserRole;
}

/** POST /api/Authentication/forgot-password — request body. */
export interface ForgotPasswordRequest {
    email: string;
}

/** PUT /api/Authentication/change-password — request body. */
export interface ChangePasswordRequest {
    newPassword: string;
    firebaseToken: string;
}

/** Backend mUser representation */
export interface MUser {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    role: number;
    profilePicture: string | null;
    createdAt: number;
    /** Populated for therapists (role 2) — the establishment they belong to */
    establishmentId?: string | null;
}

/** GET /api/User/get-user etc response body (using standard envelope) */
export interface UserResponse {
    uid: string;
    fullName: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profilePicture: string | null;
    role: string;
    createdAt: string;
    status: string;
}

/** Response from login exactly matching LoginResponseDTO */
export interface LoginResponse {
    success: boolean;
    statusCode: number;
    message: string;
    token: string;
    user: MUser;
}

/** Response from register exactly matching RegisterResponseDTO */
export interface RegisterResponse {
    success: boolean;
    statusCode: number;
    message: string;
    user: MUser;
}

// ─── User ────────────────────────────────────────────────────

/** User roles as defined in the backend. */
export enum UserRole {
    SuperAdmin = 0,
    Admin = 1,
    Therapist = 2,
    Customer = 3,
}

/** POST /api/User/create-user — request body. */
export interface CreateUserRequest {
    fname: string;
    lname: string;
    role: UserRole;
    phoneNumber?: string;
}

/** PUT /api/User/update-user/:uid — request body (all optional). Sent as FormData. */
export interface UpdateUserRequest {
    email?: string;
    firebaseToken?: string;
    fname?: string;
    lname?: string;
    role?: UserRole;
    /** RN ImagePicker asset or web File for profile picture upload */
    profilePic?: { uri: string; name: string; type: string } | File;
    phoneNumber?: string;
    /** 0 = Disable, 1 = Active */
    status?: UserStatus;
}

/** User DTO matching the backend's UserResponseDTO. */
export interface UserDto {
    uid: string;
    fullName: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profilePicture: string | null;
    role: string;
    createdAt: string;
    status: string;
}

/** GET /api/User/get-user — query params. */
export interface GetUsersParams extends PaginationParams {
    uid?: string;
    role?: number;
    fname?: string;
    lname?: string;
}

// ─── Salon Establishment ─────────────────────────────────────

/** Salon establishment model returned by the backend. */
export interface SalonEstablishment {
    id: string;
    name: string;
    address: string;
    salonPicture: string;
    socials: string[];
    uid: string;
    createdAt: string;
    description?: string | null;
    contactNumber?: string | null;
    businessHours?: string | null;
}

/**
 * POST /api/Establishment/add — request body.
 * Sent as FormData because it includes a file upload.
 */
export interface CreateSalonRequest {
    name: string;
    address: string;
    socials: string[];
    pictureFile?: File | { uri: string; name: string; type: string };
    uid?: string; // optional — uses JWT UID if omitted
    description?: string;
    contactNumber?: string;
    businessHours?: string;
}

/**
 * PUT /api/Establishment/update/:id — request body.
 * Sent as FormData. All fields optional.
 */
export interface UpdateSalonRequest {
    name?: string;
    address?: string;
    socials?: string[];
    pictureFile?: File | { uri: string; name: string; type: string };
    description?: string;
    contactNumber?: string;
    businessHours?: string;
}

// ─── Document Upload ─────────────────────────────────────────

/** Document status enum. */
export enum DocumentStatus {
    Pending = 0,
    Verified = 1,
    Rejected = 2,
}

/** Document model returned by the backend. */
export interface UserDocument {
    uid: string;
    fullName: string;
    documentUrls: string[];
    status: DocumentStatus;
    statusName: string;
    remarks: string;
    uploadedAt: string;
    updatedAt: string;
    updatedBy: string;
}

/** POST /api/DocumentUpload/update-doc-status — request body. */
export interface DocumentStatusRequest {
    uid: string;
    status: DocumentStatus;
    remarks: string;
}

/** GET /api/DocumentUpload/get-user-docs — query params.
 *  Date fields are Unix epoch milliseconds (long? on the backend). */
export interface GetUserDocsParams {
    search?: string;
    status?: DocumentStatus;
    /** Unix epoch ms */
    uploadedStart?: number;
    /** Unix epoch ms */
    uploadedEnd?: number;
    /** Unix epoch ms */
    updatedStart?: number;
    /** Unix epoch ms */
    updatedEnd?: number;
}

/** Response data from check-my-docs. */
export interface CheckMyDocsData {
    documentCount: number;
    status: DocumentStatus;
    uploadedAt: string;
}

// ─── Identity Verification ───────────────────────────────────

/** Verification status enum. */
export enum VerificationStatus {
    Failed = 0,
    Passed = 1,
}

/** User status enum. */
export enum UserStatus {
    Disable = 0,
    Active = 1,
}

/** Identity verification model. */
export interface IdentityVerification {
    uid: string;
    idUrl: string;
    selfieUrl: string;
    uploadedAt: string;
    confidenceLevel: number;
    verifyStatus: number;
    statusName: string;
    verifiedAt: string;
}

/** Response data from verify-id endpoint. */
export interface FaceVerifyResultData {
    confidence: number;
    verifyStatus: number;
    statusName: string;
}

// ─── Salon Service ───────────────────────────────────────────

/**
 * Mirrors SalonServiceResponseDTO from the backend.
 * Price / DurationMinutes are arrays — each index is one pricing tier.
 * AddOns / AddOnPrices are parallel arrays of the same length.
 */
export interface SalonServiceResponse {
    salonServiceId: string;
    uid: string;
    establishmentName: string;
    serviceName: string;
    description: string;
    /** String representation of MassageCategory enum */
    category: string;
    /** One price per duration tier */
    price: number[];
    /** Duration in minutes for each tier */
    durationMinutes: number[];
    addOns: string[];
    addOnPrices: number[];
    imageUrl: string;
    isActive: boolean;
    createdDate: string;
    updatedDate: string;
    updatedBy: string;
}

/**
 * POST /api/SalonService/add-service — request body.
 * Sent as FormData ([FromForm]) because it includes an optional IFormFile.
 * Price / DurationMinutes are arrays (one entry per tier).
 * Optional TemplateServiceId skips Name/Description/Category if provided.
 */
export interface CreateSalonServiceRequest {
    templateServiceId?: string;
    serviceName?: string;
    description?: string;
    /** MassageCategory enum value (int) */
    category?: number;
    price: number[];
    durationMinutes: number[];
    addOns?: string[];
    addOnPrices?: number[];
    imageFile?: { uri: string; name: string; type: string } | File;
    isActive?: boolean;
}

/**
 * PUT /api/SalonService/update-service/:id — request body.
 * Sent as FormData. All fields optional.
 */
export interface UpdateSalonServiceRequest {
    serviceName?: string;
    description?: string;
    /** MassageCategory enum value (int) */
    category?: number;
    price?: number[];
    durationMinutes?: number[];
    addOns?: string[];
    addOnPrices?: number[];
    imageFile?: { uri: string; name: string; type: string } | File;
    isActive?: boolean;
    updatedBy?: string;
}

/** Query params for GET /api/SalonService/get-service. */
export interface GetSalonServicesParams extends PaginationParams {
    salonServiceId?: string;
    establishmentId?: string;
    category?: string;
    isActive?: boolean;
}

// ─── Error Handling ──────────────────────────────────────────

/**
 * Normalised API error thrown by the axios interceptor.
 * Always contains the backend's structured error when available,
 * or a fallback message for network / unknown errors.
 */
export interface ApiError {
    success: false;
    message: string;
    statusCode: number;
    data: null;
}

// UserData matches what we persist in AsyncStorage after login
export interface UserData {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    role: number;
    profilePicture: string | null;
    createdAt: number;
}

// ─── Staff Availability ───────────────────────────────────────

/**
 * Mirrors AvailabilityType enum from the backend.
 * 0 = OneTime, 1 = Recurring
 */
export enum AvailabilityType {
    OneTime = 0,
    Recurring = 1,
}

/**
 * Mirrors DayOfWeekEnum from the backend.
 * Sunday = 0 … Saturday = 6
 */
export enum DayOfWeekEnum {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6,
}

/**
 * POST /api/Staff — request body (CreateStaffDTO).
 * StartTime / EndTime must be "HH:mm:00" (24h with seconds).
 * For Recurring: supply daysOfWeek array (multi-day supported).
 * For OneTime:   supply specificDate in "M-dd-yyyy" format.
 */
export interface CreateStaffRequest {
    establishmentId: string;
    availabilityType: AvailabilityType;
    /** Required when availabilityType === Recurring */
    daysOfWeek?: DayOfWeekEnum[];
    /** Required when availabilityType === OneTime — format: "M-dd-yyyy" */
    specificDate?: string;
    /** Format: "HH:mm:00" */
    startTime: string;
    /** Format: "HH:mm:00" */
    endTime: string;
    isAvailable?: boolean;
}

/**
 * PUT /api/Staff/:id — request body (UpdateStaffDTO).
 * All fields optional — only provided fields are patched.
 */
export interface UpdateStaffRequest {
    availabilityType?: AvailabilityType;
    dayOfWeek?: DayOfWeekEnum;
    specificDate?: string;
    startTime?: string;
    endTime?: string;
    isAvailable?: boolean;
}

/** Single staff availability record (StaffResponseDTO). */
export interface StaffAvailability {
    id: string;
    establishmentId: string;
    establishmentName: string;
    staffId: string;
    staffName: string;
    /** "OneTime" | "Recurring" */
    availabilityType: string;
    /** Day name e.g. "Monday" — null for OneTime */
    dayOfWeek: string | null;
    /** Date string e.g. "4-15-2026" — null for Recurring */
    specificDate: string | null;
    /** "HH:mm:00" */
    startTime: string;
    /** "HH:mm:00" */
    endTime: string;
    isAvailable: boolean;
    createdDate: string;
    updatedDate: string;
}

/** Response shape from POST /api/Staff (CreateStaffResponseDTO). */
export interface CreateStaffResponse {
    success: boolean;
    statusCode: number;
    message: string;
    /** Last created ID (backward compat) */
    id: string | null;
    /** All created IDs when multiple days were submitted */
    ids: string[];
}

/** Query params for GET /api/Staff. */
export interface GetStaffParams extends PaginationParams {
    id?: string;
    establishmentId?: string;
    staffId?: string;
    /** "OneTime" | "Recurring" */
    availabilityType?: string;
    /** Day name e.g. "Monday" */
    dayOfWeek?: string;
    isAvailable?: boolean;
}

// ─── Booking ──────────────────────────────────────────────────

/**
 * Mirrors TherapistPref.TherapistPrefs enum from the backend.
 * 0 = AnyTherapist, 1 = MaleTherapist, 2 = FemaleTherapist
 */
export enum TherapistPref {
    AnyTherapist = 0,
    MaleTherapist = 1,
    FemaleTherapist = 2,
}

/**
 * POST /api/Booking/create-booking — request body.
 * Sent as FormData because it may include an IFormFile (IdImage).
 */
export interface CreateBookingRequest {
    establishmentId: string;
    salonServiceId: string;
    /** Index into the service's duration options array */
    selectedDurationIndex: number;
    /** Indices of selected add-ons in the service's add-on list */
    selectedAddOnIndices?: number[];
    therapistPref: TherapistPref;
    /** Specific staff UID — omit for "any therapist" */
    staffId?: string;
    /** Format: "M-dd-yyyy:HH:mm" */
    startTime: string;
    /** Comma-separated option names e.g. "PWD,HomeService" */
    options?: string;
    /** React Native ImagePicker asset for PWD/Senior ID image */
    idImage?: { uri: string; name: string; type: string } | File;
    latitude?: number;
    longitude?: number;
}

/**
 * PUT /api/Booking/update-booking/:id — request body.
 * Sent as JSON. All fields optional.
 */
export interface UpdateBookingRequest {
    /** Booking status string e.g. "Confirmed", "Cancelled", "Completed", "NoShow" */
    status?: string;
    /** Payment status string e.g. "Pending", "Paid", "Refunded" */
    paymentStatus?: string;
    /** Format: "M-dd-yyyy:HH:mm" */
    startTime?: string;
}

/** Query params for GET /api/Booking/get-booking. */
export interface GetBookingsParams extends PaginationParams {
    bookingId?: string;
    establishmentId?: string;
    customerId?: string;
    staffId?: string;
    /** e.g. "Pending", "Confirmed", "Cancelled", "Completed", "NoShow" */
    status?: string;
}

/**
 * Query params for GET /api/Booking/available-slots.
 * Either `date` OR both `startDate` + `endDate` must be provided.
 */
export interface GetAvailableSlotsParams {
    establishmentId: string;
    salonServiceId?: string;
    /** Single day — format: "M-dd-yyyy" */
    date?: string;
    /** Range start — format: "M-dd-yyyy" */
    startDate?: string;
    /** Range end   — format: "M-dd-yyyy" */
    endDate?: string;
    /** Override duration (0 = use service default) */
    durationMinutes?: number;
    staffId?: string;
}

/** Booking response data matching BookingResponseDTO. */
export interface BookingResponse {
    bookingId: string;
    establishmentName: string;
    establishmentAddress: string;
    salonServiceName: string;
    customerId: string;
    staffName: string | null;
    selectedPrice: number;
    selectedDurationMinutes: number;
    selectedAddOns: string[];
    selectedAddOnPrices: number[];
    totalPrice: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: string;
    paymentStatus: string;
    createdDate: string;
    updatedDate: string;
    /** Option names applied e.g. ["PWD", "HomeService"] */
    options: string[];
    idImageUrl: string | null;
    latitude: number | null;
    longitude: number | null;
    readableAddress: string | null;
}

/** Response from POST /api/Booking/create-booking (CreateBookingResponseDTO). */
export interface CreateBookingResponse {
    success: boolean;
    statusCode: number;
    message: string;
    /** Newly created booking document ID */
    id: string | null;
}

/** Available slots response — key is "M-dd-yyyy", value is list of "HH:mm" strings. */
export type AvailableSlotsData = Record<string, string[]>;
