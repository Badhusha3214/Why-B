const express  = require('express');
const path     = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl }               = require('@aws-sdk/s3-request-presigner');
const { protect, restrictTo }        = require('../middleware/protect');

const router = express.Router();

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const EXT_MAP = {
  'image/jpeg': '.jpg', 'image/jpg': '.jpg',
  'image/png':  '.png', 'image/webp': '.webp', 'image/gif': '.gif',
};

// R2 client (S3-compatible)
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// GET /api/v1/upload/presign?contentType=image/png  — admin only
// Returns a presigned PUT URL + the final public URL of the object.
// Frontend uploads directly to R2 using the presigned URL (no server bandwidth used).
router.get(
  '/presign',
  protect,
  restrictTo('admin'),
  async (req, res, next) => {
    try {
      const contentType = req.query.contentType;
      if (!contentType || !ALLOWED_TYPES.includes(contentType)) {
        return res.status(400).json({ status: 'error', message: 'Invalid or missing contentType' });
      }

      const ext      = EXT_MAP[contentType];
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;

      const command = new PutObjectCommand({
        Bucket:      process.env.R2_BUCKET_NAME,
        Key:         filename,
        ContentType: contentType,
      });

      const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 120 }); // 2 min TTL
      const publicUrl    = `${process.env.R2_PUBLIC_URL}/${filename}`;

      res.json({ status: 'success', presignedUrl, url: publicUrl });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
