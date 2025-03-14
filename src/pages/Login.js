import React, { useState } from 'react';
import { 
  Container, Typography, Paper, Button, Box, 
  CircularProgress 
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await googleLogin();
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in with Google. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '4rem' }}>
      <Paper elevation={3} style={{ padding: '2rem' }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h4" gutterBottom>
            Welcome to Carbon Bytes
          </Typography>
          <Typography variant="body1" align="center" paragraph>
            Join our community to help reduce waste and earn rewards for your environmental contributions.
          </Typography>
          
          {error && (
            <Typography variant="body2" color="error" paragraph>
              {error}
            </Typography>
          )}
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{ 
              backgroundColor: '#4285F4',
              color: 'white',
              marginTop: '1rem',
              padding: '0.5rem 1rem'
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                  alt="Google logo" 
                  style={{ width: '20px', marginRight: '10px' }}
                />
                Sign in with Google
              </>
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

// ✅ Add the default export here
export default Login;
