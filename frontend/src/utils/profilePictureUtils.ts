// utils/profilePictureUtils.ts
export const getProfilePictureUrl = (profilePicture?: string | null): string | null => {
  if (!profilePicture) return null;
  
  // Handle both absolute and relative URLs
  if (profilePicture.startsWith('http')) {
    return profilePicture;
  }
  
  // For relative paths, prepend the server URL for development
  if (profilePicture.startsWith('/uploads/')) {
    return `https://civvest-backend.onrender.com${profilePicture}`;
  }
  
  // For just filenames
  if (profilePicture.includes('profile-')) {
    return `https://civvest-backend.onrender.com/uploads/profile-pictures/${profilePicture}`;
  }
  
  return profilePicture;
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const getRandomColor = (): string => {
  const colors = [
    'bg-gradient-to-br from-blue-500 to-blue-600',
    'bg-gradient-to-br from-green-500 to-green-600',
    'bg-gradient-to-br from-purple-500 to-purple-600',
    'bg-gradient-to-br from-red-500 to-red-600',
    'bg-gradient-to-br from-yellow-500 to-yellow-600',
    'bg-gradient-to-br from-pink-500 to-pink-600',
    'bg-gradient-to-br from-indigo-500 to-indigo-600'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
