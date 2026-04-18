import React, { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, Pressable, TextInput, ActivityIndicator, Modal } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useUserSlice } from '../../slices/userSlice';
import { getRoleName, getRoleLabel } from '../../utils/roleHelpers';
import type { UserDto, UserRole } from '../../api/types';

export default function UsersManagementWeb() {
    const {
        users,
        isLoading,
        error,
        loadUsers,
        createUser,
        editUser,
        deleteUser,
        clearError
    } = useUserSlice();

    // Local filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<number | null>(null);

    // Modal state
    const [isFormModalVisible, setIsFormModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

    // Form state
    const [formEmail, setFormEmail] = useState('');
    const [formFname, setFormFname] = useState('');
    const [formLname, setFormLname] = useState('');
    const [formRole, setFormRole] = useState<number>(3); // Default to Customer
    const [formPhone, setFormPhone] = useState('');

    useEffect(() => {
        loadUsers(); // Fetch all users once on mount
    }, [loadUsers]);

    // Client-side filtering logic
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            // Search filter
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = !searchQuery ||
                (user.firstName || '').toLowerCase().includes(searchLower) ||
                (user.lastName || '').toLowerCase().includes(searchLower) ||
                (user.fullName || '').toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower);

            // Role filter
            let matchesRole = true;
            if (roleFilter !== null) {
                const targetName = getRoleName(roleFilter).toLowerCase();
                const targetLabel = getRoleLabel(roleFilter).toLowerCase();
                const userRoleLower = (user.role || '').toLowerCase();
                
                matchesRole = userRoleLower === targetName || 
                             userRoleLower === targetLabel || 
                             userRoleLower === String(roleFilter);
            }

            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, roleFilter]);

    const handleSearch = () => {
        // No longer needed to fetch from server on every search
    };

    const openCreateModal = () => {
        setSelectedUser(null);
        setFormEmail('');
        setFormFname('');
        setFormLname('');
        setFormRole(3);
        setFormPhone('');
        setIsFormModalVisible(true);
    };

    const openEditModal = (user: UserDto) => {
        setSelectedUser(user);
        setFormEmail(user.email || '');
        setFormFname(user.firstName || '');
        setFormLname(user.lastName || '');
        // Map string role back to number if possible, or just use helper
        // Since the backend might return string role labels, we need careful mapping.
        // Assuming role string can be converted or we use a fallback.
        setFormRole(3); // In a real app we'd map 'Customer' -> 3
        setFormPhone(user.phoneNumber || '');
        setIsFormModalVisible(true);
    };

    const openDeleteModal = (user: UserDto) => {
        setSelectedUser(user);
        setIsDeleteModalVisible(true);
    };

    const onSubmitForm = async () => {
        if (selectedUser) {
            // Edit
            const success = await editUser(selectedUser.uid, {
                fname: formFname,
                lname: formLname,
                phoneNumber: formPhone,
            });
            if (success) setIsFormModalVisible(false);
        } else {
            // Create
            const success = await createUser({
                email: formEmail,
                fname: formFname,
                lname: formLname,
                role: formRole,
                phoneNumber: formPhone,
            });
            if (success) {
                setIsFormModalVisible(false);
                loadUsers(); // Refresh list after create
            }
        }
    };

    const onConfirmDelete = async () => {
        if (selectedUser) {
            const success = await deleteUser(selectedUser.uid);
            if (success) setIsDeleteModalVisible(false);
        }
    };

    const resolveRoleName = (role: string) => {
        const roleLower = (role || '').toLowerCase();
        if (roleLower === 'superadmin' || roleLower === 'super admin' || role === '0') return getRoleName(0);
        if (roleLower === 'admin' || role === '1') return getRoleName(1);
        if (roleLower === 'therapist' || role === '2') return getRoleName(2);
        if (roleLower === 'customer' || role === '3') return getRoleName(3);
        return role;
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header Area */}
            <View className="bg-white border-b border-slate-200 px-8 py-6">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-3xl text-slate-900">Users Management</Text>
                        <Text className="text-slate-500 mt-1">Manage platform users, roles and permissions.</Text>
                    </View>
                    <Pressable
                        onPress={openCreateModal}
                        className="bg-primary flex-row items-center px-6 py-3 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                    >
                        <Ionicons name="person-add" size={20} color="white" />
                        <Text className="text-white ml-2">Add New User</Text>
                    </Pressable>
                </View>

                {/* Filters Row */}
                <View className="flex-row gap-4">
                    <View className="flex-1 max-w-md flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4">
                        <Ionicons name="search" size={20} color="#94a3b8" />
                        <TextInput
                            className="flex-1 h-12 ml-3 text-slate-900"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                        />
                    </View>



                    <View className="flex-row gap-2">
                        {[null, 0, 1, 2, 3].map(r => (
                            <Pressable
                                key={String(r)}
                                onPress={() => setRoleFilter(r)}
                                className={`px-4 py-2 rounded-lg border ${roleFilter === r ? 'bg-primary border-primary' : 'bg-white border-slate-200'}`}
                            >
                                <Text className={`${roleFilter === r ? 'text-white' : 'text-slate-600'}`}>
                                    {r === null ? 'All' : getRoleName(r)}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </View>

            {/* Error Message */}
            {error && (
                <View className="m-8 bg-red-50 border border-red-100 p-4 rounded-xl flex-row items-center">
                    <Ionicons name="alert-circle" size={20} color="#ef4444" />
                    <Text className="text-red-600 ml-3 flex-1">{error}</Text>
                    <Pressable onPress={clearError}>
                        <Ionicons name="close" size={20} color="#ef4444" />
                    </Pressable>
                </View>
            )}

            {/* Users Table */}
            <ScrollView className="flex-1 px-8 py-6">
                <View className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Table Header */}
                    <View className="flex-row bg-slate-50 border-b border-slate-200 px-6 py-4">
                        <Text className="flex-[2] text-xs  text-slate-500 uppercase">User</Text>
                        <Text className="flex-1 text-xs  text-slate-500 uppercase">Role</Text>
                        <Text className="flex-1 text-xs  text-slate-500 uppercase">Status</Text>
                        <Text className="flex-1 text-xs  text-slate-500 uppercase">Joined</Text>
                        <Text className="w-32 text-xs  text-slate-500 uppercase text-center">Actions</Text>
                    </View>

                    {isLoading && users.length === 0 ? (
                        <View className="py-20 items-center">
                            <ActivityIndicator size="large" color="#4C7A6C" />
                            <Text className="text-slate-500 mt-4 font-medium">Loading users...</Text>
                        </View>
                    ) : filteredUsers.length === 0 ? (
                        <View className="py-20 items-center">
                            <Ionicons name="people-outline" size={48} color="#cbd5e1" />
                            <Text className="text-slate-500 mt-4 text-lg">No users found</Text>
                        </View>
                    ) : (
                        filteredUsers.map((user, idx) => (
                            <View
                                key={user.uid}
                                className={`flex-row items-center px-6 py-4 border-b border-slate-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                            >
                                <View className="flex-[2] flex-row items-center">
                                    <View className="w-10 h-10 rounded-full bg-slate-200 items-center justify-center mr-4">
                                        <Text className="text-slate-600 ">
                                            {(user.firstName?.[0] || '') + (user.lastName?.[0] || '') || '?'}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text className="text-slate-900 ">
                                            {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'No Name'}
                                        </Text>
                                        <Text className="text-slate-500 text-sm">{user.email}</Text>
                                    </View>
                                </View>

                                <View className="flex-1">
                                    <View className="bg-slate-100 rounded-full px-3 py-1 self-start">
                                        <Text className="text-slate-700 text-xs font-semibold">{resolveRoleName(user.role)}</Text>
                                    </View>
                                </View>

                                <View className="flex-1">
                                    <View className={`flex-row items-center`}>
                                        <View className={`w-2 h-2 rounded-full mr-2 ${user.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`} />
                                        <Text className={`text-sm font-medium ${user.status === 'Active' ? 'text-green-700' : 'text-slate-500'}`}>
                                            {user.status}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-1">
                                    <Text className="text-slate-500 text-sm">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                    </Text>
                                </View>

                                <View className="w-32 flex-row justify-center gap-2">
                                    <Pressable
                                        onPress={() => openEditModal(user)}
                                        className="p-2 rounded-lg bg-blue-50 active:bg-blue-100"
                                    >
                                        <Ionicons name="create-outline" size={18} color="#2563eb" />
                                    </Pressable>
                                    <Pressable
                                        onPress={() => openDeleteModal(user)}
                                        className="p-2 rounded-lg bg-red-50 active:bg-red-100"
                                    >
                                        <Ionicons name="trash-outline" size={18} color="#dc2626" />
                                    </Pressable>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                <View className="h-20" />
            </ScrollView>

            {/* Create/Edit Modal */}
            <Modal
                visible={isFormModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsFormModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 items-center justify-center p-6">
                    <View className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
                        <View className="bg-primary/5 px-8 pt-8 pb-6 border-b border-slate-100">
                            <Text className="text-2xl  text-slate-900">{selectedUser ? 'Edit User' : 'Add New User'}</Text>
                            <Text className="text-slate-500 mt-1">
                                {selectedUser ? 'Update user profile information.' : 'Invite a new user to the platform.'}
                            </Text>
                        </View>

                        <ScrollView className="p-8 max-h-[70vh]">
                            {!selectedUser && (
                                <View className="mb-5">
                                    <Text className="text-sm font-semibold text-slate-700 mb-2">Email Address</Text>
                                    <TextInput
                                        className="h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900"
                                        placeholder="user@soothera.com"
                                        value={formEmail}
                                        onChangeText={setFormEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                    <Text className="text-xs text-slate-400 mt-1.5 ml-1">Default password "String123!" will be assigned.</Text>
                                </View>
                            )}

                            <View className="flex-row gap-4 mb-5">
                                <View className="flex-1">
                                    <Text className="text-sm font-semibold text-slate-700 mb-2">First Name</Text>
                                    <TextInput
                                        className="h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900"
                                        placeholder="John"
                                        value={formFname}
                                        onChangeText={setFormFname}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-semibold text-slate-700 mb-2">Last Name</Text>
                                    <TextInput
                                        className="h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900"
                                        placeholder="Doe"
                                        value={formLname}
                                        onChangeText={setFormLname}
                                    />
                                </View>
                            </View>

                            {!selectedUser && (
                                <View className="mb-5">
                                    <Text className="text-sm font-semibold text-slate-700 mb-2">Platform Role</Text>
                                    <View className="flex-row gap-2">
                                        {[1, 2, 3].map(r => (
                                            <Pressable
                                                key={r}
                                                onPress={() => setFormRole(r)}
                                                className={`flex-1 py-3 rounded-xl border items-center ${formRole === r ? 'bg-primary/10 border-primary' : 'bg-slate-50 border-slate-200'}`}
                                            >
                                                <Text className={`font-medium ${formRole === r ? 'text-primary' : 'text-slate-600'}`}>
                                                    {getRoleName(r)}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                            )}

                            <View className="mb-8">
                                <Text className="text-sm font-semibold text-slate-700 mb-2">Phone Number (Optional)</Text>
                                <TextInput
                                    className="h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900"
                                    placeholder="+63 912 345 6789"
                                    value={formPhone}
                                    onChangeText={setFormPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </ScrollView>

                        <View className="bg-slate-50 px-8 py-6 border-t border-slate-100 flex-row justify-end gap-3">
                            <Pressable
                                onPress={() => setIsFormModalVisible(false)}
                                className="px-6 py-3 rounded-xl border border-slate-200 bg-white"
                            >
                                <Text className="text-slate-600 ">Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={onSubmitForm}
                                disabled={isLoading}
                                className={`px-8 py-3 rounded-xl bg-primary items-center justify-center min-w-[120px] ${isLoading ? 'opacity-70' : ''}`}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text className="text-white ">{selectedUser ? 'Save Changes' : 'Create User'}</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={isDeleteModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsDeleteModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 items-center justify-center p-6">
                    <View className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-8 items-center">
                        <View className="bg-red-100 w-16 h-16 rounded-full items-center justify-center mb-6">
                            <Ionicons name="trash" size={32} color="#dc2626" />
                        </View>
                        <Text className="text-xl  text-slate-900 text-center mb-2">Delete User?</Text>
                        <Text className="text-slate-500 text-center mb-8">
                            Are you sure you want to delete <Text className=" text-slate-900">{selectedUser?.fullName || selectedUser?.email}</Text>? This action cannot be undone.
                        </Text>
                        <View className="flex-row w-full gap-3">
                            <Pressable
                                onPress={() => setIsDeleteModalVisible(false)}
                                className="flex-1 py-3 rounded-xl border border-slate-200 bg-white items-center"
                            >
                                <Text className="text-slate-600 ">Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={onConfirmDelete}
                                disabled={isLoading}
                                className={`flex-1 py-3 rounded-xl bg-red-600 items-center justify-center ${isLoading ? 'opacity-70' : ''}`}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text className="text-white ">Delete</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
