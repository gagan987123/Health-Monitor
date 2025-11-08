import { Box, Typography, Container, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const alerts = [
  { id: 1, message: 'High heart rate detected', severity: 'high', time: '10:30 AM' },
  { id: 2, message: 'Low SpO2 level detected', severity: 'medium', time: 'Yesterday' },
  { id: 3, message: 'Irregular heart rhythm detected', severity: 'high', time: '2 days ago' },
  { id: 4, message: 'Scheduled health check reminder', severity: 'low', time: '1 week ago' },
];

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    default:
      return 'info';
  }
};

const Alerts = () => {
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Container maxWidth="lg">
        <Box display="flex" alignItems="center" mb={3}>
          <NotificationsIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h4">Alerts</Typography>
        </Box>
        
        <List sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
          {alerts.map((alert, index) => (
            <Box key={alert.id}>
              {index > 0 && <Divider />}
              <ListItem 
                alignItems="flex-start"
                sx={{ py: 2, '&:hover': { bgcolor: 'action.hover' } }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip 
                      label={alert.severity.toUpperCase()} 
                      color={getSeverityColor(alert.severity)}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {alert.time}
                    </Typography>
                  </Box>
                  <ListItemText 
                    primary={alert.message}
                    primaryTypographyProps={{ variant: 'body1' }}
                  />
                </Box>
              </ListItem>
            </Box>
          ))}
        </List>
      </Container>
    </Box>
  );
};

export default Alerts;
