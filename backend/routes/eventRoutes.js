const express = require("express");
const router = express.Router();

const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
} = require("../controllers/eventController");

const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const { upload } = require("../config/cloudinary");

// ==============================
// PUBLIC ROUTES
// ==============================
router.get("/", getEvents);
router.get(                          // ← MUST come before /:id
  "/my-events",                      // ← fix name (was /myevents)
  protect,
  requireRole("organizer", "admin"),
  getMyEvents
);
router.get("/:id", getEventById);

// ==============================
// PRIVATE ROUTES (AUTH REQUIRED)
// ==============================

// ✅ FIXED: match frontend route (/events/myevents)
router.get(
  "/myevents",
  protect,
  requireRole("organizer", "admin"),
  getMyEvents
);

// CREATE EVENT
router.post(
  "/",
  protect,
  requireRole("organizer", "admin"),
  upload.single("image"),
  createEvent
);

// UPDATE EVENT
router.put(
  "/:id",
  protect,
  requireRole("organizer", "admin"),
  upload.single("image"),
  updateEvent
);

// DELETE EVENT
router.delete(
  "/:id",
  protect,
  requireRole("organizer", "admin"),
  deleteEvent
);

module.exports = router;