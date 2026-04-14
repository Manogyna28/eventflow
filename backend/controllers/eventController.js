const Event = require("../models/Event");
const { cloudinary } = require("../config/cloudinary");

// 🔥 Delete old image from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes("cloudinary")) return;

  try {
    const parts = imageUrl.split("/");
    const publicId = parts.slice(-2).join("/").split(".")[0];

    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
  }
};

// ✅ GET ALL EVENTS
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET SINGLE EVENT
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ CREATE EVENT
const createEvent = async (req, res) => {
  try {
    // 🔥 IMPORTANT LINE
    const image = req.file ? req.file.path : "";

    const event = await Event.create({
      ...req.body,
      image,
      organizer: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE EVENT
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // 🔥 Replace image if new uploaded
    if (req.file) {
      await deleteFromCloudinary(event.image);
      event.image = req.file.path;
    }

    Object.assign(event, req.body);

    const updated = await event.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE EVENT
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await deleteFromCloudinary(event.image);

    await event.deleteOne();

    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ MY EVENTS
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔥 FIX EXPORT NAME
module.exports = {
  getEvents,
  getEvent: getEventById, // ✅ IMPORTANT FIX
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
};