const cloudinary = require('cloudinary');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = async (filePath, uploadOption) => {
   try {
      if(!filePath){
        return null;
      }
      const response = await cloudinary.v2.uploader.upload(filePath, uploadOption);
      if(!response){
         return null;
      }
      fs.unlinkSync(filePath);
      return response.secure_url;
   } catch (error) {
      console.log(error);
      fs.unlinkSync(filePath);
      return null;
   }
};

module.exports = uploadFile;
