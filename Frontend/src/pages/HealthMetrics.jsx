import { Box, Typography, Container } from '@mui/material';

const HealthMetrics = () => {
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Health Metrics
        </Typography>
        <Typography paragraph>
          View and manage your health metrics here.
        </Typography>
      </Container>
    </Box>
  );
};

export default HealthMetrics;
