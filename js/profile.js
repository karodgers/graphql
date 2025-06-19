import { getJWT } from './api.js';
import { fetchUserInfo, renderUserInfo } from './user.js';

// Check for JWT
const jwt = getJWT();
if (!jwt) {
  window.location.href = '../html/login.html';
}

// Logout functionality
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('jwt');
    window.location.href = '../html/login.html';
  });
}

// Fetch and render user info
fetchUserInfo()
  .then(renderUserInfo)
  .catch(err => {
    document.getElementById('user-info').textContent = 'Error loading user info.';
  }); 