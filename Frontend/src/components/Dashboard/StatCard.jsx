import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import PropTypes from 'prop-types';

const StatCard = ({ title, value, icon, color, unit = '' }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card sx={{ height: '100%', bgcolor: color + '.light' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value} {unit}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: color + '.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            {React.cloneElement(icon, { fontSize: 'large' })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.element.isRequired,
  color: PropTypes.string,
  unit: PropTypes.string,
};

StatCard.defaultProps = {
  color: 'primary',
  unit: '',
};

export default StatCard;
