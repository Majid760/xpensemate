import cloudinaryModule from 'cloudinary';
const cloudinary = cloudinaryModule.v2;
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

class StorageService {
  constructor() {
    // Configure Cloudinary 
    this.configureCloudinary();
    this.setupStorage();
  }

  configureCloudinary() {
 
    // if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    //   throw new Error('Cloudinary environment variables are not set properly');
    // }
   // delay the execution
   setTimeout(() => {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('=== Configuring Cloudinary ===');
    console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
    console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');
   }, 2000);

    console.log('Cloudinary configured successfully');
    console.log('===============================');
  }

  setupStorage() {
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

    // Create multer upload instances with better error handling
    this.profileUpload = multer({ 
      storage: this.profileStorage,
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      }
    });

    this.coverUpload = multer({ 
      storage: this.coverStorage,
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      }
    });
  }

  async uploadProfilePhoto(file) {
    try {
      console.log('=== Upload Profile Photo ===');
      console.log('File object:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        size: file.size,
        filename: file.filename,
        path: file.path
      });

      if (file.path) {
        // File is already uploaded via CloudinaryStorage
        console.log('Returning Cloudinary URL:', file.path);
        return file.path;
      } else if (file.buffer) {
        console.log('Uploading from buffer...');
        // Fallback: upload from buffer if needed
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: 'profile_photos',
              transformation: [{ width: 500, height: 500, crop: 'fill' }]
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else {
                console.log('Cloudinary upload success:', result.secure_url);
                resolve(result);
              }
            }
          ).end(file.buffer);
        });
        return result.secure_url;
      } else {
        throw new Error('Invalid file object - no path or buffer found');
      }
    } catch (error) {
      console.error('Error in uploadProfilePhoto:', error);
      throw new Error(`Failed to upload profile photo: ${error.message}`);
    }
  }

  async uploadCoverPhoto(file) {
    try {
      console.log('=== Upload Cover Photo ===');
      console.log('File object:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        size: file.size,
        filename: file.filename,
        path: file.path
      });

      if (file.path) {
        // File is already uploaded via CloudinaryStorage
        console.log('Returning Cloudinary URL:', file.path);
        return file.path;
      } else if (file.buffer) {
        console.log('Uploading from buffer...');
        // Fallback: upload from buffer if needed
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: 'cover_photos',
              transformation: [{ width: 1200, height: 400, crop: 'fill' }]
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else {
                console.log('Cloudinary upload success:', result.secure_url);
                resolve(result);
              }
            }
          ).end(file.buffer);
        });
        return result.secure_url;
      } else {
        throw new Error('Invalid file object - no path or buffer found');
      }
    } catch (error) {
      console.error('Error in uploadCoverPhoto:', error);
      throw new Error(`Failed to upload cover photo: ${error.message}`);
    }
  }

  async deletePhoto(url) {
    try {
      console.log('Deleting photo:', url);
      
      // Extract public_id from Cloudinary URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const publicId = fileName.split('.')[0];
      
      // Include folder in public_id
      let fullPublicId = publicId;
      if (url.includes('/profile_photos/')) {
        fullPublicId = `profile_photos/${publicId}`;
      } else if (url.includes('/cover_photos/')) {
        fullPublicId = `cover_photos/${publicId}`;
      }
      
      console.log('Deleting with public_id:', fullPublicId);
      const result = await cloudinary.uploader.destroy(fullPublicId);
      console.log('Delete result:', result);
      
      return result;
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw new Error(`Failed to delete photo: ${error.message}`);
    }
  }
}

export default new StorageService();