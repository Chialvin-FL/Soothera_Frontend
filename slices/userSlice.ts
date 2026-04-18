import { useState, useCallback } from 'react';
import { fetchUsersList, createNewAccount, updateUserDetails, removeUserByUid } from '../service/userService';
import type { UserDto, UpdateUserRequest } from '../api/types';

export function useUserSlice() {
    const [users, setUsers] = useState<UserDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    const loadUsers = useCallback(async (searchParams?: { 
        fname?: string; 
        lname?: string; 
        role?: number; 
        page?: number; 
        pageSize?: number 
    }) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetchUsersList(searchParams);
            if (res.success && res.data) {
                setUsers(res.data.items);
                setTotalCount(res.data.totalCount);
            } else {
                setError(res.message);
            }
        } catch (e: any) {
            setError(e.message || 'Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createUser = async (data: { email: string; role: number; fname: string; lname: string; phoneNumber?: string }) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await createNewAccount(data.email, data.role, data.fname, data.lname, data.phoneNumber);
            if (!res.success) {
                setError(res.message);
            }
            return res.success;
        } catch (e: any) {
            setError(e.message || 'Failed to create user');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const editUser = async (uid: string, data: UpdateUserRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await updateUserDetails(uid, data);
            if (res.success) {
                // Optimistically update or just reload
                setUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...res.data } : u));
            } else {
                setError(res.message);
            }
            return res.success;
        } catch (e: any) {
            setError(e.message || 'Failed to update user');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteUser = async (uid: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await removeUserByUid(uid);
            if (res.success) {
                setUsers(prev => prev.filter(u => u.uid !== uid));
            } else {
                setError(res.message);
            }
            return res.success;
        } catch (e: any) {
            setError(e.message || 'Failed to delete user');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => setError(null);

    return {
        users,
        totalCount,
        isLoading,
        error,
        loadUsers,
        createUser,
        editUser,
        deleteUser,
        clearError,
    };
}
