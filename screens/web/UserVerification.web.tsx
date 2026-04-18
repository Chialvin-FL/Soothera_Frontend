import React, { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, Pressable, TextInput, ActivityIndicator, Modal, Image, Linking } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useDocumentSlice } from '../../slices/documentSlice';
import { DocumentStatus } from '../../api/types';
import type { UserDocument } from '../../api/types';

export default function UserVerificationWeb() {
    const {
        documents,
        isLoading,
        error,
        loadPending,
        verifyDocs,
        clearError
    } = useDocumentSlice();

    // Local filter state
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<UserDocument | null>(null);
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        loadPending();
    }, [loadPending]);

    // Client-side filtering
    const filteredDocs = useMemo(() => {
        return documents.filter(doc => {
            const searchLower = searchQuery.toLowerCase();
            return !searchQuery || 
                   (doc.fullName || '').toLowerCase().includes(searchLower) ||
                   (doc.uid || '').toLowerCase().includes(searchLower);
        });
    }, [documents, searchQuery]);

    const openDetailModal = (doc: UserDocument) => {
        setSelectedDoc(doc);
        setRemarks(doc.remarks || '');
        setIsDetailModalVisible(true);
    };

    const handleAction = async (status: DocumentStatus) => {
        if (!selectedDoc) return;
        
        const success = await verifyDocs(selectedDoc.uid, status, remarks);
        if (success) {
            setIsDetailModalVisible(false);
        }
    };

    const isImage = (url: string) => {
        return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header Area */}
            <View className="bg-white border-b border-slate-200 px-8 py-6">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-3xl text-slate-900">User Verifications</Text>
                        <Text className="text-slate-500 mt-1">Review and approve administrative document submissions.</Text>
                    </View>
                    <View className="bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 flex-row items-center">
                        <Ionicons name="time-outline" size={18} color="#d97706" />
                        <Text className="text-amber-700 ml-2">{documents.length} Pending Actions</Text>
                    </View>
                </View>

                {/* Filters Row */}
                <View className="flex-row gap-4">
                    <View className="flex-1 max-w-md flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4">
                        <Ionicons name="search" size={20} color="#94a3b8" />
                        <TextInput
                            className="flex-1 h-12 ml-3 text-slate-900"
                            placeholder="Search by name or UID..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <Pressable 
                        onPress={() => loadPending()}
                        className="bg-white border border-slate-200 p-3 rounded-xl active:bg-slate-50"
                    >
                        <Ionicons name="refresh" size={20} color="#64748b" />
                    </Pressable>
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

            {/* Verifications Table */}
            <ScrollView className="flex-1 px-8 py-6">
                <View className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Table Header */}
                    <View className="flex-row bg-slate-50 border-b border-slate-200 px-6 py-4">
                        <Text className="flex-[2] text-xs text-slate-500 uppercase">User / Applicant</Text>
                        <Text className="flex-1 text-xs text-slate-500 uppercase">Status</Text>
                        <Text className="flex-1 text-xs text-slate-500 uppercase">Docs Count</Text>
                        <Text className="flex-1 text-xs text-slate-500 uppercase">Submitted</Text>
                        <Text className="w-32 text-xs text-slate-500 uppercase text-center">Actions</Text>
                    </View>

                    {isLoading && documents.length === 0 ? (
                        <View className="py-20 items-center">
                            <ActivityIndicator size="large" color="#4C7A6C" />
                            <Text className="text-slate-500 mt-4">Fetching submissions...</Text>
                        </View>
                    ) : filteredDocs.length === 0 ? (
                        <View className="py-20 items-center">
                            <Ionicons name="shield-checkmark-outline" size={48} color="#cbd5e1" />
                            <Text className="text-slate-500 mt-4 text-lg">No pending verifications</Text>
                        </View>
                    ) : (
                        filteredDocs.map((doc, idx) => (
                            <View 
                                key={doc.uid} 
                                className={`flex-row items-center px-6 py-4 border-b border-slate-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                            >
                                <View className="flex-[2] flex-row items-center">
                                    <View className="w-10 h-10 rounded-full bg-slate-200 items-center justify-center mr-4">
                                        <Text className="text-slate-600">
                                            {doc.fullName?.charAt(0) || '?'}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text className="text-slate-900">{doc.fullName || 'No Name'}</Text>
                                        <Text className="text-slate-500 text-sm">UID: {doc.uid}</Text>
                                    </View>
                                </View>
                                
                                <View className="flex-1">
                                    <View className="bg-amber-100 rounded-full px-3 py-1 self-start">
                                        <Text className="text-amber-800 text-xs">{doc.statusName}</Text>
                                    </View>
                                </View>

                                <View className="flex-1">
                                    <View className="flex-row items-center">
                                        <Ionicons name="document-attach-outline" size={16} color="#64748b" />
                                        <Text className="text-slate-600 ml-2">{doc.documentUrls?.length || 0} Files</Text>
                                    </View>
                                </View>

                                <View className="flex-1">
                                    <Text className="text-slate-500 text-sm">
                                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                                    </Text>
                                </View>

                                <View className="w-32 flex-row justify-center">
                                    <Pressable 
                                        onPress={() => openDetailModal(doc)}
                                        className="bg-primary/95 px-4 py-2 rounded-lg active:scale-95 transition-transform"
                                    >
                                        <Text className="text-white text-xs">Review</Text>
                                    </Pressable>
                                </View>
                            </View>
                        ))
                    )}
                </View>
                <View className="h-20" />
            </ScrollView>

            {/* Verification Detail Modal */}
            <Modal
                visible={isDetailModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsDetailModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 items-center justify-center p-6">
                    <View className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex-row h-[85vh]">
                        {/* Left Side: Document Previewer */}
                        <View className="flex-1 bg-slate-100 border-r border-slate-200">
                            <View className="p-6 border-b border-slate-200 bg-white flex-row justify-between items-center">
                                <Text className="text-lg text-slate-800 font-medium">Document Preview</Text>
                                <Text className="text-slate-500 text-sm">{selectedDoc?.documentUrls?.length || 0} Attachments</Text>
                            </View>
                            
                            <ScrollView className="flex-1 p-6">
                                {selectedDoc?.documentUrls?.map((url, i) => (
                                    <View key={i} className="mb-6 bg-white p-4 rounded-2xl shadow-sm">
                                        <Text className="text-xs text-slate-400 mb-2 uppercase tracking-tight">File {i+1}</Text>
                                        {isImage(url) ? (
                                            <Pressable onPress={() => Linking.openURL(url)}>
                                                <Image 
                                                    source={{ uri: url }} 
                                                    style={{ width: '100%', height: 400, borderRadius: 12 }} 
                                                    resizeMode="contain"
                                                />
                                            </Pressable>
                                        ) : (
                                            <Pressable 
                                                onPress={() => Linking.openURL(url)}
                                                className="h-32 bg-slate-50 border border-dashed border-slate-300 rounded-xl items-center justify-center"
                                            >
                                                <Ionicons name="document-text-outline" size={40} color="#94a3b8" />
                                                <Text className="text-slate-500 mt-2">Open document in new tab</Text>
                                                <Text className="text-slate-400 text-xs mt-1 truncate max-w-[80%]">{url.split('/').pop()}</Text>
                                            </Pressable>
                                        )}
                                    </View>
                                ))}
                                {(!selectedDoc?.documentUrls || selectedDoc?.documentUrls.length === 0) && (
                                    <View className="py-20 items-center">
                                        <Ionicons name="alert-circle-outline" size={48} color="#cbd5e1" />
                                        <Text className="text-slate-500 mt-4">No documents found for this user.</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>

                        {/* Right Side: Actions & Remarks */}
                        <View className="w-96 p-8 flex-col">
                            <View className="flex-1">
                                <View className="mb-8">
                                    <Text className="text-2xl text-slate-900 mb-1">{selectedDoc?.fullName}</Text>
                                    <Text className="text-slate-500 text-sm">Verification ID: {selectedDoc?.uid}</Text>
                                </View>

                                <View className="mb-6">
                                    <Text className="text-sm font-semibold text-slate-700 mb-3 ml-1 uppercase tracking-wider">Evaluation Remarks</Text>
                                    <TextInput
                                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[120px] text-slate-800"
                                        placeholder="Enter approval notes or rejection reasons here..."
                                        multiline
                                        numberOfLines={6}
                                        textAlignVertical="top"
                                        value={remarks}
                                        onChangeText={setRemarks}
                                    />
                                    <Text className="text-xs text-slate-400 mt-2 ml-1">These remarks will be visible to the applicant.</Text>
                                </View>
                            </View>

                            <View className="gap-3">
                                <Pressable
                                    onPress={() => handleAction(DocumentStatus.Verified)}
                                    disabled={isLoading}
                                    className={`bg-primary h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary/20 ${isLoading ? 'opacity-70' : ''}`}
                                >
                                    {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg">Approve Application</Text>}
                                </Pressable>
                                
                                <Pressable
                                    onPress={() => handleAction(DocumentStatus.Rejected)}
                                    disabled={isLoading}
                                    className={`bg-white border border-red-200 h-14 rounded-2xl items-center justify-center active:bg-red-50 ${isLoading ? 'opacity-70' : ''}`}
                                >
                                    <Text className="text-red-600 text-lg">Deny Application</Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => setIsDetailModalVisible(false)}
                                    className="h-14 rounded-2xl items-center justify-center"
                                >
                                    <Text className="text-slate-400">Close Review</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
