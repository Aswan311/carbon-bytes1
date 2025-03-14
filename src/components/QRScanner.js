import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Button, 
  CircularProgress, Box 
} from '@mui/material';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Html5Qrcode } from "html5-qrcode";
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const QRScanner = () => {
  const { currentUser } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [connected, setConnected] = useState(false);
  const [machineId, setMachineId] = useState(null);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [qrScanner, setQrScanner] = useState(null);

  // Handle QR code scanning
  const handleScan = async (data) => {
    if (data && !connected) {
      try {
        setScanning(false);
        const machineRef = doc(db, 'machines', data);
        const machineDoc = await getDoc(machineRef);
        
        if (!machineDoc.exists()) {
          setError('Invalid QR code. Machine not found.');
          return;
        }
        
        await updateDoc(machineRef, {
          currentSession: currentUser.uid,
          lastActive: serverTimestamp(),
          status: 'active'
        });
        
        setMachineId(data);
        setConnected(true);
        setCountdown(120);
      } catch (error) {
        console.error("Error connecting to machine:", error);
        setError('Failed to connect to machine. Please try again.');
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError('Error accessing camera. Please check permissions.');
  };

  // Start QR code scanning with permission request
  const startScan = async () => {
    setError('');
    setScanning(true);

    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Close the stream after checking permission

      if (!qrScanner) {
        const html5QrCode = new Html5Qrcode("qr-video");
        html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            handleScan(decodedText);
            html5QrCode.stop();
          },
          handleError
        ).catch(err => handleError(err));
        setQrScanner(html5QrCode);
      }
    } catch (error) {
      console.error("Camera permission denied or unavailable:", error);
      setError('Camera access denied or unavailable. Please check permissions.');
      setScanning(false);
    }
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

  // Countdown timer for auto-disconnect
  useEffect(() => {
    let interval;
    if (connected && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && connected) {
      disconnect();
    }
    return () => clearInterval(interval);
  }, [connected, countdown]);

  // Activity checker to refresh session
  useEffect(() => {
    let activityChecker;
    if (connected && machineId) {
      activityChecker = setInterval(async () => {
        try {
          const machineRef = doc(db, 'machines', machineId);
          const machineDoc = await getDoc(machineRef);
          
          if (machineDoc.exists()) {
            const lastActive = machineDoc.data().lastActive?.toDate();
            if (lastActive) {
              const now = new Date();
              const diffInMinutes = (now - lastActive) / 1000 / 60;
              if (diffInMinutes <= 2) setCountdown(120);
            }
          }
        } catch (error) {
          console.error("Error checking activity:", error);
        }
      }, 10000);
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
            <Typography variant="h6">Connected to Machine</Typography>
            <Typography variant="body1">
              Time remaining: {Math.floor(countdown / 60)}:
              {countdown % 60 < 10 ? '0' : ''}{countdown % 60}
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
            <div id="qr-video" style={{ width: '250px', height: '250px', margin: '1rem auto', backgroundColor: '#f0f0f0' }} />
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
            <Button 
              variant="contained" 
              color="primary" 
              onClick={startScan}
            >
              Start Scanning
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default QRScanner;
