// Simple auth frontend: register/login by name. Stores current user in localStorage.
window.addEventListener('DOMContentLoaded', () => {
  const authPanel = document.getElementById('authPanel');
  const homePanel = document.getElementById('homePanel');
  const battlePanel = document.getElementById('battlePanel');
  const nameInput = document.getElementById('nameInput');
  const passwordInput = document.getElementById('passwordInput');
  const registerBtn = document.getElementById('registerBtn');
  const loginBtn = document.getElementById('loginBtn');
  const playBtn = document.getElementById('playBtn');
  const matchmakingBtn = document.getElementById('matchmakingBtn');
  const homeUsername = document.getElementById('homeUsername');
  const battleUsername = document.getElementById('battleUsername');
  const messages = document.getElementById('messages');

  function showMessage(text, color = 'lightgreen') {
    messages.style.color = color;
    messages.textContent = text;
  }

  function setLoggedIn(user) {
    localStorage.setItem('player', JSON.stringify(user));
    authPanel.style.display = 'none';
    homePanel.style.display = 'block';
    battlePanel.style.display = 'none';
    homeUsername.textContent = `${user.name}`;
    battleUsername.textContent = `${user.name}`;
    showMessage(`Welcome back, ${user.name}!`);
  }

  function setLoggedOut() {
    localStorage.removeItem('player');
    authPanel.style.display = 'block';
    homePanel.style.display = 'none';
    battlePanel.style.display = 'none';
    nameInput.value = '';
    passwordInput.value = '';
    showMessage('Please sign in or register.', 'lightblue');
  }

  function checkLogged() {
    const stored = localStorage.getItem('player');
    if (stored) {
      setLoggedIn(JSON.parse(stored));
    } else {
      setLoggedOut();
    }
  }

  registerBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const password = passwordInput.value;
    if (!name) return showMessage('Enter a name', 'orange');
    if (!password) return showMessage('Enter a password', 'orange');

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    });

    if (res.ok) {
      const user = await res.json();
      setLoggedIn(user);
    } else if (res.status === 409) {
      showMessage('Name already exists', 'orange');
    } else {
      const err = await res.json().catch(() => ({ error: 'Unknown' }));
      showMessage(err.error || 'Register failed', 'red');
    }
  });

  loginBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const password = passwordInput.value;
    if (!name) return showMessage('Enter a name', 'orange');
    if (!password) return showMessage('Enter a password', 'orange');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    });

    if (res.ok) {
      const user = await res.json();
      setLoggedIn(user);
    } else if (res.status === 404 || res.status === 401) {
      showMessage('Invalid name or password', 'orange');
    } else {
      const err = await res.json().catch(() => ({ error: 'Unknown' }));
      showMessage(err.error || 'Login failed', 'red');
    }
  });

  playBtn.addEventListener('click', () => {
    homePanel.style.display = 'none';
    battlePanel.style.display = 'block';
    const gameCanvas = document.getElementById('gameCanvas');
    if (gameCanvas) gameCanvas.style.display = 'block';
    showMessage('Good luck! Use Q/E/F/R/C for abilities.');
  });

  matchmakingBtn.addEventListener('click', () => {
    showMessage('Matchmaking coming soon!', 'lightblue');
  });

  checkLogged();
});
