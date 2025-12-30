import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with your credentials from the dashboard
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper to create specific storage for different folders
const createStorage = (folderName) => new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: folderName,
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Optional: optimize size
  },
});

export const newsStorage = createStorage('civvest/news');
export const profileStorage = createStorage('civvest/profile-pictures');
export { cloudinary }; // Export for manual deletions
