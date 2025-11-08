import { Box, Typography, Container, Card, CardContent, Grid, Button, TextField, InputAdornment, Chip } from '@mui/material';
import { Search as SearchIcon, LocalHospital as HospitalIcon, Phone, LocationOn } from '@mui/icons-material';

const hospitals = [
  {
    id: 1,
    name: 'City General Hospital',
    address: '123 Healthcare Ave, Medical District',
    phone: '(555) 123-4567',
    distance: '0.8 miles',
    emergency: true,
  },
  {
    id: 2,
    name: 'Metro Medical Center',
    address: '456 Wellness Blvd, Downtown',
    phone: '(555) 234-5678',
    distance: '1.5 miles',
    emergency: true,
  },
  {
    id: 3,
    name: 'Community Health Clinic',
    address: '789 Recovery Lane, Suburbia',
    phone: '(555) 345-6789',
    distance: '2.3 miles',
    emergency: false,
  },
];

const Hospitals = () => {
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center">
            <HospitalIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h4">Nearby Hospitals</Typography>
          </Box>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search hospitals..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Grid container spacing={3}>
          {hospitals.map((hospital) => (
            <Grid item xs={12} md={6} key={hospital.id}>
              <Card 
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h2">
                      {hospital.name}
                    </Typography>
                    {hospital.emergency && (
                      <Chip 
                        label="24/7 ER" 
                        color="error" 
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationOn color="action" fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {hospital.address}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <Phone color="action" fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {hospital.phone}
                    </Typography>
                    <Box ml="auto">
                      <Chip 
                        label={`${hospital.distance} away`} 
                        variant="outlined" 
                        size="small"
                      />
                    </Box>
                  </Box>
                  
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      Directions
                    </Button>
                    <Button 
                      variant="contained" 
                      size="small"
                      startIcon={<Phone fontSize="small" />}
                    >
                      Call
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Hospitals;
