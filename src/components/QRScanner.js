import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Button, 
  CircularProgress, Box 
} from '@mui/material';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const QRScanner = () => {
  const { currentUser } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [connected, setConnected] = useState(false);
  const [machineId, setMachineId] = useState(null);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Handle QR code scanning
  const handleScan = async (data) => {
    if (data && !connected) {
      try {
        setScanning(false);
        
        // Check if QR code is valid machine ID
        const machineRef = doc(db, 'machines', data);
        const machineDoc = await getDoc(machineRef);
        
        if (!machineDoc.exists()) {
          setError('Invalid QR code. Machine not found.');
          return;
        }
        
        // Update machine with user session
        await updateDoc(machineRef, {
          currentSession: currentUser.uid,
          lastActive: serverTimestamp(),
          status: 'active'
        });
        
        setMachineId(data);
        setConnected(true);
        setCountdown(120); // 2 minutes
      } catch (error) {
        console.error("Error connecting to machine:", error);
        setError('Failed to connect to machine. Please try again.');
      }
    }
  };

  // Handle QR code errors
  const handleError = (err) => {
    console.error(err);
    setError('Error accessing camera. Please check permissions.');
  };

  // Start scanning
  const startScan = () => {
    setScanning(true);
    setError('');
  };

  // Disconnect from machine
  const disconnect = async () => {
    if (machineId) {
      try {
        const machineRef = doc(db, 'machines', machineId);
        await updateDoc(machineRef, {
          currentSession: null,
          status: 'idle'
        });
      } catch (error) {
        console.error("Error disconnecting:", error);
      }
    }
    
    setConnected(false);
    setMachineId(null);
  };

  // Countdown timer for auto-disconnect (continued)
useEffect(() => {
    let interval;
    if (connected && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prevCount => prevCount - 1);
      }, 1000);
    } else if (countdown === 0 && connected) {
      disconnect();
    }
    return () => clearInterval(interval);
  }, [connected, countdown]);
  
  // Check for activity
  useEffect(() => {
    let activityChecker;
    if (connected && machineId) {
      activityChecker = setInterval(async () => {
        try {
          const machineRef = doc(db, 'machines', machineId);
          const machineDoc = await getDoc(machineRef);
          
          if (machineDoc.exists()) {
            const data = machineDoc.data();
            if (data.lastActive) {
              const lastActiveTime = data.lastActive.toDate();
              const now = new Date();
              const diffInMinutes = (now - lastActiveTime) / 1000 / 60;
              
              if (diffInMinutes <= 2) {
                // Reset countdown if there's activity
                setCountdown(120);
              }
            }
          }
        } catch (error) {
          console.error("Error checking activity:", error);
        }
      }, 10000); // Check every 10 seconds
    }
    
    return () => clearInterval(activityChecker);
  }, [connected, machineId]);
  
  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      <Paper elevation={3} style={{ padding: '2rem' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Scan QR Code
        </Typography>
        
        {error && (
          <Typography variant="body2" color="error" align="center" gutterBottom>
            {error}
          </Typography>
        )}
        
        {connected ? (
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h6" gutterBottom>
              Connected to Machine
            </Typography>
            <Typography variant="body1" gutterBottom>
              Time remaining: {Math.floor(countdown / 60)}:{countdown % 60 < 10 ? '0' : ''}{countdown % 60}
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={disconnect}
              style={{ marginTop: '1rem' }}
            >
              Disconnect
            </Button>
          </Box>
        ) : scanning ? (
          <Box display="flex" flexDirection="column" alignItems="center">
            <div style={{ width: '100%', maxWidth: '300px', height: '300px', background: '#f0f0f0', margin: '1rem auto', position: 'relative' }}>
              <video 
                id="qr-video" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                autoPlay 
                playsInline
              />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '2px solid #4caf50', boxSizing: 'border-box' }} />
            </div>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setScanning(false)}
              style={{ marginTop: '1rem' }}
            >
              Cancel
            </Button>
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" marginTop="1rem">
            <Button variant="contained" color="primary" onClick={startScan}>
              Start Scanning
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};
export default QRScanner;