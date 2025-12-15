'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Camera, User, LogOut, CheckCircle, XCircle, Clock, MapPin, X } from 'lucide-react';

// Mock user database - replace with your API calls
const mockUsers = {
  'USR001': {
    id: 'USR001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1234567890',
    registrationId: 'REG-2024-001',
    event: {
      name: 'Tech Conference 2024',
      date: 'December 20, 2024',
      time: '10:00 AM',
      venue: 'Convention Center, Hall A',
      category: 'Technology'
    },
    checkedIn: false,
    registrationDate: 'November 15, 2024'
  },
  'USR002': {
    id: 'USR002',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1234567891',
    registrationId: 'REG-2024-002',
    event: {
      name: 'Tech Conference 2024',
      date: 'December 20, 2024',
      time: '10:00 AM',
      venue: 'Convention Center, Hall A',
      category: 'Technology'
    },
    checkedIn: false,
    registrationDate: 'November 18, 2024'
  },
  'USR003': {
    id: 'USR003',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1234567892',
    registrationId: 'REG-2024-003',
    event: {
      name: 'Tech Conference 2024',
      date: 'December 20, 2024',
      time: '10:00 AM',
      venue: 'Convention Center, Hall A',
      category: 'Technology'
    },
    checkedIn: false,
    registrationDate: 'November 20, 2024'
  }
};

const home = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [volunteer, setVolunteer] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [checkedInUsers, setCheckedInUsers] = useState({});
  const [scanResult, setScanResult] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [cameraError, setCameraError] = useState(null);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  // Load html5-qrcode library
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const startScanning = async () => {
    if (!window.Html5Qrcode) {
      setCameraError('QR Scanner library not loaded yet. Please wait...');
      return;
    }

    try {
      setCameraError(null);
      setScanning(true);

      // Create scanner instance
      const html5QrCode = new window.Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      // Get available cameras
      const devices = await window.Html5Qrcode.getCameras();
      
      if (devices && devices.length > 0) {
        // Prefer back camera for mobile devices
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        );
        const cameraId = backCamera ? backCamera.id : devices[0].id;

        // Start scanning
        await html5QrCode.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText, decodedResult) => {
            // Success callback - QR code detected
            handleQRScan(decodedText);
            stopScanning();
          },
          (errorMessage) => {
            // Error callback - can be ignored for scanning errors
            // This fires continuously while scanning, so we don't log it
          }
        );
      } else {
        setCameraError('No cameras found on this device');
        setScanning(false);
      }
    } catch (err) {
      console.error('Error starting scanner:', err);
      setCameraError('Failed to start camera. Please check permissions.');
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && scanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      html5QrCodeRef.current = null;
      setScanning(false);
    }
  };

  const handleQRScan = (qrData) => {
    const user = mockUsers[qrData];
    if (user) {
      if (checkedInUsers[qrData]) {
        setScanResult({ success: false, message: 'User already checked in!' });
        setTimeout(() => setScanResult(null), 3000);
      } else {
        setSelectedUser(user);
        setCurrentScreen('userDetail');
      }
    } else {
      setScanResult({ success: false, message: 'Invalid QR Code: ' + qrData });
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  const handleLogin = () => {
    if (loginForm.username && loginForm.password) {
      setVolunteer({ name: loginForm.username, id: 'VOL001' });
      setCurrentScreen('scanner');
    }
  };

  const handleCheckIn = () => {
    if (selectedUser) {
      setCheckedInUsers(prev => ({
        ...prev,
        [selectedUser.id]: {
          ...selectedUser,
          checkedInAt: new Date().toISOString(),
          checkedInBy: volunteer.name
        }
      }));
      setScanResult({ success: true, message: 'Check-in successful!' });
      setCurrentScreen('scanner');
      setSelectedUser(null);
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  const handleLogout = () => {
    stopScanning();
    setVolunteer(null);
    setCurrentScreen('login');
    setCheckedInUsers({});
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // Login Screen
  if (currentScreen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Event Check-In</h1>
            <p className="text-gray-600">Volunteer Portal</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800 text-center">
                Demo: Use any username/password to login. Scan QR codes: USR001, USR002, USR003
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Scanner Screen
  if (currentScreen === 'scanner') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Event Check-In</h2>
              <p className="text-sm text-gray-600">Welcome, {volunteer?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Checked In</p>
                  <p className="text-2xl font-bold text-gray-800">{Object.keys(checkedInUsers).length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Registered</p>
                  <p className="text-2xl font-bold text-gray-800">{Object.keys(mockUsers).length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scan Result Alert */}
          {scanResult && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              scanResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {scanResult.success ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{scanResult.message}</span>
            </div>
          )}

          {/* Camera Error Alert */}
          {cameraError && (
            <div className="mb-6 p-4 rounded-lg flex items-center gap-3 bg-yellow-50 text-yellow-800">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">{cameraError}</span>
            </div>
          )}

          {/* QR Scanner */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-4">
                <Camera className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Scan QR Code</h3>
              <p className="text-gray-600">Position the QR code within the frame</p>
            </div>

            {/* Scanner Area */}
            {scanning ? (
              <div className="relative mx-auto max-w-md">
                <div id="qr-reader" className="rounded-2xl overflow-hidden"></div>
                <button
                  onClick={stopScanning}
                  className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <X className="w-5 h-5" />
                  Stop Scanning
                </button>
              </div>
            ) : (
              <div>
                <div className="mx-auto w-64 h-64 border-4 border-dashed border-gray-300 bg-gray-50 rounded-2xl mb-6 flex items-center justify-center">
                  <Camera className="w-16 h-16 text-gray-400" />
                </div>
                <button
                  onClick={startScanning}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Start Camera
                </button>
                <p className="text-xs text-gray-500 mt-4">
                  Camera permission required. Scan QR codes: USR001, USR002, USR003
                </p>
              </div>
            )}
          </div>

          {/* Recent Check-ins */}
          {Object.keys(checkedInUsers).length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold text-gray-800 mb-4">Recent Check-ins</h4>
              <div className="space-y-3">
                {Object.values(checkedInUsers).reverse().slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.registrationId}</p>
                    </div>
                    <span className="text-xs text-green-600 font-medium">
                      {new Date(user.checkedInAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // User Detail Screen
  if (currentScreen === 'userDetail' && selectedUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => {
                setCurrentScreen('scanner');
                setSelectedUser(null);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Scanner
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* User Details */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                  <p className="text-blue-100">{selectedUser.registrationId}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="px-8 py-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-800">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-800">{selectedUser.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="px-8 py-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Event Name</p>
                  <p className="font-semibold text-gray-800 text-lg">{selectedUser.event.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-medium text-gray-800">{selectedUser.event.date}</p>
                      <p className="text-sm text-gray-700">{selectedUser.event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Venue</p>
                      <p className="font-medium text-gray-800">{selectedUser.event.venue}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {selectedUser.event.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Registration Info */}
            <div className="px-8 py-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Registered On</p>
                  <p className="font-medium text-gray-800">{selectedUser.registrationDate}</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => {
                setCurrentScreen('scanner');
                setSelectedUser(null);
              }}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCheckIn}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Confirm Check-In
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Verify attendee identity matches the registration</li>
              <li>Click "Confirm Check-In" to complete the process</li>
              <li>Direct the attendee to {selectedUser.event.venue}</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default home;