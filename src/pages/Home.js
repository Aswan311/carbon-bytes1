import React from 'react';
import { 
  Container, Typography, Paper, Grid, Box, Button,
  Card, CardContent, CardMedia
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <Box
        style={{
          backgroundColor: '#2e7d32',
          color: 'white',
          padding: '4rem 0',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" gutterBottom>
            Carbon Bytes
          </Typography>
          <Typography variant="h5" paragraph>
            Turn your waste into rewards while saving the planet
          </Typography>
          {!currentUser && (
            <Button
              component={Link}
              to="/login"
              variant="contained"
              size="large"
              style={{ 
                backgroundColor: 'white', 
                color: '#2e7d32',
                marginTop: '1rem'
              }}
            >
              Get Started
            </Button>
          )}
          {currentUser && (
            <Button
              component={Link}
              to="/scan"
              variant="contained"
              size="large"
              style={{ 
                backgroundColor: 'white', 
                color: '#2e7d32',
                marginTop: '1rem'
              }}
            >
              Scan Waste Bin
            </Button>
          )}
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
        <Typography variant="h4" align="center" gutterBottom>
          How It Works
        </Typography>
        <Typography variant="body1" align="center" paragraph>
          Follow these simple steps to start earning rewards for recycling
        </Typography>

        <Grid container spacing={4} style={{ marginTop: '2rem' }}>
          <Grid item xs={12} md={4}>
            <Card elevation={3} style={{ height: '100%' }}>
              <CardContent style={{ textAlign: 'center', padding: '2rem' }}>
                <Typography variant="h6" gutterBottom>
                  1. Scan QR Code
                </Typography>
                <Typography variant="body1">
                  Find a Carbon Bytes waste bin near you and scan the QR code with our app
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={3} style={{ height: '100%' }}>
              <CardContent style={{ textAlign: 'center', padding: '2rem' }}>
                <Typography variant="h6" gutterBottom>
                  2. Deposit Waste
                </Typography>
                <Typography variant="body1">
                  Place your waste in the bin. Our smart system detects what type of waste it is
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={3} style={{ height: '100%' }}>
              <CardContent style={{ textAlign: 'center', padding: '2rem' }}>
                <Typography variant="h6" gutterBottom>
                  3. Earn Points
                </Typography>
                <Typography variant="body1">
                  Get points based on the type of waste: 10 points for plastic and metal, 5 points for glass, and more
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Rewards Section */}
      <Box style={{ backgroundColor: '#f5f5f5', padding: '4rem 0' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" gutterBottom>
            Rewards Coming Soon
          </Typography>
          <Typography variant="body1" align="center" paragraph>
            We're working on exciting partnerships to let you redeem your points for rewards
          </Typography>

          <Grid container spacing={3} style={{ marginTop: '2rem' }}>
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <Typography variant="h6" gutterBottom>
                    Gift Cards
                  </Typography>
                  <Typography variant="body2">
                    Exchange your points for gift cards from popular retailers
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <Typography variant="h6" gutterBottom>
                    Discounts
                  </Typography>
                  <Typography variant="body2">
                    Get discounts on eco-friendly products and services
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <Typography variant="h6" gutterBottom>
                    Tree Planting
                  </Typography>
                  <Typography variant="body2">
                    Contribute to reforestation projects with your points
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </div>
  );
};

export default Home;