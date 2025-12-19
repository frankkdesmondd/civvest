// src/utils/userSync.ts

// Function to update user data in localStorage and notify all components
export const updateUserData = (updatedUserData: any) => {
  if (!updatedUserData) return;
  
  // Get current user data from localStorage
  const currentUserStr = localStorage.getItem('user');
  let currentUser = currentUserStr ? JSON.parse(currentUserStr) : {};
  
  // Merge with updated data
  const newUserData = { ...currentUser, ...updatedUserData };
  
  // Save to localStorage
  localStorage.setItem('user', JSON.stringify(newUserData));
  
  // Dispatch storage event (works across tabs/windows)
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'user',
    newValue: JSON.stringify(newUserData),
    storageArea: localStorage
  }));
  
  // Dispatch custom event (works in same tab)
  window.dispatchEvent(new CustomEvent('userUpdated', {
    detail: { user: newUserData }
  }));
  
  return newUserData;
};

// Function to get user data with profile picture
export const getUserWithProfilePicture = async () => {
  try {
    const response = await fetch(`https://civvest-backend.onrender.com/api/auth/me`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.user) {
        updateUserData(data.user);
        return data.user;
      }
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error);
  }
  
  // Fallback to localStorage data
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
