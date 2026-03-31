/**
 * Role label helpers for Soothera.
 * Converts numeric UserRole enums from backend to UI strings.
 */

export function getRoleLabel(role: number): string {
    switch (role) {
        case 0: return 'superadmin';
        case 1: return 'admin';
        case 2: return 'therapist';
        case 3: return 'customer';
        default: return 'customer';
    }
}

export function getRoleName(role: number): string {
    switch (role) {
        case 0: return 'Super Admin';
        case 1: return 'Admin';
        case 2: return 'Therapist';
        case 3: return 'Customer';
        default: return 'Customer';
    }
}
