const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000; // Or any other port you prefer

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON request bodies

// Basic route for testing
app.get('/', (req, res) => {
  res.send('MeterIQ Backend is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// Simulate a simple in-memory database
let userData = {
  name: 'Wasif Ali',
  meterNo: '80013491',
  meterType: 'Domestic',
  electricityBalance: 32, // Initial balance
  gasBalance: 12,       // Initial balance
  notifications: [],
  rechargeHistory: []
};

// Endpoint to get dashboard data
app.get('/api/dashboard', (req, res) => {
  res.json({
    name: userData.name,
    meterNo: userData.meterNo,
    meterType: userData.meterType,
    electricityBalance: userData.electricityBalance,
    gasBalance: userData.gasBalance
  });
});

// Endpoint to handle login (very basic for demonstration)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'user' && password === '1234') {
        // In a real app, you'd fetch user data from a DB based on username
        // and handle authentication more securely.
        res.json({
            success: true,
            message: 'Login successful',
            userData: { // Send initial user data after login
                name: userData.name,
                meterNo: userData.meterNo,
                meterType: userData.meterType,
                electricityBalance: userData.electricityBalance,
                gasBalance: userData.gasBalance,
                notifications: userData.notifications,
                rechargeHistory: userData.rechargeHistory
            }
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});


// Endpoint to handle recharge
app.post('/api/recharge', (req, res) => {
  const { type, units } = req.body;

  if (type === 'electricity') {
    const unitPrice = 70.2;
    userData.electricityBalance += units;
    const cost = (units * unitPrice).toFixed(0);
    const notificationMessage = `Recharge Successful: +${units} kWh.`;
    const historyEntry = {
        date: new Date().toLocaleString(),
        utility: 'Electricity',
        units,
        amount: cost
    };
    userData.notifications.unshift({ message: notificationMessage, timestamp: new Date().toLocaleString() });
    userData.rechargeHistory.unshift(historyEntry);
    res.json({ success: true, newBalance: userData.electricityBalance, message: 'Electricity recharged successfully!' });
  } else if (type === 'gas') {
    const unitPrice = 234;
    userData.gasBalance += units;
    const cost = (units * unitPrice).toFixed(0);
    const notificationMessage = `Recharge Successful: +${units} m³.`;
    const historyEntry = {
        date: new Date().toLocaleString(),
        utility: 'Gas',
        units,
        amount: cost
    };
    userData.notifications.unshift({ message: notificationMessage, timestamp: new Date().toLocaleString() });
    userData.rechargeHistory.unshift(historyEntry);
    res.json({ success: true, newBalance: userData.gasBalance, message: 'Gas recharged successfully!' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid utility type.' });
  }

  // Check for low balance after any recharge or consumption (simulate consumption later)
  checkLowBalance();
});

// Helper function to add notifications
function addNotification(message) {
    userData.notifications.unshift({
        message,
        timestamp: new Date().toLocaleString()
    });
}

// Helper function to check low balance
function checkLowBalance() {
  if (userData.electricityBalance < 10 && !userData.notifications.some(n => n.message.includes('Electricity balance is below 10 kWh'))) {
    addNotification("⚠ Electricity balance is below 10 kWh.");
  }
  if (userData.gasBalance < 10 && !userData.notifications.some(n => n.message.includes('Gas balance is below 10 m³'))) {
    addNotification("⚠ Gas balance is below 10 m³.");
  }
}

// Endpoint to get notifications
app.get('/api/notifications', (req, res) => {
  res.json(userData.notifications);
});

// Endpoint to get recharge history
app.get('/api/recharge-history', (req, res) => {
  res.json(userData.rechargeHistory);
});

// Initial low balance check (if starting with low balance)
checkLowBalance();