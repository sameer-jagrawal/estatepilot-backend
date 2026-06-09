const ALLOWED_DATA_URL_PATTERN = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\r\n]+)$/i;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const getCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not configured");
  }

  return { cloudName, apiKey, apiSecret };
};

const isDataUrlImage = (value) => typeof value === "string" && ALLOWED_DATA_URL_PATTERN.test(value);

const isRemoteUrl = (value) => {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const uploadDataUrlImage = async (dataUrl, { folder = "estatepilot/properties" } = {}) => {
  const match = dataUrl.match(ALLOWED_DATA_URL_PATTERN);

  if (!match) {
    throw new Error("Only JPG, PNG, and WebP image uploads are allowed");
  }

  const imageBytes = Buffer.from(match[2], "base64");

  if (imageBytes.length > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 5MB or smaller");
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const formData = new FormData();
  formData.append("file", dataUrl);
  formData.append("folder", folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
    },
    body: formData,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message || "Cloudinary image upload failed");
  }

  return result.secure_url;
};

const uploadImageList = async (images, { tenantId, propertyId } = {}) => {
  if (!Array.isArray(images)) return [];

  const folderParts = ["estatepilot", "properties", tenantId, propertyId].filter(Boolean);
  const folder = folderParts.join("/");
  const uploadedImages = [];

  for (const image of images) {
    if (isDataUrlImage(image)) {
      uploadedImages.push(await uploadDataUrlImage(image, { folder }));
      continue;
    }

    if (isRemoteUrl(image)) {
      uploadedImages.push(image);
    }
  }

  return uploadedImages;
};

const uploadImageValue = async (image, { folder } = {}) => {
  if (!image) return image;
  if (isDataUrlImage(image)) return uploadDataUrlImage(image, { folder });
  if (isRemoteUrl(image)) return image;
  return null;
};

module.exports = {
  isDataUrlImage,
  uploadDataUrlImage,
  uploadImageValue,
  uploadImageList,
};
