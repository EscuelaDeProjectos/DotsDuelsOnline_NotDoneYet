// Simple auth frontend: register/login by name. Stores current user in localStorage.
const nameInput = document.getElementById('nameInput');
const passwordInput = document.getElementById('passwordInput');
const registerBtn = document.getElementById('registerBtn');
const loginBtn = document.getElementById('loginBtn');
const goGameBtn = document.getElementById('goGameBtn');
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
  goGameBtn.style.display = 'inline-block';
  showMessage('Logged in as ' + user.name);
}

function checkLogged(){
  const u = localStorage.getItem('player');
  if (u){
    setLoggedIn(JSON.parse(u));
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

goGameBtn.addEventListener('click', ()=>{
  // Show canvas and hide auth panel
  document.getElementById('authPanel').style.display = 'none';
  gameCanvas.style.display = 'block';
});

checkLogged();
