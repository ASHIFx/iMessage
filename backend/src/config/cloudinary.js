import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { config } from "./config.js";

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

function hasCloudinaryConfig() {
  return Boolean(
    config.CLOUDINARY_CLOUD_NAME &&
    config.CLOUDINARY_API_KEY &&
    config.CLOUDINARY_API_SECRET
  );
}

// originalName = "My Photo (1).png"
// result = "chat-1749300000000-My_Photo__1_.png"
function createFileName(originalName = "upload") {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `chat-${Date.now()}-${safeName}`;
}

/**
 * Upload image or video to Cloudinary
 */
async function uploadChatMedia(file) {
  const fileName = createFileName(file.originalname);

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "chat",
        public_id: fileName,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });

  return result.secure_url;
}

export {
  uploadChatMedia,
  hasCloudinaryConfig,
};