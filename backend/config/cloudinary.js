const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "events",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

// ✅ Upload an image from a remote URL to Cloudinary
const uploadFromUrl = async (url) => {
  const result = await cloudinary.uploader.upload(url, {
    folder: "events",
    transformation: [
      { width: 900, height: 500, crop: "fill", quality: "auto", fetch_format: "auto" },
    ],
    public_id: `event_${Date.now()}`,
  });
  return result.secure_url;
};

const deleteImage = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes("cloudinary")) return;
  try {
    const parts = imageUrl.split("/");
    const publicId = parts.slice(-2).join("/").replace(/\.[^/.]+$/, "");
    await cloudinary.uploader.destroy(publicId);
    console.log("Deleted from Cloudinary:", publicId);
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
  }
};

module.exports = { cloudinary, upload, uploadFromUrl, deleteImage };