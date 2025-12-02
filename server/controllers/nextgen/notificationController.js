import Notification from '../../models/nextgen/Notification.js';

// Create a new notification
export const createNotification = async (req, res) => {
  try {
    const { name, email, contact } = req.body;

    // Validate required fields
    if (!name || !email || !contact) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, and contact are required',
      });
    }

    // Validate name
    if (name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be empty',
      });
    }

    // Validate email format (basic check)
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
    }

    // Validate contact
    if (contact.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Contact cannot be empty',
      });
    }

    // Create the notification
    const notification = new Notification({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      contact: contact.trim(),
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: {
        id: notification._id,
        name: notification.name,
        email: notification.email,
        contact: notification.contact,
        createdAt: notification.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);

    // Handle duplicate key error if any unique constraints
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A notification with this information already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message,
    });
  }
};

// Get all notifications (admin route)
export const getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
      ];
    }

    const notifications = await Notification.find(query)
      .select('name email contact createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
};

export default {
  createNotification,
  getAllNotifications,
};
