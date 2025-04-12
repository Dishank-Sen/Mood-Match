const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteFile = async (secureUrl) => {
  try {
    if (!secureUrl) {
      console.log('No URL provided');
      return false;
    }

    // Remove everything before '/upload/'
    const uploadIndex = secureUrl.indexOf('/upload/');
    if (uploadIndex === -1) {
      throw new Error('Invalid Cloudinary URL');
    }

    const publicIdWithExtension = secureUrl.substring(uploadIndex + 8); // remove '/upload/'
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ""); // remove file extension

    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Delete result:', result);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

module.exports = deleteFile;
