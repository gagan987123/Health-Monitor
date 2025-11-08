import { Box, Typography, Container, Button } from '@mui/material';
import EmergencyIcon from '@mui/icons-material/LocalHospital';

const Emergency = () => {
  const handleEmergencyClick = () => {
    // TODO: Implement emergency contact logic
    alert('Emergency services have been notified!');
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3, textAlign: 'center' }}>
      <Container maxWidth="md">
        <EmergencyIcon color="error" sx={{ fontSize: 80, mb: 3 }} />
        <Typography variant="h4" gutterBottom>
          Emergency Assistance
        </Typography>
        <Typography paragraph sx={{ mb: 4 }}>
          In case of emergency, click the button below to alert emergency services and your emergency contacts.
        </Typography>
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={handleEmergencyClick}
          sx={{ py: 2, px: 4, fontSize: '1.2rem' }}
        >
          EMERGENCY HELP
        </Button>
      </Container>
    </Box>
  );
};

export default Emergency;
