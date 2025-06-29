let ws;

function connectWebSocket() {
  console.log('Connecting to WebSocket');
  ws = new WebSocket('ws://localhost:8086/ws');

  ws.onopen = () => {
    console.log('WebSocket connected');
  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('WebSocket message received', message);
      chrome.runtime.sendMessage({ type: 'wsMessage', data: message });
    } catch (e) {
      console.error('Invalid WebSocket message', e);
    }
  };

  ws.onclose = () => {
    console.warn('WebSocket closed; reconnecting...');
    setTimeout(connectWebSocket, 1000);
  };

  ws.onerror = (err) => {
    console.error('WebSocket error', err);
    ws.close();
  };
}

connectWebSocket();
