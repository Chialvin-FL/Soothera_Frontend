import { getUsers, updateUser, deleteUser } from '../api/endpoints/apiUser';
import { register } from '../api/endpoints/apiAuth';
import type { UserDto, GetUsersParams, UpdateUserRequest, RegisterRequest } from '../api/types';

export const DEFAULT_USER_PASSWORD = 'String123!';

export async function fetchUsersList(params?: GetUsersParams) {
    try {
        const response = await getUsers(params);
        return response;
    } catch (error) {
        console.error('[UserService] fetchUsersList error:', error);
        throw error;
    }
}

export async function createNewAccount(email: string, role: number, fname: string, lname: string, phoneNumber?: string) {
    try {
        // 1. Register the account with default password
        const registerPayload: RegisterRequest = {
            email,
            password: DEFAULT_USER_PASSWORD,
            role,
        };
        const regRes = await register(registerPayload);

        if (!regRes.success || !regRes.user) {
            return regRes;
        }

        // 2. Update the profile with names and phone
        const updatePayload: UpdateUserRequest = {
            fname,
            lname,
            phoneNumber,
        };
        const updateRes = await updateUser(regRes.user.uid, updatePayload);
        
        return {
            ...updateRes,
            message: regRes.message // Preserve registration success message if needed
        };
    } catch (error) {
        console.error('[UserService] createNewAccount error:', error);
        throw error;
    }
}

export async function updateUserDetails(uid: string, data: UpdateUserRequest) {
    try {
        const response = await updateUser(uid, data);
        return response;
    } catch (error) {
        console.error('[UserService] updateUserDetails error:', error);
        throw error;
    }
}

export async function removeUserByUid(uid: string) {
    try {
        const response = await deleteUser(uid);
        return response;
    } catch (error) {
        console.error('[UserService] removeUserByUid error:', error);
        throw error;
    }
}
