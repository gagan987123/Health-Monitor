require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

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

// AWS Lambda function URL for sending emails
const LAMBDA_EMAIL_FUNCTION_URL = process.env.LAMDA_URL;

// Simple email sending function using AWS Lambda
async function sendEmailViaLambda({ to, subject, html }) {
    try {
        const response = await axios.post(LAMBDA_EMAIL_FUNCTION_URL, {
            to,
            subject,
            html
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 15000 // Increased timeout to 15 seconds
        });
        
        // Handle the Lambda response format
        if (response.data && response.data.body) {
            return typeof response.data.body === 'string' 
                ? JSON.parse(response.data.body) 
                : response.data.body;
        }
        return response.data;
    } catch (error) {
        console.error('Error calling email Lambda:', error.message);
        if (error.response) {
            console.error('Lambda response error:', error.response.data);
        }
        throw new Error('Failed to send email via Lambda');
    }
}

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
        
        // Send email via Lambda
        const lambdaResponse = await sendEmailViaLambda({ to, subject, html });
        
        console.log('✅ Email sent successfully via Lambda:', lambdaResponse.messageId || 'No message ID returned');
        
        res.status(200).json({
            success: true,
            message: 'Emergency email sent successfully',
            messageId: lambdaResponse.messageId || 'unknown'
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
