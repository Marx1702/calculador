// ============================
// Auth Module
// ============================

const API_BASE = window.location.origin;

// Check if already logged in
(function checkAuth() {
  const token = localStorage.getItem('token');
  if (token && window.location.pathname.includes('login')) {
    window.location.href = '/';
  }
})();

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const authError = document.getElementById('authError');

// Toggle between Login and Register
showRegisterLink?.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.remove('active');
  registerForm.classList.add('active');
  hideError();
});

showLoginLink?.addEventListener('click', (e) => {
  e.preventDefault();
  registerForm.classList.remove('active');
  loginForm.classList.add('active');
  hideError();
});

// Show error message
function showError(msg) {
  authError.textContent = msg;
  authError.style.display = 'block';
}

function hideError() {
  authError.style.display = 'none';
}

// Login
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn = document.getElementById('loginBtn');

  btn.textContent = 'Ingresando...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
    }

    // Store auth data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    // Redirect to dashboard
    window.location.href = '/';
  } catch (err) {
    showError(err.message);
  } finally {
    btn.textContent = 'Iniciar Sesión';
    btn.disabled = false;
  }
});

// Register
registerForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const nombre = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const btn = document.getElementById('registerBtn');

  btn.textContent = 'Creando cuenta...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error al registrarse');
    }

    // Store auth data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    // Redirect to dashboard
    window.location.href = '/';
  } catch (err) {
    showError(err.message);
  } finally {
    btn.textContent = 'Crear Cuenta';
    btn.disabled = false;
  }
});
