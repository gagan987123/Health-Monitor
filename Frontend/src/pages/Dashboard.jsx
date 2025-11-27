import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { 
  Box, Container, Grid, Typography, Paper, Alert, Snackbar, 
  IconButton, Collapse, List, ListItem, ListItemText, 
  ListItemIcon, Divider, styled 
} from '@mui/material';
import { 
  Favorite as HeartIcon,
  Air as Spo2Icon,
  Thermostat as TempIcon,
  MedicalServices as EmergencyIcon,
  Warning as AlertIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import useStore from '../store/useStore';
import StatCard from '../components/Dashboard/StatCard';
import HeartRateChart from '../components/Dashboard/HeartRateChart';
import SpO2Chart from '../components/Dashboard/SpO2Chart';
import TemperatureChart from '../components/Dashboard/TemperatureChart';
import AIPrediction from '../components/Dashboard/AIPrediction';


const THRESHOLDS = {
  HEART_RATE: { min: 60, max: 100 },
  SPO2: { min: 92, max: 100 },
  TEMPERATURE: { min: 97, max: 100.4 },
};

const SEVERITY = {
  LOW: 'low',
  HIGH: 'high',
  CRITICAL: 'critical'
};

const Dashboard = () => {
  const { vitals, emergency, updateVitals } = useStore();
  const [alerts, setAlerts] = React.useState([]);
  const [showAlerts, setShowAlerts] = React.useState(true);
  const [socketConnected, setSocketConnected] = React.useState(false);
  const alertIdCounter = React.useRef(0);

  // Function to dismiss an alert
  const dismissAlert = (alertId) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
  };

  // Initialize Socket.IO connection
  useEffect(() => {
    // Connect to the WebSocket server
    const backendUrl = 'https://health-monitor-uyt6.onrender.com';
    const socket = io(backendUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection established
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setSocketConnected(true);
    });

    // Handle vitals updates from WebSocket
    socket.on('vitals', (data) => {
      processVitalsData(data);
    });

    // Connection closed
    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setSocketConnected(false);
    });

    // Connection error
    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setSocketConnected(false);
    });

    // Clean up on component unmount
    return () => {
      socket.disconnect();
    };
  }, [updateVitals]);

  // Advanced fall detection algorithm
  const detectFall = (accelerometer, gyroscope) => {
    if (!accelerometer || !gyroscope) return false;

    // Calculate total acceleration magnitude
    const totalAccel = accelerometer.total || Math.sqrt(
      Math.pow(accelerometer.x, 2) + 
      Math.pow(accelerometer.y, 2) + 
      Math.pow(accelerometer.z, 2)
    );

    // Calculate total gyroscope magnitude (rotation rate)
    const totalGyro = Math.sqrt(
      Math.pow(gyroscope.x, 2) + 
      Math.pow(gyroscope.y, 2) + 
      Math.pow(gyroscope.z, 2)
    );

    // Fall detection thresholds
    const FREEFALL_THRESHOLD = 6.0;  // m/s² - Sudden drop in acceleration
    const IMPACT_THRESHOLD = 20.0;   // m/s² - High impact force
    const GYRO_THRESHOLD = 3.0;      // rad/s - Rapid rotation during fall

    // Detect freefall (sudden decrease in acceleration)
    const isFreefalling = totalAccel < FREEFALL_THRESHOLD;
    
    // Detect high impact (sudden increase in acceleration)
    const isHighImpact = totalAccel > IMPACT_THRESHOLD;
    
    // Detect rapid rotation (tumbling during fall)
    const isRapidRotation = totalGyro > GYRO_THRESHOLD;

    // A fall is detected if:
    // 1. High impact with rapid rotation (sudden fall or crash)
    // 2. Freefall followed by impact (typical fall pattern)
    const isFall = (isHighImpact && isRapidRotation) || 
                   (isFreefalling && totalGyro > 1.0);



    return isFall;
  };

  // Function to send emergency email notification
  const sendEmergencyEmail = async (emergencyData) => {
    try {
      const emailData = {
        to: 'ginnysangral786@gmail.com',
        subject: `🚨 EMERGENCY ALERT: ${emergencyData.fallType}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff3cd; border: 2px solid #dc3545; border-radius: 10px;">
            <h1 style="color: #dc3545; text-align: center;">🚨 EMERGENCY FALL ALERT 🚨</h1>
            
            <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #dc3545;">Incident Details</h2>
              <p><strong>Type:</strong> ${emergencyData.fallType}</p>
              <p><strong>Impact Force:</strong> ${emergencyData.impactForce} m/s²</p>
              <p><strong>Time:</strong> ${new Date(emergencyData.timestamp).toLocaleString()}</p>
            </div>

            <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #0066cc;">Patient Location</h2>
              <p><strong>Coordinates:</strong> ${emergencyData.patientLocation.lat.toFixed(6)}, ${emergencyData.patientLocation.lon.toFixed(6)}</p>
              <p><a href="https://www.google.com/maps?q=${emergencyData.patientLocation.lat},${emergencyData.patientLocation.lon}" 
                     style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View on Google Maps
              </a></p>
            </div>

            <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #ff6b6b;">Patient Vitals</h2>
              <p><strong>Heart Rate:</strong> ${emergencyData.vitals.heartRate} bpm</p>
              <p><strong>SpO2:</strong> ${emergencyData.vitals.spo2}%</p>
              <p><strong>Temperature:</strong> ${emergencyData.vitals.temperature}°C</p>
            </div>

            <div style="background-color: #dc3545; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
              <h3 style="margin: 0;">⚠️ IMMEDIATE MEDICAL ATTENTION REQUIRED ⚠️</h3>
            </div>
          </div>
        `
      };

      const backendUrl = 'https://health-monitor-uyt6.onrender.com';
      const response = await fetch(`${backendUrl}/api/send-emergency-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        console.log('✅ Emergency email sent successfully');
      } else {
        console.error('❌ Failed to send emergency email:', await response.text());
      }
    } catch (error) {
      console.error('❌ Error sending emergency email:', error);
    }
  };

  // Process incoming WebSocket data
  const processVitalsData = (data) => {
    // Update store with new vitals
    updateVitals({
      heartRate: data.heartRate || 0,
      spo2: data.spo2 || 0,
      temperature: data.temperature || 0,
      timestamp: data.timestamp || new Date().toISOString()
    });

    // Generate alerts for critical values
    const newAlerts = [];
    
    if (data.heartRate && data.heartRate > 120) {
      newAlerts.push({
        id: `alert-${++alertIdCounter.current}`,
        type: 'high',
        message: `High heart rate: ${data.heartRate} bpm`,
        timestamp: new Date().toISOString(),
      });
    }
    
    if (data.spo2 && data.spo2 < 90) {
      newAlerts.push({
        id: `alert-${++alertIdCounter.current}`,
        type: 'critical',
        message: `Low SpO2: ${data.spo2}%`,
        timestamp: new Date().toISOString(),
      });
    }
    
    if (data.temperature && data.temperature > 38) {
      newAlerts.push({
        id: `alert-${++alertIdCounter.current}`,
        type: 'high',
        message: `High temperature: ${data.temperature}°C`,
        timestamp: new Date().toISOString(),
      });
    }

    // Handle fall detection with advanced algorithm
    const isFallDetected = data.fallAlert === true && 
                          detectFall(data.accelerometer, data.gyroscope);
    
    if (isFallDetected) {
      const totalAccel = data.accelerometer?.total || Math.sqrt(
        Math.pow(data.accelerometer?.x || 0, 2) + 
        Math.pow(data.accelerometer?.y || 0, 2) + 
        Math.pow(data.accelerometer?.z || 0, 2)
      );
      
      // Determine fall severity
      const fallType = totalAccel > 20 ? 'HIGH IMPACT (Possible car crash or severe fall)' : 'FALL DETECTED';
      
      console.log('🚨', fallType, '🚨');
      console.log('Accelerometer:', data.accelerometer);
      console.log('Gyroscope:', data.gyroscope);
      console.log('Impact Force:', totalAccel.toFixed(2), 'm/s²');
      
      // Get user's geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            const nearestHospital = findNearestHospital(userLat, userLon);
            
            console.log('🏥 NEAREST HOSPITAL INFORMATION:');
            console.log('Patient Location:', `https://www.google.com/maps?q=${userLat},${userLon}`);
            console.log('Hospital Name:', nearestHospital.name);
            console.log('Distance:', nearestHospital.distance.toFixed(2), 'km');
            console.log('Contact:', nearestHospital.contact);
            console.log('Address:', nearestHospital.address);
         
            // Send emergency email notification
            sendEmergencyEmail({
              fallType,
              impactForce: totalAccel.toFixed(1),
              patientLocation: { lat: userLat, lon: userLon },
              nearestHospital,
              vitals: {
                heartRate: data.heartRate,
                spo2: data.spo2,
                temperature: data.temperature
              },
              timestamp: new Date().toISOString()
            });
         
            // Add critical fall alert with severity info
            newAlerts.push({
              id: `alert-${++alertIdCounter.current}`,
              type: 'critical',
              message: `🚨 ${fallType}! Impact: ${totalAccel.toFixed(1)} m/s². Hospital: ${nearestHospital.name} (${nearestHospital.distance.toFixed(2)} km)`,
              timestamp: new Date().toISOString(),
            });
            
            setAlerts(prevAlerts => [...prevAlerts, ...newAlerts]);
            setShowAlerts(true);
          },
          (error) => {
            console.error('Error getting location:', error);
            // Add fall alert without location
            const totalAccel = data.accelerometer?.total || Math.sqrt(
              Math.pow(data.accelerometer?.x || 0, 2) + 
              Math.pow(data.accelerometer?.y || 0, 2) + 
              Math.pow(data.accelerometer?.z || 0, 2)
            );
            const fallType = totalAccel > 20 ? 'HIGH IMPACT' : 'FALL DETECTED';
            
            newAlerts.push({
              id: `alert-${++alertIdCounter.current}`,
              type: 'critical',
              message: `🚨 ${fallType}! Impact: ${totalAccel.toFixed(1)} m/s². Unable to get location.`,
              timestamp: new Date().toISOString(),
            });
            
            setAlerts(prevAlerts => [...prevAlerts, ...newAlerts]);
            setShowAlerts(true);
          }
        );
      } else {
        // Geolocation not supported
        const totalAccel = data.accelerometer?.total || Math.sqrt(
          Math.pow(data.accelerometer?.x || 0, 2) + 
          Math.pow(data.accelerometer?.y || 0, 2) + 
          Math.pow(data.accelerometer?.z || 0, 2)
        );
        const fallType = totalAccel > 20 ? 'HIGH IMPACT' : 'FALL DETECTED';
        
        newAlerts.push({
          id: `alert-${++alertIdCounter.current}`,
          type: 'critical',
          message: `🚨 ${fallType}! Impact: ${totalAccel.toFixed(1)} m/s². Geolocation not supported.`,
          timestamp: new Date().toISOString(),
        });
        
        setAlerts(prevAlerts => [...prevAlerts, ...newAlerts]);
        setShowAlerts(true);
      }
      
      return; // Exit early for fall alert
    }

    // Add new alerts if any (for non-fall alerts)
    if (newAlerts.length > 0) {
      setAlerts(prevAlerts => [...prevAlerts, ...newAlerts]);
      setShowAlerts(true);
    }
  };

  const checkThresholds = (data) => {
    const newAlerts = [];
    const now = new Date().toLocaleTimeString();
    
    // Check heart rate
    if (data.heart_rate < THRESHOLDS.HEART_RATE.min) {
      newAlerts.push({
        id: Date.now(),
        time: now,
        type: 'Heart Rate',
        message: `Low heart rate: ${data.heart_rate} bpm`,
        severity: data.heart_rate < 50 ? SEVERITY.CRITICAL : SEVERITY.LOW,
        value: data.heart_rate,
        unit: 'bpm'
      });
    } else if (data.heart_rate > THRESHOLDS.HEART_RATE.max) {
      newAlerts.push({
        id: Date.now(),
        time: now,
        type: 'Heart Rate',
        message: `High heart rate: ${data.heart_rate} bpm`,
        severity: data.heart_rate > 130 ? SEVERITY.CRITICAL : SEVERITY.HIGH,
        value: data.heart_rate,
        unit: 'bpm'
      });
    }

    // Check SpO2
    if (data.spo2 < THRESHOLDS.SPO2.min) {
      newAlerts.push({
        id: Date.now() + 1,
        time: now,
        type: 'SpO2',
        message: `Low oxygen level: ${data.spo2}%`,
        severity: data.spo2 < 90 ? SEVERITY.CRITICAL : SEVERITY.LOW,
        value: data.spo2,
        unit: '%'
      });
    }

    // Check temperature
    if (data.temperature < THRESHOLDS.TEMPERATURE.min) {
      newAlerts.push({
        id: Date.now() + 2,
        time: now,
        type: 'Temperature',
        message: `Low body temperature: ${data.temperature}°F`,
        severity: SEVERITY.LOW,
        value: data.temperature,
        unit: '°F'
      });
    } else if (data.temperature > THRESHOLDS.TEMPERATURE.max) {
      newAlerts.push({
        id: Date.now() + 2,
        time: now,
        type: 'Temperature',
        message: `High fever: ${data.temperature}°F`,
        severity: data.temperature > 102 ? SEVERITY.CRITICAL : SEVERITY.HIGH,
        value: data.temperature,
        unit: '°F'
      });
    }

    // Check for fall detection
    if (data.fall_detected) {
      newAlerts.push({
        id: Date.now() + 3,
        time: now,
        type: 'Fall Detected',
        message: 'Possible fall detected!',
        severity: SEVERITY.CRITICAL,
        value: null,
        unit: ''
      });
    }

    // Add new alerts to the beginning of the array and keep only last 10 alerts
    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case SEVERITY.CRITICAL: return 'error';
      case SEVERITY.HIGH: return 'warning';
      case SEVERITY.LOW: return 'info';
      default: return 'info';
    }
  };

  // Store vitals history for charts
  const [vitalsHistory, setVitalsHistory] = React.useState([]);

  // Function to calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Function to find nearest hospital
  const findNearestHospital = (userLat, userLon) => {
    // Real hospitals in Bangalore with accurate coordinates and contact information
    const hospitals = [
      { 
        name: 'Manipal Hospital (Old Airport Road)', 
        lat: 12.9698, 
        lon: 77.6500, 
        contact: '+91 80 2502 4444',
        address: '98, HAL Old Airport Rd, HAL 2nd Stage, Kodihalli, Bengaluru, Karnataka 560017'
      },
      { 
        name: 'Apollo Hospitals (Bannerghatta Road)', 
        lat: 12.8898, 
        lon: 77.5995, 
        contact: '+91 80 2630 4050',
        address: '154/11, Opposite IIM-B, Bannerghatta Rd, Bengaluru, Karnataka 560076'
      },
      { 
        name: 'Fortis Hospital (Bannerghatta Road)', 
        lat: 12.9007, 
        lon: 77.6010, 
        contact: '+91 80 6621 4444',
        address: '154/9, Opposite IIM-B, Bannerghatta Rd, Bengaluru, Karnataka 560076'
      },
      { 
        name: 'Narayana Health City', 
        lat: 12.8066, 
        lon: 77.5540, 
        contact: '+91 80 7122 2222',
        address: '258/A, Bommasandra Industrial Area, Anekal Taluk, Bengaluru, Karnataka 560099'
      },
      { 
        name: 'Columbia Asia Hospital (Whitefield)', 
        lat: 12.9698, 
        lon: 77.7499, 
        contact: '+91 80 6165 6666',
        address: 'Survey No. 10P & 12P, Ramagondanahalli, Varthur Hobli, Whitefield, Bengaluru, Karnataka 560066'
      },
      { 
        name: 'St. John\'s Medical College Hospital', 
        lat: 12.9345, 
        lon: 77.6186, 
        contact: '+91 80 2206 5000',
        address: 'Sarjapur Rd, near Koramangala, Bengaluru, Karnataka 560034'
      },
      { 
        name: 'Sakra World Hospital', 
        lat: 12.9698, 
        lon: 77.7499, 
        contact: '+91 80 4969 4969',
        address: 'SY NO 52/2 & 52/3, Devarabeesanahalli, Varthur Hobli, Outer Ring Rd, Bengaluru, Karnataka 560103'
      },
      { 
        name: 'BGS Gleneagles Global Hospital', 
        lat: 12.9716, 
        lon: 77.5946, 
        contact: '+91 80 2222 7979',
        address: 'No. 4, Sunkalpalya, Sunkadakatte, Bengaluru, Karnataka 560091'
      },
      { 
        name: 'Aster CMI Hospital', 
        lat: 13.0358, 
        lon: 77.5970, 
        contact: '+91 80 4344 4444',
        address: '43/2, New Airport Rd, NH.7, Sahakara Nagar, Bengaluru, Karnataka 560092'
      },
      { 
        name: 'Bangalore Baptist Hospital', 
        lat: 12.9716, 
        lon: 77.5946, 
        contact: '+91 80 2668 6666',
        address: 'Bellary Rd, Hebbal, Bengaluru, Karnataka 560024'
      },
      { 
        name: 'Vydehi Institute of Medical Sciences', 
        lat: 13.0697, 
        lon: 77.6416, 
        contact: '+91 80 2841 2636',
        address: '#82, EPIP Area, Whitefield, Bengaluru, Karnataka 560066'
      },
      { 
        name: 'Mallya Hospital', 
        lat: 12.9716, 
        lon: 77.5946, 
        contact: '+91 80 2227 7979',
        address: 'No. 2, Vittal Mallya Rd, Ashok Nagar, Bengaluru, Karnataka 560001'
      }
    ];

    let nearestHospital = null;
    let minDistance = Infinity;

    hospitals.forEach(hospital => {
      const distance = calculateDistance(userLat, userLon, hospital.lat, hospital.lon);
      if (distance < minDistance) {
        minDistance = distance;
        nearestHospital = { ...hospital, distance };
      }
    });

    return nearestHospital;
  };

  // Function to handle emergency
  const handleEmergency = (emergencyData) => {
    if (emergencyData.coordinates) {
      const [lat, lon] = emergencyData.coordinates.split(',').map(Number);
      const nearestHospital = findNearestHospital(lat, lon);
      
      console.log('🚨 EMERGENCY ALERT 🚨');
      console.log('Patient Location:', `https://www.google.com/maps?q=${lat},${lon}`);
      console.log('Nearest Hospital:', nearestHospital.name);
      console.log('Distance:', nearestHospital.distance.toFixed(2), 'km');
      console.log('Contact:', nearestHospital.contact);
      console.log('Emergency Details:', {
        heartRate: emergencyData.heart_rate,
        spo2: emergencyData.spo2,
        temperature: emergencyData.temperature,
        fallDetected: emergencyData.fall_detected
      });
      
      // In a real app, you would make an API call here to notify emergency services
      // For example: notifyEmergencyServices(emergencyData, nearestHospital);
    }
  };

  // Update vitals history when new data arrives via WebSocket
  useEffect(() => {
    if (vitals.heartRate || vitals.spo2 || vitals.temperature) {
      const newDataPoint = {
        timestamp: vitals.lastUpdated || new Date().toISOString(),
        heart_rate: vitals.heartRate,
        spo2: vitals.spo2,
        temperature: vitals.temperature
      };
      
      setVitalsHistory(prevHistory => {
        // Keep only the last 6 data points for chart display
        const updatedHistory = [...prevHistory, newDataPoint];
        return updatedHistory.slice(-6);
      });
    }
  }, [vitals]);

  // Chart component now handles the chart data and options

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: { xs: 1, sm: 2, md: 3 },
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      <Snackbar 
        open={!socketConnected} 
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" sx={{ width: '100%' }}>
          Reconnecting to real-time monitoring...
        </Alert>
      </Snackbar>
      {/* Emergency Alert Banner */}
      {emergency.isActive && (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: 'error.light',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <EmergencyIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            EMERGENCY ALERT: Help is on the way to your location
          </Typography>
        </Paper>
      )}

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: { xs: 1, sm: 2, md: 3 } }}>
        <StatCard
          title="Heart Rate"
          value={vitals.heartRate}
          icon={<HeartIcon />}
          color="error"
          unit="bpm"
        />
        <StatCard
          title="SpO2"
          value={vitals.spo2}
          icon={<Spo2Icon />}
          color="info"
          unit="%"
        />
        <StatCard
          title="Temperature"
          value={vitals.temperature}
          icon={<TempIcon />}
          color="warning"
          unit="°C"
        />
        <StatCard
          title="Alerts"
          value={emergency.isActive ? 'EMERGENCY' : 'Normal'}
          icon={<AlertIcon />}
          color={emergency.isActive ? 'error' : 'success'}
        />
      </Grid>

      {/* Charts */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
        {/* Heart Rate Chart */}
        <Grid item xs={12} md={4}>
          <Box sx={{ height: { xs: 280, sm: 320 } }}>
            <HeartRateChart data={vitalsHistory} />
          </Box>
        </Grid>
        
        {/* SpO2 Chart */}
        <Grid item xs={12} md={4}>
          <Box sx={{ height: { xs: 280, sm: 320 } }}>
            <SpO2Chart data={vitalsHistory} />
          </Box>
        </Grid>
        
        {/* Temperature Chart */}
        <Grid item xs={12} md={4}>
          <Box sx={{ height: { xs: 280, sm: 320 } }}>
            <TemperatureChart data={vitalsHistory} />
          </Box>
        </Grid>
        
        {/* AI Prediction Component */}
        <Grid item xs={12} md={6}>
          <Box sx={{ height: { xs: 'auto', sm: 500 } }}>
            <AIPrediction vitalsHistory={vitalsHistory} />
          </Box>
        </Grid>
        
        {/* Alerts Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: { xs: 1, sm: 2 }, 
            height: '100%', 
            minHeight: { xs: 'auto', md: 300 }
          }}>
            <Box sx={{ 
              flexGrow: 1, 
              p: { xs: 1, sm: 2, md: 3 }
            }}>
              <Box sx={{ mb: 2 }}>
                <Collapse in={showAlerts && alerts.length > 0}>
                  <Alert 
                    severity="info"
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => setShowAlerts(false)}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                    sx={{ mb: 2 }}
                  >
                    Recent Alerts ({alerts.length})
                  </Alert>
                  <Paper elevation={2} sx={{ 
                    maxHeight: 200, 
                    overflow: 'auto', 
                    mb: { xs: 1, sm: 2, md: 3 },
                    '& .MuiListItem-root': {
                      pl: { xs: 1, sm: 2 },
                      pr: { xs: 4, sm: 6 }
                    }
                  }}>
                    <List dense>
                      {alerts.map((alert, index) => (
                        <React.Fragment key={alert.id}>
                          {index > 0 && <Divider component="li" />}
                          <ListItem 
                            alignItems="flex-start"
                            secondaryAction={
                              <IconButton 
                                edge="end" 
                                aria-label="dismiss"
                                onClick={() => dismissAlert(alert.id)}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            }
                          >
                            <ListItemIcon>
                              <AlertIcon color={getSeverityColor(alert.severity)} />
                            </ListItemIcon>
                            <ListItemText
                              primary={alert.message}
                              secondary={`${alert.time} - ${alert.type}`}
                              primaryTypographyProps={{
                                color: getSeverityColor(alert.severity),
                                fontWeight: 'medium'
                              }}
                            />
                          </ListItem>
                        </React.Fragment>
                      ))}
                      {alerts.length === 0 && (
                        <ListItem>
                          <ListItemText primary="No recent alerts" />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                </Collapse>
                {!showAlerts && alerts.length > 0 && (
                  <Alert 
                    severity="info"
                    action={
                      <IconButton
                        aria-label="show alerts"
                        color="inherit"
                        size="small"
                        onClick={() => setShowAlerts(true)}
                      >
                        <AlertIcon fontSize="inherit" />
                      </IconButton>
                    }
                    sx={{ mb: 2 }}
                  >
                    {alerts.length} unread alert{alerts.length !== 1 ? 's' : ''}
                  </Alert>
                )}
              </Box>
              <Typography variant="h5" component="h2" sx={{ 
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2.125rem' },
                mt: { xs: 2, sm: 0 },
                mb: 2
              }}>
                Emergency Status
              </Typography>
              <Box sx={{ width: '100%' }}>
                {emergency.isActive ? (
                  <Box sx={{ 
                    color: 'error.main', 
                    p: { xs: 1, sm: 2 },
                    border: '1px solid', 
                    borderColor: 'error.main', 
                    borderRadius: 1,
                    '& .MuiTypography-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>🚨 Emergency Alert</Typography>
                    <Typography variant="body2" component="div">
                      Last triggered: {new Date(emergency.lastTriggered).toLocaleString()}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ 
                    color: 'success.main', 
                    p: { xs: 1, sm: 2 },
                    border: '1px solid', 
                    borderColor: 'success.main', 
                    borderRadius: 1,
                    '& .MuiTypography-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 0.5 }}>✅ System Normal</Typography>
                    <Typography variant="body2" component="div">
                      Last checked: {new Date().toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
