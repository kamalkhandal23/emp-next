import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [15, 'Phone number cannot exceed 15 characters']
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    inquiryType: {
      type: String,
      required: [true, 'Inquiry type is required'],
      enum: {
        values: ['general', 'services', 'nextgen', 'careers', 'partnership', 'support'],
        message: 'Invalid inquiry type'
      },
      default: 'general'
    }
  }
);
const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);

export default Inquiry;
