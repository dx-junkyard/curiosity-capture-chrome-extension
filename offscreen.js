let ws;

function connectWebSocket() {
  ws = new WebSocket('ws://localhost:5000/ws');

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      chrome.runtime.sendMessage({ type: 'wsMessage', data: message });
    } catch (e) {
      console.error('Invalid WebSocket message', e);
    }
  };

  ws.onclose = () => {
    setTimeout(connectWebSocket, 1000);
  };

  ws.onerror = () => {
    ws.close();
  };
}

connectWebSocket();
