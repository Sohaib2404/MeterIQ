// --- script.js modifications ---

// Base URL for your backend API
const API_BASE_URL = 'http://localhost:3000/api'; // Make sure this matches your backend port

document.addEventListener("DOMContentLoaded", () => {
  // ==== LOGIN ====
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.success) {
          // Store basic user data in localStorage for simple demo purposes
          // In a real app, you might store a JWT token or session ID
          localStorage.setItem("loggedIn", "true");
          localStorage.setItem("electricityBalance", data.userData.electricityBalance);
          localStorage.setItem("gasBalance", data.userData.gasBalance);
          localStorage.setItem("notifications", JSON.stringify(data.userData.notifications));
          localStorage.setItem("rechargeHistory", JSON.stringify(data.userData.rechargeHistory));

          window.location.href = "dashboard.html";
        } else {
          const error = document.getElementById("loginError");
          if (error) error.textContent = data.message;
        }
      } catch (error) {
        console.error('Login error:', error);
        document.getElementById("loginError");
        if (error) error.textContent = "Network error. Please try again.";
      }
    });
  }

  // ==== LOGOUT ====
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // In a real app, you'd also hit a logout endpoint on the backend
      localStorage.clear();
      window.location.href = "index.html";
    });
  }

  // ==== DASHBOARD BALANCES ====
  const elecBalanceEl = document.getElementById("electricityBalance");
  const gasBalanceEl = document.getElementById("gasBalance");
  if (elecBalanceEl && gasBalanceEl) {
    // Fetch balances from backend
    fetch(`${API_BASE_URL}/dashboard`)
      .then(response => response.json())
      .then(data => {
        elecBalanceEl.textContent = parseFloat(data.electricityBalance || "0").toFixed(2);
        gasBalanceEl.textContent = parseFloat(data.gasBalance || "0").toFixed(2);
        // checkLowBalance(); // Low balance check now done on backend
      })
      .catch(error => {
        console.error('Error fetching dashboard data:', error);
        elecBalanceEl.textContent = 'N/A';
        gasBalanceEl.textContent = 'N/A';
      });
  }

  // ==== BUY PACKAGES RECHARGE FUNCTION ====
  // Make sure this function is global or accessible
  window.recharge = async function (type, units) {
    try {
      const response = await fetch(`${API_BASE_URL}/recharge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, units }),
      });

      const data = await response.json();

      const msg = document.getElementById("rechargeConfirm");
      if (data.success) {
        if (msg) msg.textContent = `Recharge successful! ${units} units added. New balance: ${data.newBalance.toFixed(2)} ${type === 'electricity' ? 'kWh' : 'm³'}.`;
        // Optionally update dashboard balances if on that page, or reload
        if (elecBalanceEl && gasBalanceEl) {
             // Re-fetch to get latest balances and notifications
             fetch(`${API_BASE_URL}/dashboard`)
             .then(res => res.json())
             .then(dashboardData => {
                 elecBalanceEl.textContent = parseFloat(dashboardData.electricityBalance || "0").toFixed(2);
                 gasBalanceEl.textContent = parseFloat(dashboardData.gasBalance || "0").toFixed(2);
             });
        }
        // Also update local storage for other pages to reflect changes
        localStorage.setItem("electricityBalance", data.newBalance); // if type is electricity
        localStorage.setItem("gasBalance", data.newBalance); // if type is gas (you'll need to refine this to update correctly)

        // For simplicity, re-fetch notifications and history if you want them immediately updated
        // In a more complex app, you'd update specific elements or use state management
        loadNotifications(); // Call function to load notifications
        loadRechargeHistory(); // Call function to load history
      } else {
        msg.textContent = `Recharge failed: ${data.message}`;
        msg.style.color = 'red';
      }
    } catch (error) {
      console.error('Recharge error:', error);
      const msg = document.getElementById("rechargeConfirm");
      if (msg) {
        msg.textContent = "Network error during recharge.";
        msg.style.color = 'red';
      }
    }
  };

  // ==== RECHARGE HISTORY ====
  const historyTable = document.getElementById("rechargeHistoryTable");
  function loadRechargeHistory() {
      if (historyTable) {
        fetch(`${API_BASE_URL}/recharge-history`)
          .then(response => response.json())
          .then(history => {
            if (history.length === 0) {
              historyTable.innerHTML = "<tr><td colspan='4'>No recharge history yet.</td></tr>";
            } else {
              historyTable.innerHTML = history.map(h => `
                <tr>
                  <td>${h.date}</td>
                  <td>${h.utility}</td>
                  <td>${h.units}</td>
                  <td>${h.amount}</td>
                </tr>
              `).join("");
            }
          })
          .catch(error => {
            console.error('Error fetching recharge history:', error);
            historyTable.innerHTML = "<tr><td colspan='4'>Failed to load history.</td></tr>";
          });
      }
  }
  loadRechargeHistory(); // Initial load

  // ==== NOTIFICATIONS ====
  const notificationsList = document.getElementById("notificationsList");
  function loadNotifications() {
      if (notificationsList) {
        fetch(`${API_BASE_URL}/notifications`)
          .then(response => response.json())
          .then(notes => {
            if (notes.length === 0) {
              notificationsList.innerHTML = "<li>No notifications yet.</li>";
            } else {
              notificationsList.innerHTML = notes.map(note => `
                <li>
                  <span class="note-time">${note.timestamp}</span><br />
                  <span class="note-text">${note.message}</span>
                </li>
              `).join("");
            }
          })
          .catch(error => {
            console.error('Error fetching notifications:', error);
            notificationsList.innerHTML = "<li>Failed to load notifications.</li>";
          });
      }
  }
  loadNotifications(); // Initial load

  // ==== CHARTS ==== (No change needed here as data is local to script.js for now)
  // ... (existing chart code remains largely the same, unless you want chart data from backend)


}); 
