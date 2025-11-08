import { Box, Typography, Container, Paper, Avatar, Grid, TextField, Button, Divider } from '@mui/material';
import { Person as PersonIcon, Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';

const Profile = () => {
  const userData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dob: '1990-05-15',
    bloodType: 'O+',
    address: '123 Health St, Wellness City, 10001',
    emergencyContact: 'Jane Doe (Spouse) - +1 (555) 987-6543',
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Container maxWidth="md">
        <Box display="flex" alignItems="center" mb={4}>
          <PersonIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h4">My Profile</Typography>
        </Box>
        
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '2.5rem'
              }}
            >
              JD
            </Avatar>
            <Typography variant="h6">{userData.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Member since October 2023
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={userData.name}
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                fullWidth
                label="Email"
                value={userData.email}
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                fullWidth
                label="Phone"
                value={userData.phone}
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                value={userData.dob}
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                fullWidth
                label="Blood Type"
                value={userData.bloodType}
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                fullWidth
                label="Emergency Contact"
                value={userData.emergencyContact}
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>
          
          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />}
              sx={{ mr: 2 }}
            >
              Edit Profile
            </Button>
            <Button 
              variant="contained" 
              startIcon={<SaveIcon />}
              disabled
            >
              Save Changes
            </Button>
          </Box>
        </Paper>
        
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Medical Information
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            No known allergies or chronic conditions reported.
          </Typography>
          <Button variant="text" color="primary">
            + Add Medical Information
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile;
