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
import VitalSignsChart from '../components/Dashboard/VitalSignsChart';


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

  // Initialize Socket.IO connection
  useEffect(() => {
    // Connect to the WebSocket server
    const socket = io('http://localhost:3000', {
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
      console.log('Received vitals update:', data);
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

  // Process incoming WebSocket data
  const processVitalsData = (data) => {
    console.log('Processing vitals data:', data);
    
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

    // Handle fall alert
    if (data.fallAlert === true) {
      console.log('🚨 FALL DETECTED! 🚨');
      console.log('Accelerometer:', data.accelerometer);
      console.log('Gyroscope:', data.gyroscope);
      
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
            console.log('Google Maps:', `https://www.google.com/maps?q=${nearestHospital.lat},${nearestHospital.lon}`);
            
            // Add critical fall alert
            newAlerts.push({
              id: `alert-${++alertIdCounter.current}`,
              type: 'critical',
              message: `⚠️ FALL DETECTED! Nearest hospital: ${nearestHospital.name} (${nearestHospital.distance.toFixed(2)} km away)`,
              timestamp: new Date().toISOString(),
            });
            
            setAlerts(prevAlerts => [...prevAlerts, ...newAlerts]);
            setShowAlerts(true);
          },
          (error) => {
            console.error('Error getting location:', error);
            // Add fall alert without location
            newAlerts.push({
              id: `alert-${++alertIdCounter.current}`,
              type: 'critical',
              message: '⚠️ FALL DETECTED! Unable to get location.',
              timestamp: new Date().toISOString(),
            });
            
            setAlerts(prevAlerts => [...prevAlerts, ...newAlerts]);
            setShowAlerts(true);
          }
        );
      } else {
        // Geolocation not supported
        newAlerts.push({
          id: `alert-${++alertIdCounter.current}`,
          type: 'critical',
          message: '⚠️ FALL DETECTED! Geolocation not supported.',
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
    // Dummy list of hospitals with coordinates (latitude, longitude) in Bangalore
    const hospitals = [
      { name: 'Apollo Hospital', lat: 12.9716, lon: 77.5946, contact: '+91 80 2630 4050' },
      { name: 'Manipal Hospital', lat: 12.9279, lon: 77.6271, contact: '+91 80 2502 4444' },
      { name: 'Fortis Hospital', lat: 12.9665, lon: 77.7131, contact: '+91 80 6621 4444' },
      { name: 'Narayana Health', lat: 12.8928, lon: 77.6337, contact: '+91 80 6750 6900' },
      { name: 'Columbia Asia Hospital', lat: 12.9569, lon: 77.7011, contact: '+91 80 6165 6661' }
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
        // Keep only the last 50 data points for chart display
        return [...prevHistory.slice(-49), newDataPoint];
      });
    }
  }, [vitals]);

  // Chart component now handles the chart data and options

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
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
      <Grid container spacing={3} sx={{ mb: 3 }}>
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
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <VitalSignsChart data={vitalsHistory} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%', minHeight: 400 }}>
            <Box sx={{ flexGrow: 1, p: 3 }}>
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
                  <Paper elevation={2} sx={{ maxHeight: 200, overflow: 'auto', mb: 3 }}>
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
              <Typography variant="h4" gutterBottom>
                Emergency Status
              </Typography>
              <Box>
                {emergency.isActive ? (
                  <Box sx={{ color: 'error.main', p: 1, border: '1px solid', borderColor: 'error.main', borderRadius: 1 }}>
                    <Typography variant="h6">🚨 Emergency Alert Triggered</Typography>
                    <Typography variant="caption" display="block">
                      Last triggered: {new Date(emergency.lastTriggered).toLocaleString()}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ color: 'success.main', p: 1, border: '1px solid', borderColor: 'success.main', borderRadius: 1 }}>
                    <Typography>✅ System Normal</Typography>
                    <Typography variant="caption" display="block">
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
