import React, { useState, useRef } from 'react';
import { FiCamera, FiX, FiLoader } from 'react-icons/fi';
import { useToast } from '../context/ToastContext';
import axiosInstance from '../config/axios';
import { getProfilePictureUrl, getInitials } from '../utils/profilePictureUtils';
import { useUserSync } from '../hooks/useUserSync';
import ConfirmModal from '../components/ConfirmModal';

interface ProfilePictureUploadProps {
  userId: string;
  currentPicture?: string | null;
  firstName: string;
  lastName: string;
  onPictureUpdated?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showControls?: boolean;
}

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentPicture,
  firstName,
  lastName,
  onPictureUpdated,
  size = 'md',
  showControls = true
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {}
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const { updateUser, refreshUser } = useUserSync();

  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-32 h-32 text-4xl',
    lg: 'w-48 h-48 text-5xl'
  };

  const getInitialsDisplay = () => {
    return getInitials(firstName, lastName);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      showToast('Invalid file type. Please select an image file.', 'error');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      showToast('File too large. Maximum size is 5MB.', 'error');
      return;
    }

    setError(null);
    
    // Create local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    await uploadPicture(file);
  };

  const uploadPicture = async (file: File) => {
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      // Use the correct endpoint - no /api prefix needed since axiosInstance adds it
      const response = await axiosInstance.post('/api/profile-picture/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });
      
      console.log('Upload response:', response.data);
      
      if (response.data.user) {
        // Update user context
        updateUser(response.data.user);
        
        // Notify parent component
        if (onPictureUpdated) {
          onPictureUpdated();
        }
        
        // Dispatch global event
        window.dispatchEvent(new CustomEvent('profilePictureUpdated'));
        
        showToast?.('Profile picture updated successfully!', 'success');
        
        // Clear local preview
        setLocalPreview(null);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to upload profile picture';
      console.error('Upload error details:', err);
      setError(errorMessage);
      showToast?.(errorMessage, 'error');
      setLocalPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const promptRemovePicture = () => {
    if (!currentPicture) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'Remove Profile Picture',
      message: 'Are you sure you want to remove your profile picture? This action cannot be undone.',
      onConfirm: removePicture
    });
  };

  const removePicture = async () => {
    setUploading(true);
    setError(null);
    
    try {
      console.log('Attempting to remove profile picture...');
      
      const response = await axiosInstance.delete('/api/profile-picture/remove', {
        withCredentials: true
      });
      
      console.log('Remove response:', response.data);
      
      if (response.data.user) {
        // Force update the user context
        updateUser(response.data.user);
        
        // Also refresh from server
        await refreshUser();
        
        // Notify parent component
        if (onPictureUpdated) {
          onPictureUpdated();
        }
        
        // Dispatch global event
        window.dispatchEvent(new CustomEvent('profilePictureUpdated'));
        
        showToast?.('Profile picture removed successfully!', 'success');
      }
    } catch (err: any) {
      console.error('Remove error details:', err);
      console.error('Error response:', err.response);
      console.error('Error config:', err.config);
      
      const errorMessage = err.response?.data?.error || err.message || 'Failed to remove profile picture';
      setError(errorMessage);
      showToast?.(errorMessage, 'error');
    } finally {
      setUploading(false);
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const handleButtonClick = () => {
    if (!uploading && showControls) {
      fileInputRef.current?.click();
    }
  };

  const handleCancelRemove = () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  // Determine what to display
  const displayUrl = localPreview || getProfilePictureUrl(currentPicture);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
      const fallback = document.createElement('div');
      fallback.className = `w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-4xl' : 'text-5xl'}`;
      fallback.textContent = getInitialsDisplay();
      parent.appendChild(fallback);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          {/* Profile Picture Display */}
          <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white shadow-lg bg-linear-to-br from-blue-500 to-purple-600`}>
            {displayUrl ? (
              <img
                src={displayUrl}
                alt={`${firstName} ${lastName}`}
                className="w-full h-full object-cover"
                onError={handleImageError}
                onLoad={() => console.log('Profile image loaded successfully')}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className={`text-white font-bold ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-4xl' : 'text-5xl'}`}>
                  {getInitialsDisplay()}
                </span>
              </div>
            )}
            
            {/* Upload Overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                <FiLoader className="text-white text-2xl animate-spin" />
              </div>
            )}
          </div>

          {/* Upload Button */}
          {showControls && (
            <button
              onClick={handleButtonClick}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              title="Change profile picture"
              type="button"
            >
              <FiCamera className="text-lg" />
            </button>
          )}

          {/* Remove Button (only when there's a picture) */}
          {showControls && currentPicture && !uploading && (
            <button
              onClick={promptRemovePicture}
              className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              title="Remove profile picture"
              type="button"
            >
              <FiX className="text-sm" />
            </button>
          )}
        </div>

        {/* File Input (hidden) */}
        {showControls && (
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            className="hidden"
            disabled={uploading}
          />
        )}

        {/* Instructions */}
        {showControls && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Click the camera icon to upload a new profile picture
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, GIF or WEBP (Max 5MB)
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md max-w-xs">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {uploading && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-600 text-center flex items-center justify-center gap-2">
              <FiLoader className="animate-spin" />
              {localPreview ? 'Uploading...' : 'Removing...'}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmModal.onConfirm}
        onCancel={handleCancelRemove}
      />
    </>
  );
};


export default ProfilePictureUpload;
