import Inquiry from '../models/core/Inquiry.js';

// Create a new inquiry
export const createInquiry = async (req, res) => {
  try {
    const { name, email, phone, subject, message, inquiryType } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message || !inquiryType) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Create new inquiry
    const inquiry = new Inquiry({
      name,
      email,
      phone,
      subject,
      message,
      inquiryType
    });

    // Save to database
    await inquiry.save();

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
