// Constants
// TODO: User must replace this with their actual LINE Channel ID
const LINE_CHANNEL_ID = 'YOUR_CHANNEL_ID_HERE';
const AUTH_API_URL = 'http://localhost:8086/api/v1/auth/line';

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const unauthView = document.getElementById('unauth-view');
const authView = document.getElementById('auth-view');
const userIdDisplay = document.getElementById('user-id-display');

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
  // Ensure elements exist before adding listeners (guard for partial load)
  if(loginBtn) loginBtn.addEventListener('click', handleLogin);
  if(logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  checkLoginStatus();
});

function checkLoginStatus() {
  chrome.storage.local.get('user_id', (result) => {
    // result might be empty if not found, or contain user_id
    if (result && result.user_id) {
      showAuthenticated(result.user_id);
    } else {
      showUnauthenticated();
    }
  });
}

function showAuthenticated(userId) {
  if(unauthView) unauthView.classList.add('hidden');
  if(authView) authView.classList.remove('hidden');
  if(userIdDisplay) userIdDisplay.textContent = userId;
}

function showUnauthenticated() {
  if(authView) authView.classList.add('hidden');
  if(unauthView) unauthView.classList.remove('hidden');
  if(userIdDisplay) userIdDisplay.textContent = '';
}

function handleLogin() {
  if (LINE_CHANNEL_ID === 'YOUR_CHANNEL_ID_HERE') {
    alert('Please set your LINE_CHANNEL_ID in popup.js');
    return;
  }

  const redirectUri = chrome.identity.getRedirectURL();
  const state = Math.random().toString(36).substring(7);
  const scope = 'profile openid';

  const authUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', LINE_CHANNEL_ID);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('scope', scope);

  console.log('Launching Web Auth Flow:', authUrl.toString());

  chrome.identity.launchWebAuthFlow(
    {
      url: authUrl.toString(),
      interactive: true
    },
    async (responseUrl) => {
      if (chrome.runtime.lastError) {
        console.error('Auth flow error:', chrome.runtime.lastError);
        alert('Login failed: ' + chrome.runtime.lastError.message);
        return;
      }

      if (responseUrl) {
        const url = new URL(responseUrl);
        const code = url.searchParams.get('code');

        if (code) {
          await exchangeCodeForUser(code, redirectUri);
        } else {
          console.error('No code found in response URL');
          alert('Login failed: No authorization code received.');
        }
      }
    }
  );
}

async function exchangeCodeForUser(code, redirectUri) {
  try {
    const response = await fetch(AUTH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: code,
        redirect_uri: redirectUri
      })
    });

    if (!response.ok) {
      throw new Error(`Auth API error: ${response.status}`);
    }

    const data = await response.json();

    // Assuming backend returns { user_id: "..." }
    if (data.user_id) {
      chrome.storage.local.set({ user_id: data.user_id }, () => {
        showAuthenticated(data.user_id);
      });
    } else {
      throw new Error('No user_id in response');
    }

  } catch (error) {
    console.error('Exchange code error:', error);
    alert('Failed to verify login with backend server.');
  }
}

function handleLogout() {
  chrome.storage.local.remove('user_id', () => {
    showUnauthenticated();
  });
}
