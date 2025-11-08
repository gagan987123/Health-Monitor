import React from 'react';
import { Box, Paper } from '@mui/material';
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

const VitalSignsChart = ({ data }) => {
  const chartData = {
    labels: data.slice(-12).map((_, i) => {
      const d = new Date();
      d.setMinutes(d.getMinutes() - (12 - i) * 5);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }),
    datasets: [
      {
        label: 'Heart Rate (bpm)',
        data: data.slice(-12).map(d => d.heart_rate),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'SpO2 (%)',
        data: data.slice(-12).map(d => d.spo2),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Temperature (°F)',
        data: data.slice(-12).map(d => d.temperature),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Vital Signs - Last Hour',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Heart Rate (bpm) / SpO2 (%)',
        },
        min: 60,
        max: 100,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Temperature (°F)',
        },
        min: 95,
        max: 105,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <Paper sx={{ p: 2, height: '100%', minHeight: 400 }}>
      <Line data={chartData} options={chartOptions} />
    </Paper>
  );
};

VitalSignsChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      heart_rate: PropTypes.number.isRequired,
      spo2: PropTypes.number.isRequired,
      temperature: PropTypes.number.isRequired,
      timestamp: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default VitalSignsChart;
