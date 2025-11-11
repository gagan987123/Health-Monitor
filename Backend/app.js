require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins in development
        methods: ["GET", "POST"]
    }
});
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Hello World! smart helth monitoring is running v2');
});
// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Send welcome message to newly connected client
    socket.emit('connected', {
        message: 'Connected to vitals monitoring server',
        timestamp: new Date().toISOString()
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
    
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// Route to receive vitals data from ESP32 and broadcast to clients
app.post('/vitals', (req, res) => {
    try {
        const vitalsData = req.body;
        console.log('Received vitals data:', vitalsData);
        
        // Broadcast to all connected Socket.IO clients
        io.emit('vitals', {
            ...vitalsData,
            timestamp: new Date().toISOString()
        });
        
        // Send success response
        res.status(200).json({ 
            success: true, 
            message: 'Vitals data broadcasted successfully' 
        });
    } catch (error) {
        console.error('Error processing vitals data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error processing vitals data' 
        });
    }
});

// Configure nodemailer transporter
// Use SendGrid for production (works with Render), Gmail for local development
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // Use TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Route to send emergency email
app.post('/api/send-emergency-email', async (req, res) => {
    try {
        const { to, subject, html } = req.body;
        
        console.log('📧 Sending emergency email to:', to);
        
        const mailOptions = {
            from: '"Health Monitor Emergency Alert" <noreply@healthmonitor.com>',
            to: to,
            subject: subject,
            html: html
        };
        
        // Send email
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email sent successfully:', info.messageId);
        
        res.status(200).json({
            success: true,
            message: 'Emergency email sent successfully',
            messageId: info.messageId
        });
    } catch (error) {
        console.error('❌ Error sending email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send emergency email',
            error: error.message
        });
    }
});

// Start the server
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Socket.IO server running`);
});
