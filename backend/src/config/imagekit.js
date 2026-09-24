import ImageKit from "imagekit";
import { config } from "./config.js";

const imagekit = new ImageKit({
  publicKey: config.IMAGEKIT_PUBLIC_KEY,
  privateKey: config.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: config.IMAGEKIT_URL_ENDPOINT,
});

function hasImageKitConfig() {
  return Boolean(
    config.IMAGEKIT_PUBLIC_KEY &&
    config.IMAGEKIT_PRIVATE_KEY &&
    config.IMAGEKIT_URL_ENDPOINT
  );
}

function createFileName(originalName = "upload") {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `chat-${Date.now()}-${safeName}`;
}

async function uploadChatMedia(file) {
  const fileName = createFileName(file.originalname);

  const result = await imagekit.upload({
    file: file.buffer,
    fileName,
    folder: "chat",
    useUniqueFileName: false,
  });

  return result.url;
}

export {
  uploadChatMedia,
  hasImageKitConfig,
};