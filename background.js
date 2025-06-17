// Receive page data from content scripts and forward to API
chrome.runtime.onMessage.addListener(async (data, sender) => {
  data.visit_start = new Date().toISOString();
  // 仮の滞在時間、終了時更新予定
  data.visit_end = new Date(Date.now() + 60000).toISOString();

  // IndexedDB保存（省略） or API送信
  fetch('http://localhost:8000/api/v1/user-actions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
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
