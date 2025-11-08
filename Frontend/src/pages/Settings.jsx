import { Box, Typography, Container, Paper, List, ListItem, ListItemText, Switch, Divider, FormControlLabel, Button, TextField, Grid } from '@mui/material';
import { Settings as SettingsIcon, Notifications as NotificationsIcon, Lock as LockIcon, Language as LanguageIcon, Palette as PaletteIcon } from '@mui/icons-material';

const Settings = () => {
  const settings = {
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      smsAlerts: false,
      medicationReminders: true,
    },
    theme: 'light',
    language: 'en',
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Container maxWidth="lg">
        <Box display="flex" alignItems="center" mb={4}>
          <SettingsIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h4">Settings</Typography>
        </Box>
        
        <Grid container spacing={3}>
          {/* Notification Settings */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box display="flex" alignItems="center" mb={3}>
                <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Notifications</Typography>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Email Alerts" 
                    secondary="Receive important updates via email" 
                  />
                  <Switch 
                    checked={settings.notifications.emailAlerts} 
                    color="primary"
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="Push Notifications" 
                    secondary="Get notifications on this device" 
                  />
                  <Switch 
                    checked={settings.notifications.pushNotifications} 
                    color="primary"
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="SMS Alerts" 
                    secondary="Receive text message alerts" 
                  />
                  <Switch 
                    checked={settings.notifications.smsAlerts} 
                    color="primary"
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="Medication Reminders" 
                    secondary="Get reminders for your medications" 
                  />
                  <Switch 
                    checked={settings.notifications.medicationReminders} 
                    color="primary"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          {/* Account Settings */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <LockIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Account Security</Typography>
              </Box>
              
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mb: 2 }}
              >
                Change Password
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                fullWidth
              >
                Logout All Devices
              </Button>
              
              <Divider sx={{ my: 3 }} />
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Two-Factor Authentication
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Add an extra layer of security to your account
                </Typography>
                <Button variant="contained">
                  Enable 2FA
                </Button>
              </Box>
            </Paper>
            
            {/* App Settings */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <PaletteIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Appearance</Typography>
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.theme === 'dark'}
                    onChange={() => {}}
                    color="primary"
                  />
                }
                label="Dark Mode"
                sx={{ mb: 2 }}
              />
              
              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Language
                </Typography>
                <TextField
                  select
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={settings.language}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </TextField>
              </Box>
              
              <Box mt={3} display="flex" justifyContent="flex-end">
                <Button variant="contained" color="primary">
                  Save Changes
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Settings;
