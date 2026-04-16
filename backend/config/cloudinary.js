const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// ======================
// CLOUDINARY CONFIG
// ======================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ======================
// STORAGE CONFIG
// ======================
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "eventflow",

      // IMPORTANT: ensures correct file type handling
      resource_type: "image",

      // optional but recommended
      allowed_formats: ["jpg", "jpeg", "png", "webp"],

      // prevents duplicate name issues
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

// ======================
// MULTER INSTANCE
// ======================
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit (prevents silent failure)
  },
});

module.exports = { cloudinary, upload };