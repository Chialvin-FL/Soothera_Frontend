import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckMyDocsData } from '../../api/types';

interface DocumentVerificationProps {
    visible: boolean;
    isUploading: boolean;
    error: string | null;
    onUpload: (files: any[]) => void;
    existingDocs?: CheckMyDocsData | null;
}

export const DocumentVerification: React.FC<DocumentVerificationProps> = ({
    visible,
    isUploading,
    error,
    onUpload,
    existingDocs,
}) => {
    const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
    const insets = useSafeAreaInsets();

    const requiredDocuments = [
        "SEC/DTI Registration",
        "BIR 2303 Certificate of Registration",
        "Business/ Barangay Permit",
        "3-month Bank Statement",
        "Bank Account Information",
        "Certificate of Authority to Operate",
        "Government-Issued ID for representative"
    ];

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                multiple: true,
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets) {
                const newFiles = result.assets.map((asset) => ({
                    uri: asset.uri,
                    name: asset.name,
                    type: asset.mimeType || 'application/octet-stream',
                    size: asset.size,
                }));
                setSelectedFiles((prev) => [...prev, ...newFiles]);
            }
        } catch (err) {
            console.error('Error picking document:', err);
        }
    };

    const removeFile = (index: number) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
    };

    const handleUpload = () => {
        if (selectedFiles.length === 0) return;
        onUpload(selectedFiles);
    };

    const hasRejectedDocs = existingDocs && Number(existingDocs.status) === 2; // 2 = Rejected

    return (
        <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={() => {}}>
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <Text style={styles.title}>Upload Legal Documents</Text>
                    <Text style={styles.subtitle}>
                        You must upload your business documents to proceed with the application.
                    </Text>
                </View>

                <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {hasRejectedDocs && (
                        <View style={styles.rejectedBanner}>
                            <View style={styles.rejectedHeader}>
                                <Ionicons name="warning-outline" size={24} color="#EF4444" />
                                <Text style={styles.rejectedTitle}>Previous Upload Rejected</Text>
                            </View>
                            <Text style={styles.rejectedText}>
                                Your previously submitted legal documents were rejected. Please review the required list below and upload valid, clear files to proceed.
                            </Text>
                            {existingDocs?.uploadedAt && (
                                <Text style={styles.rejectedTime}>
                                    Submitted on: {new Date(existingDocs.uploadedAt.replace(/-/g, '/')).toLocaleDateString()}
                                </Text>
                            )}
                        </View>
                    )}

                    <View style={styles.requirementsBox}>
                        <Text style={styles.requirementsTitle}>Required Documents:</Text>
                        {requiredDocuments.map((req, index) => (
                            <View key={index} style={styles.requirementItem}>
                                <View style={styles.bullet}>
                                    <Text style={styles.bulletText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.requirementText}>{req}</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.uploadArea} onPress={pickDocument}>
                        <Ionicons name="cloud-upload-outline" size={48} color="#6B7280" />
                        <Text style={styles.uploadTextBold}>Tap to select documents</Text>
                        <Text style={styles.uploadTextSub}>PDF, JPG, PNG (Max 10MB each)</Text>
                    </TouchableOpacity>

                    {selectedFiles.length > 0 && (
                        <View style={styles.selectedFilesContainer}>
                            <Text style={styles.selectedFilesTitle}>
                                Selected Documents ({selectedFiles.length})
                            </Text>
                            {selectedFiles.map((file, idx) => (
                                <View key={idx} style={styles.fileCard}>
                                    <View style={styles.fileIcon}>
                                        <Ionicons 
                                            name={file.type?.includes('image') ? 'image-outline' : 'document-text-outline'} 
                                            size={24} 
                                            color="#4B5563" 
                                        />
                                    </View>
                                    <View style={styles.fileMeta}>
                                        <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                                        {file.size && (
                                            <Text style={styles.fileSize}>
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </Text>
                                        )}
                                    </View>
                                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeFile(idx)}>
                                        <Ionicons name="close-circle" size={24} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {error && <Text style={styles.errorText}>{error}</Text>}
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                    <TouchableOpacity
                        style={[
                            styles.submitBtn,
                            (selectedFiles.length === 0 || isUploading) && styles.submitBtnDisabled
                        ]}
                        disabled={selectedFiles.length === 0 || isUploading}
                        onPress={handleUpload}
                    >
                        {isUploading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitBtnText}>
                                Upload {selectedFiles.length} Document{selectedFiles.length !== 1 ? 's' : ''}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    scrollContent: {
        flex: 1,
    },
    scrollContainer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    rejectedBanner: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FCA5A5',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        marginTop: 10,
    },
    rejectedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    rejectedTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#991B1B',
        marginLeft: 8,
    },
    rejectedText: {
        fontSize: 14,
        color: '#7F1D1D',
        lineHeight: 20,
    },
    rejectedTime: {
        fontSize: 12,
        color: '#B91C1C',
        marginTop: 8,
        fontWeight: '500',
    },
    requirementsBox: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        marginTop: 10,
    },
    requirementsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    requirementItem: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    bullet: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#2c8068',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
        marginRight: 10,
    },
    bulletText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    requirementText: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
        lineHeight: 20,
    },
    uploadArea: {
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderStyle: 'dashed',
        borderRadius: 16,
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        marginBottom: 24,
    },
    uploadTextBold: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginTop: 12,
        marginBottom: 4,
    },
    uploadTextSub: {
        fontSize: 12,
        color: '#6B7280',
    },
    selectedFilesContainer: {
        marginBottom: 20,
    },
    selectedFilesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    fileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    fileIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    fileMeta: {
        flex: 1,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    fileSize: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    removeBtn: {
        padding: 4,
    },
    errorText: {
        color: '#EF4444',
        textAlign: 'center',
        fontWeight: 'bold',
        marginVertical: 10,
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    submitBtn: {
        backgroundColor: '#2c8068',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    submitBtnDisabled: {
        opacity: 0.5,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

