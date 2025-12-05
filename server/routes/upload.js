import express from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth.js';

const router = express.Router();

/* ---------------------------------------------------------
   Multer Memory Storage (Vercel Compatible)
----------------------------------------------------------- */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
});

/* ---------------------------------------------------------
   Converts File Buffer to Base64 JSON
----------------------------------------------------------- */
function toBase64Response(file) {
  return {
    filename: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    base64: file.buffer.toString("base64"),
    uploadedAt: new Date()
  };
}

/* ---------------------------------------------------------
   Single File Upload
----------------------------------------------------------- */
router.post('/single', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    return res.json({
      message: 'File uploaded successfully',
      file: toBase64Response(req.file)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

/* ---------------------------------------------------------
   Multiple Files Upload
----------------------------------------------------------- */
router.post('/multiple', auth, upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: 'No files uploaded' });

    return res.json({
      message: 'Files uploaded successfully',
      files: req.files.map(f => toBase64Response(f))
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error uploading files', error: error.message });
  }
});

/* ---------------------------------------------------------
   Profile Image Upload
----------------------------------------------------------- */
router.post('/profile-image', auth, upload.single('profileImage'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    if (!req.file.mimetype.startsWith('image/'))
      return res.status(400).json({ message: 'Only image files are allowed' });

    return res.json({
      message: 'Profile image uploaded successfully',
      image: toBase64Response(req.file)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error uploading profile image', error: error.message });
  }
});

/* ---------------------------------------------------------
   Document Upload
----------------------------------------------------------- */
router.post('/document', auth, upload.single('document'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No document uploaded' });

    const { type = 'other', description = '' } = req.body;

    return res.json({
      message: 'Document uploaded successfully',
      document: {
        ...toBase64Response(req.file),
        type,
        description
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
});

export default router;
