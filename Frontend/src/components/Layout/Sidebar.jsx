import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
  Collapse,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Favorite as HeartIcon,
  LocalHospital as HospitalIcon,
  Settings as SettingsIcon,
  Notifications as AlertsIcon,
  SelfImprovement as MeditationIcon,
  ExpandLess,
  ExpandMore,
  Person as ProfileIcon,
  History as HistoryIcon,
  MedicalServices as EmergencyIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  {
    text: 'Health Metrics',
    icon: <HeartIcon />,
    path: '/metrics',
    subItems: [
      { text: 'Heart Rate', path: '/metrics/heart-rate' },
      { text: 'SpO2', path: '/metrics/spo2' },
      { text: 'Temperature', path: '/metrics/temperature' },
    ],
  },
  { text: 'Emergency', icon: <EmergencyIcon />, path: '/emergency' },
  { text: 'Alerts', icon: <AlertsIcon />, path: '/alerts' },
  { text: 'Hospitals', icon: <HospitalIcon />, path: '/hospitals' },
  { text: 'Meditation', icon: <MeditationIcon />, path: '/meditation' },
  { text: 'History', icon: <HistoryIcon />, path: '/history' },
  { text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar = ({ drawerWidth, mobileOpen, onDrawerToggle }) => {
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState({});

  const handleSubmenuClick = (text) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [text]: !prev[text],
    }));
  };

  const drawer = (
    <div>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <EmergencyIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" noWrap component="div">
            Smart Alerts
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={location.pathname === item.path}
                onClick={() =>
                  item.subItems && handleSubmenuClick(item.text)
                }
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {React.cloneElement(item.icon, {
                    color: location.pathname === item.path ? 'primary' : 'inherit',
                  })}
                </ListItemIcon>
                <ListItemText primary={item.text} />
                {item.subItems && (
                  <>{openSubmenus[item.text] ? <ExpandLess /> : <ExpandMore />}</>
                )}
              </ListItemButton>
            </ListItem>
            {item.subItems && (
              <Collapse in={openSubmenus[item.text]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <ListItemButton
                      key={subItem.text}
                      component={RouterLink}
                      to={`${item.path}${subItem.path}`}
                      selected={location.pathname === `${item.path}${subItem.path}`}
                      sx={{ pl: 9 }}
                    >
                      <ListItemText primary={subItem.text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </div>
  );

  const container = window !== undefined ? () => window.document.body : undefined;

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile Drawer */}
      <Drawer
        container={container}
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 'none',
            boxShadow: 3,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
