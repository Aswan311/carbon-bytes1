import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Grid, Box, 
  CircularProgress, Card, CardContent, Divider 
} from '@mui/material';
import { collection, query, where, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Bar } from 'react-chartjs-2';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Get user data
    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribeUser = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setUserData(doc.data());
      }
    });

    // Get recent transactions
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    
    const unsubscribeTransactions = onSnapshot(q, (snapshot) => {
      const transactionData = [];
      snapshot.forEach((doc) => {
        transactionData.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(transactionData);
      setLoading(false);
    });

    return () => {
      unsubscribeUser();
      unsubscribeTransactions();
    };
  }, [currentUser]);

  // Prepare chart data
  const wasteData = transactions.reduce((acc, transaction) => {
    const wasteType = transaction.wasteType;
    if (!acc[wasteType]) {
      acc[wasteType] = 0;
    }
    acc[wasteType]++;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(wasteData),
    datasets: [
      {
        label: 'Waste Type Distribution',
        data: Object.values(wasteData),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      
      <Grid container spacing={3}>
        {/* User Info Card */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={{ padding: '1.5rem' }}>
            <Box display="flex" alignItems="center" flexDirection="column">
              <img 
                src={currentUser.photoURL || 'https://via.placeholder.com/100'} 
                alt="Profile" 
                style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '1rem' }}
              />
              <Typography variant="h5">{userData?.displayName || currentUser.displayName}</Typography>
              <Typography variant="body2" color="textSecondary">{currentUser.email}</Typography>
              <Box marginTop="1rem" width="100%">
                <Divider />
              </Box>
              <Typography variant="h4" style={{ marginTop: '1rem', color: '#4caf50' }}>
                {userData?.points || 0} points
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Withdrawal feature coming soon!
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Waste Distribution Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} style={{ padding: '1.5rem' }}>
            <Typography variant="h6" gutterBottom>Your Waste Distribution</Typography>
            <Box height="250px">
              <Bar data={chartData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: '1.5rem' }}>
            <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
            {transactions.length === 0 ? (
              <Typography variant="body1">No recent transactions found.</Typography>
            ) : (
              <Grid container spacing={2}>
                {transactions.map((transaction) => (
                  <Grid item xs={12} md={6} key={transaction.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={8}>
                            <Typography variant="h6" style={{ textTransform: 'capitalize' }}>
                              {transaction.wasteType}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {transaction.timestamp?.toDate().toLocaleString() || 'Unknown date'}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="h6" align="right" style={{ color: '#4caf50' }}>
                              +{transaction.points} pts
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;