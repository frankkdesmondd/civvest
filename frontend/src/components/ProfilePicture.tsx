// components/ProfilePicture.tsx
import React, { useState, useEffect } from 'react';
import { getProfilePictureUrl, getInitials, getRandomColor } from '../utils/profilePictureUtils';
import { useUser } from '../context/UserContext';

interface ProfilePictureProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
  borderColor?: string;
  showBorder?: boolean;
  forceRefresh?: boolean;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ 
  size = 'md', 
  showName = false,
  className = '',
  borderColor = 'border-white',
  showBorder = true,
  forceRefresh = false
}) => {
  const { user } = useUser();
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  // Update image source when user changes or forceRefresh is triggered
  useEffect(() => {
    if (user?.profilePicture) {
      const url = getProfilePictureUrl(user.profilePicture);
      // Add timestamp to force refresh when profile picture changes
      if (forceRefresh && url) {
        const separator = url.includes('?') ? '&' : '?';
        setImageSrc(`${url}${separator}t=${Date.now()}`);
      } else {
        setImageSrc(url);
      }
      setImageError(false);
    } else {
      setImageSrc(null);
    }
  }, [user?.profilePicture, forceRefresh]);

  if (!user) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-300 ${className}`}></div>
    );
  }

  const initials = getInitials(user.firstName, user.lastName);
  const randomColor = getRandomColor();
  const borderClass = showBorder ? `border-2 ${borderColor} shadow-sm` : '';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        {imageSrc && !imageError ? (
          <img
            src={imageSrc}
            alt={`${user.firstName} ${user.lastName}`}
            className={`${sizeClasses[size]} rounded-full object-cover ${borderClass}`}
            onError={() => setImageError(true)}
            onLoad={() => console.log('Profile image loaded successfully:', imageSrc)}
            crossOrigin="anonymous"
          />
        ) : (
          <div className={`${sizeClasses[size]} ${randomColor} rounded-full flex items-center justify-center text-white font-semibold ${borderClass}`}>
            {initials}
          </div>
        )}
      </div>
      
      {showName && (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-xs text-gray-500">
            Acc: {user.accountNumber}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;