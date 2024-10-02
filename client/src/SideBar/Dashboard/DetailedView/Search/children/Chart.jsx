import React, { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Box, TextField, Typography, Button, Switch, FormControlLabel, Snackbar } from '@mui/material';

// Register the necessary components for the chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// Constants for maximum number of data points to display
const MAX_DATA_POINTS = 25;  // For 24-hour view
const MAX_DATA_POINTS_48 = 49;  // For 48-hour view

// Initial empty data structure
const emptyData = {
  readings: []
};

export const BGAndCarbsChart = ({ data = emptyData, onDataChange }) => {
  // State for toggling between 24 and 48 hour view
  const [toggle48, setToggle48] = useState(false);
  
  // New state for Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // State for storing all chart data
  const [chartData, setChartData] = useState(data);
  
  // State for storing new reading input
  const [newReading, setNewReading] = useState({
    datetime: '',
    carbs: '',
    bg: '',
    meal: ''
  });

// Effect to update chart data when external data changes
useEffect(() => {
  setChartData(prevData => ({
    ...prevData,
    readings: Array.isArray(data.readings) ? data.readings : []
  }));
}, [data]);

// Process and sort the chart data
const processedChartData = useMemo(() => {
  // Determine max points based on toggle state
  const maxPoints = toggle48 ? MAX_DATA_POINTS_48 : MAX_DATA_POINTS;
  
  // Sort readings by time and slice to get only the most recent
  const sortedReadings = (chartData.readings || [])
    .slice()
    .sort((a, b) => a.unixTime - b.unixTime)
    .slice(-maxPoints);

  // Extract and format data for the chart
  return {
    times: sortedReadings.map(r => new Date(r.unixTime).toLocaleString()),
    carbs: sortedReadings.map(r => r.carbs),
    bg: sortedReadings.map(r => r.bg),
    meals: sortedReadings.map(r => r.meal),
    userInput: sortedReadings.map(() => true)
  };
}, [chartData, toggle48]);

// Prepare data for the line chart
const lineChartData = useMemo(() => ({
  labels: processedChartData.times,
  datasets: [
    {
      label: 'Carbs',
      data: processedChartData.carbs,
      borderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      fill: true,  // Enable area fill under the line
      tension: 0.4,  // Make the line slightly curved
      pointRadius: 6,
      pointBackgroundColor: 'rgba(75, 192, 192, 1)',
    },
    {
      label: 'BG Level',
      data: processedChartData.bg,
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      fill: true,  // Enable area fill under the line
      tension: 0.4,  // Make the line slightly curved
      pointRadius: 6,
      pointBackgroundColor: 'rgba(255, 99, 132, 1)',
    }
  ],
}), [processedChartData]);

// Chart options
const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        // Add meal information to tooltip
        afterBody: function(context) {
          const dataIndex = context[0].dataIndex;
          const meal = processedChartData.meals[dataIndex];
          return meal ? `Meal: ${meal}` : '';
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      suggestedMax: 180
    }
  }
};

// Handle input changes for new readings
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setNewReading(prev => ({ ...prev, [name]: value }));
};

// Validate input fields
const validateInput = () => {
  if (!newReading.datetime || !newReading.carbs || !newReading.bg || !newReading.meal) {
    setSnackbarMessage('All fields must be filled out');
    setSnackbarOpen(true);
    return false;
  }
  return true;
};

// Add a new reading to the chart
const addReading = (e) => {
  e.preventDefault();
  
  if (!validateInput()) {
    return;
  }

  const inputDate = new Date(newReading.datetime);
  const currentTime = new Date();
  
  // Prevent future dates
  if (inputDate > currentTime) {
    setSnackbarMessage("Future dates are not allowed.");
    setSnackbarOpen(true);
    return;
  }
  
  // Create new reading object
  const newReadingData = {
    unixTime: inputDate.getTime(),
    carbs: parseInt(newReading.carbs, 10),
    bg: parseInt(newReading.bg, 10),
    meal: newReading.meal,
    time: inputDate.toLocaleString()
  };

  // Add new reading to existing data, sort, and limit to max points
  const newData = {
    readings: [...(chartData.readings || []), newReadingData]
      .sort((a, b) => a.unixTime - b.unixTime)
      .slice(-(toggle48 ? MAX_DATA_POINTS_48 : MAX_DATA_POINTS))
  };

  // Update chart data
  setChartData(newData);
  onDataChange(newData);

  // Reset input fields
  setNewReading({ datetime: '', carbs: '', bg: '', meal: '' });
};

// Handle Snackbar close
const handleSnackbarClose = (event, reason) => {
  if (reason === 'clickaway') {
    return;
  }
  setSnackbarOpen(false);
};

// Toggle between 24 and 48 hour view
const handleToggle48 = () => {
  setToggle48(prev => !prev);
};

  return (
    <Box>
      {/* Header with toggle switch */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{toggle48 ? '48 Hour View' : '24 Hour View'}</Typography>
        <FormControlLabel
          control={<Switch checked={toggle48} onChange={handleToggle48} />}
          label="48 Hour View"
        />
      </Box>

      {/* Line chart */}
      <Line data={lineChartData} options={options} />

      {/* Form for adding new readings */}
      <Box component="form" onSubmit={addReading} sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          name="datetime"
          label="Date and Time"
          type="datetime-local"
          value={newReading.datetime}
          onChange={handleInputChange}
          sx={{ width: '200px' }}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          name="carbs"
          label="Carbs"
          type="number"
          value={newReading.carbs}
          onChange={handleInputChange}
          sx={{ width: '80px' }}
          required
        />
        <TextField
          name="bg"
          label="BG"
          type="number"
          value={newReading.bg}
          onChange={handleInputChange}
          sx={{ width: '80px' }}
          required
        />
        <TextField
          name="meal"
          label="Meal"
          value={newReading.meal}
          onChange={handleInputChange}
          sx={{ width: '120px' }}
          required
        />
        <Button type="submit" variant="contained">Add Reading</Button>
      </Box>
            {/* Snackbar for error messages */}
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};