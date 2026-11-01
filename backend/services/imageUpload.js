import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const configureCloudinary = () => {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

configureCloudinary();

const hasCloudinaryConfig = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

export const uploadImages = async (files = [], folder = "khans_couture/custom_orders") => {
  if (!files.length) return [];
  configureCloudinary();

  if (!hasCloudinaryConfig()) {
    throw new Error("Cloudinary is not configured. Add the Cloudinary credentials to the backend environment.");
  }

  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          overwrite: false,
          unique_filename: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );

      stream.end(file.buffer);
    });
  });

  const urls = await Promise.all(uploadPromises);
  return urls;
};
