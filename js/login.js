document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');
  errorDiv.style.display = 'none';

  // Prepare Basic Auth header
  const credentials = btoa(`${username}:${password}`);

  try {
    const response = await fetch('https://learn.zone01kisumu.ke/api/auth/signin', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Invalid credentials. Please try again.');
    }
    const data = await response.json();
    if (!data || !data) {
      throw new Error('No token received.');
    }
    // Store JWT in localStorage
    localStorage.setItem('jwt', data);
    // Redirect to profile page
    window.location.href = 'profile.html';
  } catch (err) {
    errorDiv.textContent = err.message;
    errorDiv.style.display = 'block';
  }
}); 