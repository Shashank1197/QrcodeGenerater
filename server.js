const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const QRCode = require('qrcode');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qr-generator', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// QR Code Schema
const qrSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    qrCode: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const QR = mongoose.model('QR', qrSchema);

// Routes
app.post('/api/generate', async (req, res) => {
    try {
        const { url } = req.body;
        
        // Generate QR code as data URL
        const qrCodeDataUrl = await QRCode.toDataURL(url);
        
        // Save to database
        const qr = new QR({
            url,
            qrCode: qrCodeDataUrl
        });
        await qr.save();
        
        res.json({ 
            success: true, 
            qrCode: qrCodeDataUrl,
            id: qr._id
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate QR code' 
        });
    }
});

app.get('/api/recent', async (req, res) => {
    try {
        const recentQrs = await QR.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('url qrCode createdAt');
        
        res.json({ 
            success: true, 
            qrs: recentQrs 
        });
    } catch (error) {
        console.error('Error fetching recent QR codes:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch recent QR codes' 
        });
    }
});

app.get('/api/download/:id', async (req, res) => {
    try {
        const qr = await QR.findById(req.params.id);
        if (!qr) {
            return res.status(404).json({ 
                success: false, 
                error: 'QR code not found' 
            });
        }

        // Convert data URL to buffer
        const qrBuffer = Buffer.from(qr.qrCode.split(',')[1], 'base64');
        
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename=qr-${qr._id}.png`);
        res.send(qrBuffer);
    } catch (error) {
        console.error('Error downloading QR code:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to download QR code' 
        });
    }
});

app.delete('/api/recent', async (req, res) => {
    try {
        await QR.deleteMany({});
        res.json({ 
            success: true, 
            message: 'All recent URLs have been cleared' 
        });
    } catch (error) {
        console.error('Error clearing recent URLs:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to clear recent URLs' 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 