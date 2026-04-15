const Event = require('../models/Event');
const { deleteImage, uploadFromUrl } = require('../config/cloudinary');

// GET /api/events
const getEvents = async (req, res) => {
  try {
    const { category, search, location, status, featured, page = 1, limit = 12 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (status)   query.status   = status;
    if (featured) query.featured = true;
    if (search)   query.$or = [
      { title:       { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags:        { $in: [new RegExp(search, 'i')] } },
    ];

    const total  = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email avatar')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ events, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/events/featured
const getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.find({ featured: true, status: 'upcoming' })
      .populate('organizer', 'name')
      .sort({ date: 1 })
      .limit(6);
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email avatar bio');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/events
const createEvent = async (req, res) => {
  try {
    console.log('📁 req.file:', req.file);
    console.log('📝 req.body:', req.body);

    const {
      title, description, category, date, endDate,
      location, venue, capacity, price, tags,
      registrationDeadline, imageUrl,             // ✅ imageUrl from body
    } = req.body;

    let image = '';

    if (req.file) {
      // File uploaded via multer → Cloudinary (existing flow)
      image = req.file.path;
      console.log('✅ Image from file upload:', image);
    } else if (imageUrl && imageUrl.startsWith('http')) {
      // URL provided → fetch and upload to Cloudinary
      try {
        image = await uploadFromUrl(imageUrl);
        console.log('✅ Image from URL upload:', image);
      } catch (err) {
        console.error('⚠️ URL upload failed, storing URL directly:', err.message);
        image = imageUrl; // fallback: store as-is
      }
    }

    const event = await Event.create({
      title, description, category, date,
      endDate:              endDate             || null,
      location, venue,
      capacity:             Number(capacity)    || 100,
      price:                Number(price)       || 0,
      image,
      organizer:            req.user._id,
      registrationDeadline: registrationDeadline || null,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });

    console.log('✅ Event created with image:', event.image);
    res.status(201).json(event);
  } catch (err) {
    console.error('❌ createEvent error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) return res.status(403).json({ message: 'Not authorized' });

    const fields = [
      'title', 'description', 'category', 'date', 'endDate',
      'location', 'venue', 'capacity', 'price', 'status', 'featured', 'registrationDeadline',
    ];
    fields.forEach(f => { if (req.body[f] !== undefined) event[f] = req.body[f]; });

    if (req.file) {
      // New file uploaded
      await deleteImage(event.image);
      event.image = req.file.path;
    } else if (req.body.imageUrl && req.body.imageUrl.startsWith('http')) {
      // New URL provided
      try {
        await deleteImage(event.image);
        event.image = await uploadFromUrl(req.body.imageUrl);
      } catch (err) {
        console.error('⚠️ URL upload failed on update:', err.message);
        event.image = req.body.imageUrl; // fallback
      }
    }

    if (req.body.tags)
      event.tags = req.body.tags.split(',').map(t => t.trim()).filter(Boolean);

    const updated = await event.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) return res.status(403).json({ message: 'Not authorized' });

    await deleteImage(event.image);
    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/events/organizer/myevents
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
  getEvents, getFeaturedEvents, getEventById,
  createEvent, updateEvent, deleteEvent, getMyEvents,
};