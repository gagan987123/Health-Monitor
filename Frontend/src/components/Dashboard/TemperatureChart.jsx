import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TemperatureChart = ({ data = [] }) => {
  const processedData = Array.isArray(data) ? data : [];
  
  // Keep only last 6 records
  const recentData = processedData.slice(-6);
  
  const chartData = {
    labels: recentData.map((item, i) => {
      try {
        const d = item?.timestamp ? new Date(item.timestamp) : new Date();
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        const d = new Date();
        d.setMinutes(d.getMinutes() - (5 - i) * 5);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }),
    datasets: [
      {
        label: 'Temperature',
        data: recentData.map(d => d?.temperature || 0),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 159, 64, 0.9)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.parsed.y}°C`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
          font: { size: 11 },
        },
      },
      y: {
        type: 'linear',
        display: true,
        title: {
          display: true,
          text: '°C',
          font: { weight: 'bold', size: 12 },
        },
        min: 25,
        max: 42,
        ticks: {
          stepSize: 0.5,
          font: { size: 11 },
        },
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: { xs: 1.5, sm: 2 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderTop: '3px solid rgb(255, 159, 64)',
      }}
    >
      <Typography 
        variant="h6" 
        component="h3" 
        sx={{ 
          mb: 1.5, 
          fontWeight: 'bold',
          color: 'rgb(255, 159, 64)',
          fontSize: { xs: '1rem', sm: '1.25rem' }
        }}
      >
        Temperature
      </Typography>
      <Box sx={{ 
        flexGrow: 1,
        position: 'relative',
        minHeight: { xs: '200px', sm: '250px' },
      }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Paper>
  );
};

TemperatureChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      temperature: PropTypes.number,
      timestamp: PropTypes.string,
    })
  ),
};

TemperatureChart.defaultProps = {
  data: [],
};

export default TemperatureChart;
