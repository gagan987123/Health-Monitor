import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { Psychology as AIIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const AIPrediction = ({ vitalsHistory = [] }) => {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const handleAIPrediction = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // Prepare vitals data for the AI
      const vitalsData = vitalsHistory.length > 0 
        ? vitalsHistory 
        : [{ heartRate: 0, spo2: 0, temperature: 0, timestamp: new Date().toISOString() }];

      const response = await fetch('https://health-monitor-uyt6.onrender.com/api/ai-predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vitalsHistory: vitalsData }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI prediction');
      }

      const data = await response.json();
      setPrediction(data.prediction);
    } catch (err) {
      console.error('Error getting AI prediction:', err);
      setError(err.message || 'Failed to get AI prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrediction = (text) => {
    if (!text) return null;

    // Split by lines and format
    const lines = text.split('\n').filter(line => line.trim());
    
    return lines.map((line, index) => {
      // Check if line is a header (contains ":" or starts with number)
      const isHeader = line.includes(':') && !line.startsWith('  ');
      const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•');
      
      return (
        <Typography
          key={index}
          variant={isHeader ? 'subtitle1' : 'body2'}
          sx={{
            mb: 1,
            fontWeight: isHeader ? 'bold' : 'normal',
            color: isHeader ? 'primary.main' : 'text.primary',
            pl: isBullet ? 2 : 0,
          }}
        >
          {line}
        </Typography>
      );
    });
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: { xs: 2, sm: 3 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderTop: '3px solid #9c27b0',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AIIcon sx={{ fontSize: 32, color: '#9c27b0', mr: 1 }} />
        <Typography 
          variant="h6" 
          component="h3" 
          sx={{ 
            fontWeight: 'bold',
            color: '#9c27b0',
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}
        >
          AI Health Prediction
        </Typography>
      </Box>

      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ mb: 2 }}
      >
        Get AI-powered insights about your future health based on your vital signs history.
      </Typography>

      <Button
        variant="contained"
        onClick={handleAIPrediction}
        disabled={loading}
        sx={{
          bgcolor: '#9c27b0',
          '&:hover': { bgcolor: '#7b1fa2' },
          mb: 2,
          textTransform: 'none',
          fontWeight: 'bold',
        }}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AIIcon />}
      >
        {loading ? 'Analyzing...' : 'AI Predict'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {prediction && (
        <Box 
          sx={{ 
            flexGrow: 1,
            bgcolor: 'grey.50',
            p: 2,
            borderRadius: 1,
            maxHeight: '400px',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#9c27b0',
              borderRadius: '4px',
            },
          }}
        >
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 1, 
              fontWeight: 'bold',
              color: '#9c27b0',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <AIIcon sx={{ fontSize: 18, mr: 0.5 }} />
            AI Analysis Results:
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {formatPrediction(prediction)}
        </Box>
      )}

      {!prediction && !loading && !error && (
        <Box 
          sx={{ 
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            textAlign: 'center',
            p: 3,
          }}
        >
          <Typography variant="body2">
            Click the button above to get AI-powered health predictions
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

AIPrediction.propTypes = {
  vitalsHistory: PropTypes.arrayOf(
    PropTypes.shape({
      heartRate: PropTypes.number,
      heart_rate: PropTypes.number,
      spo2: PropTypes.number,
      temperature: PropTypes.number,
      timestamp: PropTypes.string,
    })
  ),
};

AIPrediction.defaultProps = {
  vitalsHistory: [],
};

export default AIPrediction;
