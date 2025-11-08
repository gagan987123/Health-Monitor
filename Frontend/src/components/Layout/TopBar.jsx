import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Badge, Box, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  MedicalServices as EmergencyIcon,
  AccountCircle,
} from '@mui/icons-material';
import useStore from '../../store/useStore';

const TopBar = ({ drawerWidth, onMenuClick }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, emergency, logout } = useStore();
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Smart Alerts Monitoring
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {emergency.isActive && (
            <IconButton color="error" size="large" aria-label="emergency active">
              <EmergencyIcon />
            </IconButton>
          )}
          
          <IconButton color="inherit" size="large" aria-label="show notifications">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
            size="large"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.name?.[0] || <AccountCircle />}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
      
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </AppBar>
  );
};

export default TopBar;
