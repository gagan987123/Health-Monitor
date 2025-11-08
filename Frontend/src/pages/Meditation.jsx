import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton,
  Paper,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { Delete as DeleteIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { format } from 'date-fns';

const Meditation = () => {
  const [meditationName, setMeditationName] = useState('');
  const [meditationTime, setMeditationTime] = useState('');
  const [sessions, setSessions] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '' });
  const [timeUntilNext, setTimeUntilNext] = useState('');

  // Load saved sessions from localStorage
  useEffect(() => {
    const savedSessions = JSON.parse(localStorage.getItem('meditationSessions') || '[]');
    setSessions(savedSessions);
  }, []);

  // Check for upcoming sessions
  useEffect(() => {
    const timer = setInterval(() => {
      checkUpcomingSessions();
      updateTimeUntilNext();
    }, 60000); // Check every minute

    return () => clearInterval(timer);
  }, [sessions]);

  const updateTimeUntilNext = () => {
    const now = new Date();
    const upcomingSessions = sessions
      .filter(session => new Date(session.time) > now)
      .sort((a, b) => new Date(a.time) - new Date(b.time));

    if (upcomingSessions.length > 0) {
      const nextSession = upcomingSessions[0];
      const diff = Math.floor((new Date(nextSession.time) - now) / 60000); // in minutes
      if (diff <= 0) {
        setTimeUntilNext('Now!');
      } else if (diff < 60) {
        setTimeUntilNext(`in ${diff} minute${diff > 1 ? 's' : ''}`);
      } else {
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        setTimeUntilNext(`in ${hours}h ${mins}m`);
      }
    } else {
      setTimeUntilNext('No upcoming sessions');
    }
  };

  const checkUpcomingSessions = () => {
    const now = new Date();
    sessions.forEach(session => {
      const sessionTime = new Date(session.time);
      // Check if it's time for this session (within 1 minute)
      if (Math.abs(sessionTime - now) < 60000 && !session.notified) {
        showNotification(`Time for "${session.name}" meditation! Your session is starting now.`, session);
        // Mark as notified
        const updatedSessions = sessions.map(s => 
          s.id === session.id ? { ...s, notified: true } : s
        );
        setSessions(updatedSessions);
        localStorage.setItem('meditationSessions', JSON.stringify(updatedSessions));
      }
    });
  };

  const showNotification = (message, session = null) => {
    // Show in-app notification
    setNotification({ open: true, message });
    
    // Request notification permission if not already granted
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted' && session) {
          scheduleNotification(session);
        }
      });
    } else if (Notification.permission === 'granted' && session) {
      scheduleNotification(session);
    }
  };

  const scheduleNotification = (session) => {
    const now = new Date();
    const sessionTime = new Date(session.time);
    const timeUntilSession = sessionTime - now;
    
    if (timeUntilSession > 0) {
      setTimeout(() => {
        new Notification(`Time for ${session.name}`, {
          body: `Your "${session.name}" meditation session is starting now!`,
          icon: '/favicon.ico',
          requireInteraction: true
        });
      }, timeUntilSession);
    }
  };

  const handleAddSession = (e) => {
    e.preventDefault();
    if (!meditationName || !meditationTime) {
      showNotification('Please enter both meditation name and time');
      return;
    }

    const newSession = {
      id: Date.now(),
      name: meditationName.trim(),
      time: meditationTime,
      notified: false
    };

    const updatedSessions = [...sessions, newSession]
      .sort((a, b) => new Date(a.time) - new Date(b.time));
    
    setSessions(updatedSessions);
    localStorage.setItem('meditationSessions', JSON.stringify(updatedSessions));
    setMeditationName('');
    setMeditationTime('');
    showNotification('Meditation session added!');
  };

  const handleDeleteSession = (id) => {
    const updatedSessions = sessions.filter(session => session.id !== id);
    setSessions(updatedSessions);
    localStorage.setItem('meditationSessions', JSON.stringify(updatedSessions));
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Meditation Schedule
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Schedule a Meditation Session
        </Typography>
        <Box component="form" onSubmit={handleAddSession}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Meditation Name"
              value={meditationName}
              onChange={(e) => setMeditationName(e.target.value)}
              placeholder="e.g., Morning Calm, Work Break, Sleep Aid"
              required
              sx={{ flex: 2 }}
            />
            <TextField
              fullWidth
              type="datetime-local"
              value={meditationTime}
              onChange={(e) => setMeditationTime(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              required
              label="Select date and time"
              sx={{ flex: 1 }}
            />
          </Box>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            size="large"
            fullWidth
            sx={{ mt: 1 }}
          >
            Schedule Meditation
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          {timeUntilNext && (
            <>
              <NotificationsIcon color="primary" sx={{ verticalAlign: 'middle', mr: 1 }} />
              Next session: {timeUntilNext}
            </>
          )}
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upcoming Sessions
        </Typography>
        {sessions.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No meditation sessions scheduled. Add one above!
          </Typography>
        ) : (
          <List>
            {sessions.map((session) => (
              <React.Fragment key={session.id}>
                <ListItem>
                  <ListItemText
                    primary={session.name}
                    secondary={
                      <>
                        <Typography component="span" display="block">
                          {format(new Date(session.time), 'PPpp')}
                        </Typography>
                        <Typography component="span" variant="caption" color={session.notified ? 'success.main' : 'text.secondary'}>
                          {session.notified ? '✓ Notified' : 'Scheduled'}
                        </Typography>
                      </>
                    }
                    sx={{ '& .MuiListItemText-secondary': { display: 'flex', flexDirection: 'column' } }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity="info" sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Meditation;
