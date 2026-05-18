// Simple auth frontend: register/login by name. Stores current user in localStorage.
window.addEventListener('DOMContentLoaded', () => {
  const nameInput = document.getElementById('nameInput');
  const passwordInput = document.getElementById('passwordInput');
  const registerBtn = document.getElementById('registerBtn');
  const loginBtn = document.getElementById('loginBtn');
  const goGameBtn = document.getElementById('goGameBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const welcomeBanner = document.getElementById('welcomeBanner');
  const messages = document.getElementById('messages');
  const gameCanvas = document.getElementById('gameCanvas');

  function showMessage(text, color='lightgreen'){
    messages.style.color = color;
    messages.textContent = text;
  }

  function setLoggedIn(user){
    localStorage.setItem('player', JSON.stringify(user));
    registerBtn.style.display = 'none';
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    goGameBtn.style.display = 'inline-block';
    welcomeBanner.style.display = 'block';
    welcomeBanner.textContent = `Welcome back, ${user.name}!`;
    nameInput.style.display = 'none';
    passwordInput.style.display = 'none';
    showMessage('You are logged in.');
  }

  function setLoggedOut(){
    localStorage.removeItem('player');
    registerBtn.style.display = 'inline-block';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    goGameBtn.style.display = 'none';
    welcomeBanner.style.display = 'none';
    nameInput.style.display = 'block';
    passwordInput.style.display = 'block';
    nameInput.value = '';
    passwordInput.value = '';
    showMessage('Logged out. Please sign in or register.');
  }

  function checkLogged(){
    const u = localStorage.getItem('player');
    if (u){
      setLoggedIn(JSON.parse(u));
    } else {
      setLoggedOut();
    }
  }

  registerBtn.addEventListener('click', async ()=>{
  const name = nameInput.value;
  const password = passwordInput.value;
  if (!name) return showMessage('Enter a name', 'orange');
  if (!password) return showMessage('Enter a password', 'orange');
  const res = await fetch('/api/register', {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name, password})
  });
  if (res.ok){
    const user = await res.json();
    setLoggedIn(user);
  } else if (res.status === 409){
    showMessage('Name already exists', 'orange');
  } else {
    const err = await res.json().catch(()=>({error:'Unknown'}));
    showMessage(err.error || 'Register failed', 'red');
  }
});

loginBtn.addEventListener('click', async ()=>{
  const name = nameInput.value;
  const password = passwordInput.value;
  if (!name) return showMessage('Enter a name', 'orange');
  if (!password) return showMessage('Enter a password', 'orange');
  const res = await fetch('/api/login', {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name, password})
  });
  if (res.ok){
    const user = await res.json();
    setLoggedIn(user);
  } else if (res.status === 404 || res.status === 401){
    showMessage('Invalid name or password', 'orange');
  } else {
    const err = await res.json().catch(()=>({error:'Unknown'}));
    showMessage(err.error || 'Login failed', 'red');
  }
});

logoutBtn.addEventListener('click', ()=>{
  setLoggedOut();
});

goGameBtn.addEventListener('click', ()=>{
  // Show canvas and hide auth panel
  const authPanel = document.getElementById('authPanel');
  if (authPanel) authPanel.style.display = 'none';
  gameCanvas.style.display = 'block';
});

checkLogged();
});
