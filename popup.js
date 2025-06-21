// Display message from WebSocket and handle audio playback and speech recognition

document.addEventListener('DOMContentLoaded', () => {
  const messageDiv = document.getElementById('message');
  const playBtn = document.getElementById('play');
  let messageText = '';

  chrome.storage.local.get('wsMessage', ({ wsMessage }) => {
    if (wsMessage && wsMessage.message) {
      messageText = wsMessage.message;
      messageDiv.textContent = messageText;
    }
  });

  playBtn.addEventListener('click', () => {
    if (!messageText) return;
    const utterance = new SpeechSynthesisUtterance(messageText);
    utterance.lang = 'ja-JP';
    utterance.onend = () => {
      startSpeechRecognition();
    };
    window.speechSynthesis.speak(utterance);
  });
});

function startSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('SpeechRecognition API not supported');
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = 'ja-JP';
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log('Voice Input:', transcript);
  };
  recognition.start();
}
