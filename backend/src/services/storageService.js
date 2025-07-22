import cloudinaryModule from 'cloudinary';
const cloudinary = cloudinaryModule.v2;
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class StorageService {
  constructor() {
    // Configure storage for profile photos
    this.profileStorage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'profile_photos',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 500, height: 500, crop: 'fill' }]
      }
    });

    // Configure storage for cover photos
    this.coverStorage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'cover_photos',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 1200, height: 400, crop: 'fill' }]
      }
    });

    // Create multer upload instances
    this.profileUpload = multer({ storage: this.profileStorage });
    this.coverUpload = multer({ storage: this.coverStorage });
  }

  async uploadProfilePhoto(file) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'profile_photos',
        transformation: [{ width: 500, height: 500, crop: 'fill' }]
      });
      return result.secure_url;
    } catch (error) {
      throw new Error('Failed to upload profile photo');
    }
  }

  async uploadCoverPhoto(file) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'cover_photos',
        transformation: [{ width: 1200, height: 400, crop: 'fill' }]
      });
      return result.secure_url;
    } catch (error) {
      throw new Error('Failed to upload cover photo');
    }
  }

  async deletePhoto(url) {
    try {
      const publicId = url.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new Error('Failed to delete photo');
    }
  }
}

export default new StorageService(); 