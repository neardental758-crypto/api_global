const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Configure Multer to store the file in memory temporarily before we process it with Sharp
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Optional: limit initial incoming file size to 10MB to prevent DoS
});

// Create root uploads directory if it doesn't exist
const rootUploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(rootUploadsDir)) {
    fs.mkdirSync(rootUploadsDir, { recursive: true });
}

router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const type = req.query.type;
        let subDir = '';
        let fileNamePrefix = 'trip-feedback';

        if (type === 'user') {
            subDir = 'users';
            fileNamePrefix = 'user-profile';
        } else if (type === 'vehiculo' || type === 'vpusuario' || type === 'vp_vehiculos_usuario') {
            subDir = 'vehiculos';
            fileNamePrefix = 'vehiculo';
        }

        const targetDir = path.join(rootUploadsDir, subDir);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const fileName = `${fileNamePrefix}-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
        const filePath = path.join(targetDir, fileName);

        // Process image with Sharp
        // We compress it to JPEG format with adjusted quality to ensure it typically falls under 350kb
        // Resize parameters: max width 1200 or max height 1200 (maintaining aspect ratio)
        await sharp(req.file.buffer)
            .resize({
                width: 1200,
                height: 1200,
                fit: sharp.fit.inside,
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 }) // 80 quality is usually a good balance to stay under 350kb for 1200px images
            .toFile(filePath);

        // Retrieve file stats to log and verify the final size
        const stats = fs.statSync(filePath);
        const fileSizeInBytes = stats.size;

        console.log(`Image saved locally: ${fileName} | Final size: ${(fileSizeInBytes / 1024).toFixed(2)} KB`);

        // Return the full domain path corresponding to express.static serving
        const relativeUrlPath = subDir ? `/uploads/${subDir}/${fileName}` : `/uploads/${fileName}`;
        const fullUrl = `${req.protocol}://${req.get('host')}${relativeUrlPath}`;

        return res.status(200).json({
            success: true,
            message: 'Image uploaded and compressed successfully',
            imageUrl: fullUrl,
            sizeKb: (fileSizeInBytes / 1024).toFixed(2)
        });

    } catch (error) {
        console.error('Error in /upload route:', error);
        return res.status(500).json({ error: 'Failed to process and upload image' });
    }
});

module.exports = router;
