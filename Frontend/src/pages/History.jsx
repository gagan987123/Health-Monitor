import { Box, Typography, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';

const historyData = [
  { id: 1, date: '2023-10-29', event: 'Health Checkup', details: 'Regular checkup with Dr. Smith' },
  { id: 2, date: '2023-10-25', event: 'Medication', details: 'Prescribed Ibuprofen 200mg' },
  { id: 3, date: '2023-10-20', event: 'Lab Test', details: 'Blood work completed' },
  { id: 4, date: '2023-10-15', event: 'Vaccination', details: 'Flu shot administered' },
  { id: 5, date: '2023-10-10', event: 'Consultation', details: 'Follow-up for previous condition' },
];

const History = () => {
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Container maxWidth="lg">
        <Box display="flex" alignItems="center" mb={3}>
          <HistoryIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h4">Medical History</Typography>
        </Box>
        
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activities
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyData.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.event}</TableCell>
                    <TableCell>{item.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
          <Typography variant="body2" color="text.secondary">
            Showing 5 most recent records
          </Typography>
          <Typography 
            variant="body2" 
            color="primary"
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            View Complete History
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default History;
