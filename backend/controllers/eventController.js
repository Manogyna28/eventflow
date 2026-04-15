const Event = require('../models/Event');

// ==============================
// GET ALL EVENTS
// ==============================
const getEvents = async (req, res) => {
  try {
    const { category, search, location, page = 1, limit = 12 } = req.query;

    const query = {};

    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Event.countDocuments(query);

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      events,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==============================
// GET SINGLE EVENT
// ==============================
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email');

    if (!event) return res.status(404).json({ message: 'Event not found' });

    res.json(event);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==============================
// CREATE EVENT (FIXED)
// ==============================
const createEvent = async (req, res) => {
  try {
    console.log('📁 req.file:', req.file);
    console.log('📝 req.body:', req.body);

    const {
      title,
      description,
      category,
      date,
      location,
      venue,
      capacity,
      price,
      tags,
      imageUrl
    } = req.body;

    let image = '';

    // ✅ SAFE IMAGE HANDLING (NO CLOUDINARY REQUIRED)
    if (req.file && req.file.path) {
      image = req.file.path;
      console.log('✅ File image:', image);
    } else if (imageUrl && imageUrl.startsWith('http')) {
      image = imageUrl;
      console.log('✅ URL image:', image);
    } else {
      console.log('⚠️ No image provided');
    }

    const event = await Event.create({
      title,
      description,
      category,
      date,
      location,
      venue,
      capacity: Number(capacity) || 100,
      price: Number(price) || 0,
      image,
      organizer: req.user._id,
      tags: tags
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : [],
    });

    console.log('🎉 Event Created:', event._id);

    res.status(201).json(event);

  } catch (err) {
    console.error('❌ CREATE EVENT ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

// ==============================
// UPDATE EVENT
// ==============================
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const {
      title,
      description,
      category,
      date,
      location,
      venue,
      capacity,
      price,
      tags,
      imageUrl
    } = req.body;

    // Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (category) event.category = category;
    if (date) event.date = date;
    if (location) event.location = location;
    if (venue) event.venue = venue;
    if (capacity) event.capacity = capacity;
    if (price) event.price = price;

    // Image update
    if (req.file && req.file.path) {
      event.image = req.file.path;
    } else if (imageUrl && imageUrl.startsWith('http')) {
      event.image = imageUrl;
    }

    if (tags) {
      event.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    const updated = await event.save();

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==============================
// DELETE EVENT
// ==============================
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await event.deleteOne();

    res.json({ message: 'Event deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==============================
// GET MY EVENTS (FIXED ROUTE)
// ==============================
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .sort({ createdAt: -1 });

    res.json(events);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
};