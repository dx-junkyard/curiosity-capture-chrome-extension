// Display message from WebSocket and handle audio playback and speech recognition

document.addEventListener('DOMContentLoaded', () => {
  const messageDiv = document.getElementById('message');
  const playBtn = document.getElementById('play');
  const startBtn = document.getElementById('start-rec');
  const stopBtn = document.getElementById('stop-rec');
  const audio = document.getElementById('audio-player');
  let messageText = '';
  let audioSrc = '';
  startBtn.addEventListener('click', startSpeechRecognition);
  stopBtn.addEventListener('click', stopSpeechRecognition);

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

let recognition;
let recognizing = false;
let silenceTimer;
let collectedTranscript = '';

function resetSilenceTimer() {
  clearTimeout(silenceTimer);
  silenceTimer = setTimeout(() => {
    stopSpeechRecognition();
  }, 5000);
}

function processTranscript() {
  if (collectedTranscript) {
    console.log('Voice Input:', collectedTranscript);
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = collectedTranscript;
  }
  collectedTranscript = '';
}

function startSpeechRecognition() {
  if (recognizing) return;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('SpeechRecognition API not supported');
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = 'ja-JP';
  recognition.continuous = true;
  recognition.interimResults = false;
  collectedTranscript = '';
  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      collectedTranscript += event.results[i][0].transcript;
    }
    resetSilenceTimer();
  };
  recognition.onstart = () => {
    recognizing = true;
    resetSilenceTimer();
  };
  recognition.onerror = (e) => {
    console.error('Speech recognition error', e);
    stopSpeechRecognition();
  };
  recognition.onend = () => {
    recognizing = false;
    clearTimeout(silenceTimer);
    processTranscript();
  };
  recognition.start();
}

function stopSpeechRecognition() {
  if (recognizing && recognition) {
    recognition.stop();
  }
}
