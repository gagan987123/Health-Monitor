const axios = require('axios');

// Configuration
const BACKEND_URL = 'https://health-monitor-uyt6.onrender.com/vitals';
const SEND_INTERVAL = 5000; // Send every 5 seconds
const TOTAL_READINGS = 20; // Total number of readings to send

// Helper function to generate random number in range
function randomInRange(min, max, decimals = 1) {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

// Generate random vitals data
function generateVitals() {
  const timestamp = new Date().toISOString();
  
  // Generate realistic vital signs
  const heartRate = randomInRange(60, 140, 0); // 60-140 bpm
  const spo2 = randomInRange(88, 100, 0); // 88-100%
  const temperature = randomInRange(35.5, 39.5, 1); // 35.5-39.5°C
  
  // Generate accelerometer data
  const accelX = randomInRange(-30, 30, 1);
  const accelY = randomInRange(-30, 30, 1);
  const accelZ = randomInRange(-30, 30, 1);
  const accelTotal = Math.sqrt(accelX**2 + accelY**2 + accelZ**2);
  
  // Generate gyroscope data
  const gyroX = randomInRange(-10, 10, 1);
  const gyroY = randomInRange(-10, 10, 1);
  const gyroZ = randomInRange(-10, 10, 1);
  
  // Determine if fall alert should be triggered (10% chance)
  const fallAlert = Math.random() < 0.1;
  
  return {
    timestamp,
    temperature,
    heartRate,
    spo2,
    accelerometer: {
      x: accelX,
      y: accelY,
      z: accelZ,
      total: parseFloat(accelTotal.toFixed(1))
    },
    gyroscope: {
      x: gyroX,
      y: gyroY,
      z: gyroZ
    },
    fallAlert
  };
}

// Send vitals to API
async function sendVitals(vitalsData) {
  try {
    const response = await axios.post(BACKEND_URL, vitalsData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ [${new Date().toLocaleTimeString()}] Vitals sent successfully`);
    console.log(`   Heart Rate: ${vitalsData.heartRate} bpm | SpO2: ${vitalsData.spo2}% | Temp: ${vitalsData.temperature}°C`);
    if (vitalsData.fallAlert) {
      console.log(`   🚨 FALL ALERT TRIGGERED!`);
    }
    console.log('');
    
    return response.data;
  } catch (error) {
    console.error(`❌ Error sending vitals:`, error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
  }
}

// Main function to send multiple vitals
async function sendMultipleVitals() {
  console.log('🏥 Starting Health Monitor Vitals Sender');
  console.log(`📡 Target: ${BACKEND_URL}`);
  console.log(`📊 Sending ${TOTAL_READINGS} readings every ${SEND_INTERVAL/1000} seconds`);
  console.log('═'.repeat(60));
  console.log('');
  
  let count = 0;
  
  const interval = setInterval(async () => {
    count++;
    
    console.log(`📤 Sending reading ${count}/${TOTAL_READINGS}...`);
    const vitals = generateVitals();
    await sendVitals(vitals);
    
    if (count >= TOTAL_READINGS) {
      clearInterval(interval);
      console.log('═'.repeat(60));
      console.log(`✅ Completed! Sent ${TOTAL_READINGS} vitals readings.`);
      process.exit(0);
    }
  }, SEND_INTERVAL);
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Script interrupted by user');
  process.exit(0);
});

// Run the script
sendMultipleVitals();
