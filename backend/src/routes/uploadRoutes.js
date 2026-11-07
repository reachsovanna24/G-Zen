const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// POST /api/upload - Secured endpoint for administrative product image uploads
router.post('/', verifyToken, requireAdmin, (req, res) => {
  try {
    const { base64, filename } = req.body;
    if (!base64) {
      return res.status(400).json({ success: false, message: 'Image payload is required.' });
    }

    let ext = 'jpg';
    let data = base64;
    const match = base64.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (match) {
      const mime = match[1].toLowerCase();
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('gif')) ext = 'gif';
      else if (mime.includes('svg')) ext = 'svg';
      else ext = 'jpg';
      data = match[2];
    }

    const buffer = Buffer.from(data, 'base64');
    const cleanName = (filename || 'product')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);

    const uniqueFilename = `prod_${Date.now()}_${cleanName}.${ext}`;
    const filePath = path.join(uploadsDir, uniqueFilename);
    fs.writeFileSync(filePath, buffer);

    const url = `/uploads/${uniqueFilename}`;

    return res.status(200).json({
      success: true,
      url,
      filename: uniqueFilename,
      size: buffer.length,
      message: 'Product image uploaded and stored successfully.'
    });
  } catch (err) {
    console.error('Image upload error:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload image: ' + err.message });
  }
});

module.exports = router;

