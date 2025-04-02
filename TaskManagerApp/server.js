const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const qrcode = require('qrcode');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 19000;

// Serve static files
app.use(express.static(path.join(__dirname, 'assets')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Get the Docker host IP
function getDockerHostIp() {
  // Check if REACT_NATIVE_PACKAGER_HOSTNAME is set
  if (process.env.REACT_NATIVE_PACKAGER_HOSTNAME) {
    return process.env.REACT_NATIVE_PACKAGER_HOSTNAME;
  }
  
  // Fallback to localhost
  return 'localhost';
}

// Root endpoint - serve a simple HTML page with QR code
app.get('/', async (req, res) => {
  const dockerHostIp = getDockerHostIp();
  
  // Generate QR codes for different connection methods
  const qrCodes = [];
  
  // Method 1: Using the Docker host IP
  const expUrl = `exp://${dockerHostIp}:19000`;
  try {
    const qrCodeDataUrl = await qrcode.toDataURL(expUrl);
    qrCodes.push({ 
      name: 'Docker Host IP', 
      ip: dockerHostIp, 
      url: expUrl, 
      qrCode: qrCodeDataUrl 
    });
  } catch (err) {
    console.error(`Error generating QR code for ${dockerHostIp}:`, err);
  }
  
  // Method 2: Using localhost (for testing on the same machine)
  const localUrl = `exp://localhost:19000`;
  try {
    const localQrCodeDataUrl = await qrcode.toDataURL(localUrl);
    qrCodes.push({ 
      name: 'Localhost', 
      ip: 'localhost', 
      url: localUrl, 
      qrCode: localQrCodeDataUrl 
    });
  } catch (err) {
    console.error(`Error generating QR code for localhost:`, err);
  }
  
  // Get all local IP addresses for additional options
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip over non-IPv4 and internal addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        const ifaceUrl = `exp://${iface.address}:19000`;
        try {
          const ifaceQrCodeDataUrl = await qrcode.toDataURL(ifaceUrl);
          qrCodes.push({ 
            name: `Network Interface: ${name}`, 
            ip: iface.address, 
            url: ifaceUrl, 
            qrCode: ifaceQrCodeDataUrl 
          });
        } catch (err) {
          console.error(`Error generating QR code for ${iface.address}:`, err);
        }
      }
    }
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Task Manager Mobile App</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
          .container { max-width: 800px; margin: 0 auto; }
          h1 { color: #1976d2; }
          .card { background: #f5f5f5; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .button { display: inline-block; background: #1976d2; color: white; padding: 10px 20px; 
                   text-decoration: none; border-radius: 4px; margin-right: 10px; }
          .qr-code { text-align: center; margin: 20px 0; }
          .qr-code img { max-width: 200px; }
          .instructions { background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px; }
          .code { font-family: monospace; background: #f0f0f0; padding: 2px 5px; border-radius: 3px; }
          .ip-options { margin-top: 20px; }
          .ip-option { margin-bottom: 30px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
          .warning { background: #fff3e0; padding: 15px; border-radius: 8px; margin-top: 20px; }
          .troubleshooting { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Task Manager Mobile App</h1>
          
          <div class="card">
            <h2>Expo Development Server</h2>
            <p>The Expo development server is running. Use the Expo Go app on your mobile device to connect.</p>
            
            <div class="warning">
              <h3>⚠️ Important: Network Configuration</h3>
              <p>We've provided multiple connection options below. Try each QR code until one works with your mobile device.</p>
              <p>Make sure your mobile device is on the same network as this computer.</p>
            </div>
            
            <div class="instructions">
              <h3>How to connect:</h3>
              <ol>
                <li>Install the <a href="https://expo.dev/client" target="_blank">Expo Go app</a> on your iOS or Android device</li>
                <li>Make sure your mobile device is on the same network as this computer</li>
                <li>Scan one of the QR codes below with the Expo Go app (or your device's camera)</li>
                <li>Or open Expo Go and enter the URL manually</li>
              </ol>
            </div>
            
            <div class="ip-options">
              <h3>Available Connection Options:</h3>
              ${qrCodes.map((item, index) => `
                <div class="ip-option">
                  <h4>Option ${index + 1}: ${item.name} (${item.ip})</h4>
                  <div class="qr-code">
                    <img src="${item.qrCode}" alt="QR Code for ${item.ip}" />
                    <p>URL: <span class="code">${item.url}</span></p>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="troubleshooting">
              <h3>🔧 Troubleshooting</h3>
              <p>If you're having trouble connecting:</p>
              <ul>
                <li>Make sure your mobile device is on the same network as this computer</li>
                <li>Try using a different QR code from the options above</li>
                <li>Check if your firewall is blocking connections on ports 19000-19002 or 8081</li>
                <li>Try restarting the Expo Go app on your device</li>
                <li>Try restarting the Docker containers with <code>docker-compose down && docker-compose up</code></li>
              </ul>
            </div>
          </div>
          
          <div class="card">
            <h2>Direct Access URLs</h2>
            <p>Metro Bundler: <a href="http://localhost:8081" target="_blank">http://localhost:8081</a></p>
            <p>Docker Host: ${dockerHostIp}</p>
          </div>
          
          <div class="card">
            <h2>Quick Links</h2>
            <a class="button" href="/health">Health Check</a>
            <a class="button" href="http://localhost:3000">Web Frontend</a>
            <a class="button" href="http://localhost:8000">Backend API</a>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express server running at http://0.0.0.0:${PORT}`);
  startExpo();
});

// Function to start Expo
function startExpo() {
  console.log('Starting Expo development server...');
  
  // Check if expo-cli is installed
  try {
    const expoVersion = require('child_process').execSync('npx expo --version').toString().trim();
    console.log(`Found Expo CLI version: ${expoVersion}`);
  } catch (error) {
    console.error('Expo CLI not found. Installing...');
    require('child_process').execSync('npm install -g expo-cli');
  }
  
  // Create placeholder image files if they don't exist
  const assetsDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  const iconPath = path.join(assetsDir, 'icon.png');
  const splashPath = path.join(assetsDir, 'splash.png');
  const faviconPath = path.join(assetsDir, 'favicon.png');
  const adaptiveIconPath = path.join(assetsDir, 'adaptive-icon.png');
  
  // Create empty placeholder images if they don't exist
  if (!fs.existsSync(iconPath)) {
    fs.writeFileSync(iconPath, Buffer.alloc(100));
  }
  if (!fs.existsSync(splashPath)) {
    fs.writeFileSync(splashPath, Buffer.alloc(100));
  }
  if (!fs.existsSync(faviconPath)) {
    fs.writeFileSync(faviconPath, Buffer.alloc(100));
  }
  if (!fs.existsSync(adaptiveIconPath)) {
    fs.writeFileSync(adaptiveIconPath, Buffer.alloc(100));
  }
  
  // Set CI environment variable to avoid interactive prompts
  process.env.CI = '1';
  
  // Get the Docker host IP for Expo
  const hostIP = process.env.REACT_NATIVE_PACKAGER_HOSTNAME || 'localhost';
  console.log(`Using host IP for Expo: ${hostIP}`);
  
  // Start Expo with appropriate flags
  const expo = spawn('npx', ['expo', 'start', '--host', 'localhost'], {
    stdio: 'pipe',
    shell: true,
    env: { 
      ...process.env, 
      CI: '1',
      REACT_NATIVE_PACKAGER_HOSTNAME: hostIP
    }
  });
  
  expo.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`Expo: ${output}`);
    
    // Look for QR code or URLs in the output
    if (output.includes('QR code:') || output.includes('http://')) {
      console.log('Expo development server is running!');
    }
  });
  
  expo.stderr.on('data', (data) => {
    console.error(`Expo error: ${data.toString()}`);
  });
  
  expo.on('close', (code) => {
    console.log(`Expo process exited with code ${code}`);
    if (code !== 0) {
      console.log('Attempting to restart Expo...');
      setTimeout(startExpo, 5000);
    }
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('SIGINT received, killing Expo process...');
    expo.kill();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
  
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, killing Expo process...');
    expo.kill();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}