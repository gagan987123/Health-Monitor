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
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const VitalSignsChart = ({ data = [] }) => {
  // Process data to handle missing or malformed entries
  const processedData = Array.isArray(data) ? data : [];
  const chartData = {
    labels: processedData.slice(-12).map((item, i) => {
      try {
        const d = item?.timestamp ? new Date(item.timestamp) : new Date();
        d.setMinutes(d.getMinutes() - (11 - i) * 5); // Distribute points over time
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        const d = new Date();
        d.setMinutes(d.getMinutes() - (11 - i) * 5);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }),
    datasets: [
      {
        label: 'Heart Rate (bpm)',
        data: processedData.slice(-12).map(d => d?.heartRate || d?.heart_rate || 0),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.3,
        fill: false,
        yAxisID: 'y',
      },
      {
        label: 'SpO2 (%)',
        data: processedData.slice(-12).map(d => d?.spo2 || 0),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.3,
        fill: false,
        yAxisID: 'y',
      },
      {
        label: 'Temperature (°C)',
        data: processedData.slice(-12).map(d => d?.temperature || 0),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.3,
        fill: false,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        titleFont: { size: 14 },
        bodyFont: { size: 14 },
        cornerRadius: 4,
        displayColors: true,
        mode: 'index',
        intersect: false,
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
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Heart Rate (bpm) / SpO2 (%)',
          font: { weight: 'bold' },
        },
        min: 50,
        max: 120,
        grid: {
          drawBorder: false,
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Temperature (°C)',
          font: { weight: 'bold' },
        },
        min: 35,
        max: 42,
        grid: {
          drawOnChartArea: false,
          drawBorder: false,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <Box sx={{ 
      position: 'relative',
      width: '100%',
      height: { xs: 300, sm: 400, md: 450 },
      p: { xs: 1, sm: 2 },
      '& .chart-container': {
        position: 'relative',
        height: '100%',
        width: '100%',
        minHeight: '300px',
      }
    }}>
      <Paper 
        elevation={1} 
        sx={{ 
          p: { xs: 1, sm: 2 },
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 'medium' }}>
          Vital Signs
        </Typography>
        <Box className="chart-container">
          <Line 
            data={chartData} 
            options={chartOptions} 
            style={{ width: '100%', height: '100%' }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

VitalSignsChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      heartRate: PropTypes.number,
      heart_rate: PropTypes.number,
      spo2: PropTypes.number,
      temperature: PropTypes.number,
      timestamp: PropTypes.string,
    })
  ),
};

VitalSignsChart.defaultProps = {
  data: [],
};

export default VitalSignsChart;
