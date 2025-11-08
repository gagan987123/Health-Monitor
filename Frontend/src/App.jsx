import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import theme from './theme';

import useStore from './store/useStore';
import DashboardLayout from './components/Layout/DashboardLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HealthMetrics from './pages/HealthMetrics';
import Emergency from './pages/Emergency';
import Alerts from './pages/Alerts';
import Hospitals from './pages/Hospitals';
import Meditation from './pages/Meditation';
import History from './pages/History';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          autoHideDuration={3000}
        >
          <CssBaseline />
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                
                <Route path="metrics" element={<HealthMetrics />}>
                  <Route index element={<Navigate to="heart-rate" replace />} />
                  <Route path="heart-rate" element={<div>Heart Rate Metrics</div>} />
                  <Route path="spo2" element={<div>SpO2 Metrics</div>} />
                  <Route path="temperature" element={<div>Temperature Metrics</div>} />
                </Route>
                
                <Route path="emergency" element={<Emergency />} />
                <Route path="alerts" element={<Alerts />} />
                <Route path="hospitals" element={<Hospitals />} />
                <Route path="meditation" element={<Meditation />} />
                <Route path="history" element={<History />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              {/* 404 - Not Found */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;
