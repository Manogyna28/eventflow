const express = require("express");
const router = express.Router();

const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
} = require("../controllers/eventController");

const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// 🔥 IMPORT CLOUDINARY UPLOAD
const { upload } = require("../config/cloudinary");

router.get("/", getEvents);
router.get("/my-events", protect, requireRole("organizer", "admin"), getMyEvents);

// 🔥 IMPORTANT: keep this BEFORE /:id
router.get("/:id", getEvent);

// 🔥 CREATE EVENT (image upload)
router.post(
  "/",
  protect,
  requireRole("organizer", "admin"),
  upload.single("image"),
  createEvent
);

// 🔥 UPDATE EVENT
router.put(
  "/:id",
  protect,
  requireRole("organizer", "admin"),
  upload.single("image"),
  updateEvent
);

// 🔥 DELETE EVENT
router.delete(
  "/:id",
  protect,
  requireRole("organizer", "admin"),
  deleteEvent
);

module.exports = router;