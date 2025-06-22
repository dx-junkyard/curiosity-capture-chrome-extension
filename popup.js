// Display message from WebSocket and handle audio playback and speech recognition

document.addEventListener('DOMContentLoaded', () => {
  const messageDiv = document.getElementById('message');
  const playBtn = document.getElementById('play');
  const audio = document.getElementById('audio-player');
  let messageText = '';
  let audioSrc = '';

  function playMessage() {
    if (!audioSrc) return;
    audio.src = audioSrc;
    audio.play().catch(console.error);
  }

  audio.addEventListener('ended', () => {
    startSpeechRecognition();
    chrome.storage.local.remove('wsMessage');
    messageDiv.textContent = 'メッセージがありません';
    messageText = '';
    audioSrc = '';
  });

  chrome.storage.local.get('wsMessage', ({ wsMessage }) => {
    if (wsMessage) {
      if (wsMessage.message) {
        messageText = wsMessage.message;
        messageDiv.textContent = messageText;
      }
      if (wsMessage.audio) {
        audioSrc = 'data:audio/wav;base64,' + wsMessage.audio;
        playMessage();
      }
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
