// Display message from WebSocket and handle audio playback and speech recognition

document.addEventListener('DOMContentLoaded', () => {
  const messageDiv = document.getElementById('message');
  const playBtn = document.getElementById('play');
  let messageText = '';

  function playMessage() {
    if (!messageText) return;
    const utterance = new SpeechSynthesisUtterance(messageText);
    utterance.lang = 'ja-JP';
    utterance.onend = () => {
      startSpeechRecognition();
      chrome.storage.local.remove('wsMessage');
      messageDiv.textContent = 'メッセージがありません';
      messageText = '';
    };
    window.speechSynthesis.speak(utterance);
  }

  chrome.storage.local.get('wsMessage', ({ wsMessage }) => {
    if (wsMessage && wsMessage.message) {
      messageText = wsMessage.message;
      messageDiv.textContent = messageText;
      playMessage();
    }
  });

  playBtn.addEventListener('click', playMessage);
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
