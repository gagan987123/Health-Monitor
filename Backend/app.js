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

// Groq AI API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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

// Route to get AI health prediction using Groq
app.post('/api/ai-predict', async (req, res) => {
    try {
        const { vitalsHistory } = req.body;
        
        if (!GROQ_API_KEY) {
            return res.status(500).json({
                success: false,
                message: 'Groq API key not configured'
            });
        }

        console.log('🤖 Getting AI prediction for vitals history');
        
        // Format vitals data for the prompt
        const vitalsData = vitalsHistory.map((vital, index) => {
            const time = vital.timestamp ? new Date(vital.timestamp).toLocaleString() : `Reading ${index + 1}`;
            return `Time: ${time}
  - Heart Rate: ${vital.heartRate || vital.heart_rate || 'N/A'} bpm
  - SpO2: ${vital.spo2 || 'N/A'}%
  - Temperature: ${vital.temperature || 'N/A'}°C`;
        }).join('\n\n');

        // Create the prompt for Groq AI
        const prompt = `You are a medical AI assistant analyzing patient vital signs. Based on the following vital signs history, provide a comprehensive health prediction and recommendations.

Vital Signs History:
${vitalsData}

Please analyze this data and provide:
1. Current Health Status: Brief assessment of the current vital signs
2. Trend Analysis: Identify any concerning trends or patterns
3. Risk Assessment: Potential health risks based on the data
4. Recommendations: Specific actionable health recommendations
5. When to Seek Medical Attention: Warning signs to watch for

Format your response in a clear, structured manner. Be professional but easy to understand. If any vitals are concerning, emphasize the importance of consulting a healthcare professional.`;

        // Call Groq API
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful medical AI assistant that analyzes vital signs and provides health insights. Always remind users to consult healthcare professionals for serious concerns.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 1,
                stream: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        const prediction = response.data.choices[0].message.content;
        
        console.log('✅ AI prediction generated successfully');
        
        res.status(200).json({
            success: true,
            prediction: prediction,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error getting AI prediction:', error.message);
        if (error.response) {
            console.error('Groq API error:', error.response.data);
        }
        res.status(500).json({
            success: false,
            message: 'Failed to get AI prediction',
            error: error.message
        });
    }
});

// Start the server
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Socket.IO server running`);
});