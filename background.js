// Receive page data from content scripts and forward to API
chrome.runtime.onMessage.addListener(async (data, sender) => {
  console.log('received page data', data);
  data.visit_start = new Date().toISOString();
  data.visit_end = new Date(Date.now() + 60000).toISOString();
  try {
    const resp = await fetch('http://localhost:8086/api/v1/user-actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!resp.ok) {
      console.error('API request failed', resp.status);
    }
  } catch (err) {
    console.error('Failed to send data to API', err);
  }
});

// --- WebSocket handling via offscreen document ---
async function ensureOffscreen() {
  const exists = await chrome.offscreen.hasDocument?.();
  if (!exists) {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['DOM_PARSER'],
      justification: 'Keep WebSocket connection alive'
    });
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'wsMessage') {
    chrome.storage.local.set({ wsMessage: msg.data }, () => {
      chrome.action.openPopup();
    });
  }
});

ensureOffscreen();
