const express = require("express");
const router = express.Router();

const {
  getEvents,
  getEventById,   // ✅ FIXED
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
} = require("../controllers/eventController");

const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// Cloudinary upload
const { upload } = require("../config/cloudinary");

// GET all events
router.get("/", getEvents);

// GET my events
router.get(
  "/my-events",
  protect,
  requireRole("organizer", "admin"),
  getMyEvents
);

// GET single event
router.get("/:id", getEventById); // ✅ FIXED

// CREATE event
router.post(
  "/",
  protect,
  requireRole("organizer", "admin"),
  upload.single("image"),
  createEvent
);

// UPDATE event
router.put(
  "/:id",
  protect,
  requireRole("organizer", "admin"),
  upload.single("image"),
  updateEvent
);

// DELETE event
router.delete(
  "/:id",
  protect,
  requireRole("organizer", "admin"),
  deleteEvent
);

module.exports = router;