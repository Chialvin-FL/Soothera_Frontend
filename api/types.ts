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
    users: T[]; // backend currently names the array "users"
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

/** PUT /api/Authentication/change-email — request body. */
export interface ChangeEmailRequest {
    newEmail: string;
    firebaseToken: string;
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
}

/** PATCH /api/User/update-user/:uid — request body (all optional). */
export interface UpdateUserRequest {
    email?: string;
    firebaseToken?: string;
    fname?: string;
    lname?: string;
    role?: UserRole;
    profilePic?: string;
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
}

/**
 * POST /api/SalonEstablishment/add — request body.
 * Sent as FormData because it includes a file upload.
 */
export interface CreateSalonRequest {
    name: string;
    address: string;
    socials: string[];
    pictureFile: File;
    uid?: string; // optional — uses JWT UID if omitted
}

/**
 * PUT /api/SalonEstablishment/update/:id — request body.
 * Sent as FormData. All fields optional.
 */
export interface UpdateSalonRequest {
    name?: string;
    address?: string;
    socials?: string[];
    pictureFile?: File;
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

/** GET /api/DocumentUpload/get-user-docs — query params. */
export interface GetUserDocsParams {
    search?: string;
    status?: DocumentStatus;
    uploadedStart?: string;
    uploadedEnd?: string;
    updatedStart?: string;
    updatedEnd?: string;
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

export interface SalonServiceResponse {
    salonServiceId: string;
    uid: string;
    establishmentId: string;
    serviceName: string;
    description: string;
    category: string;
    price: number;
    durationMinutes: number;
    imageUrl: string;
    isActive: boolean;
    createdDate: string;
    updatedDate: string;
    updatedBy: string;
}

export interface CreateSalonServiceRequest {
    uid?: string;
    establishmentId: string;
    serviceName: string;
    description: string;
    category: number;
    price: number;
    durationMinutes: number;
    imageFile?: File;
    isActive?: boolean;
}

export interface UpdateSalonServiceRequest {
    serviceName?: string;
    description?: string;
    category?: number;
    price?: number;
    durationMinutes?: number;
    imageFile?: File;
    isActive?: boolean;
    updatedBy?: string;
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
