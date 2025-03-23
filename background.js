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
