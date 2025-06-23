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
let recorder;
let audioChunks = [];

function resetSilenceTimer() {
  clearTimeout(silenceTimer);
  silenceTimer = setTimeout(() => {
    stopSpeechRecognition();
  }, 5000);
}

function processTranscript() {
  collectedTranscript = '';
}

async function startSpeechRecognition() {
  if (recognizing) return;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('SpeechRecognition API not supported');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);
    audioChunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunks.push(e.data);
      }
    };
    recorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      sendAudioForTranscription(blob);
      stream.getTracks().forEach((t) => t.stop());
    };
    recorder.start();
  } catch (err) {
    console.error('Could not start media recording', err);
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
  if (recorder && recorder.state !== 'inactive') {
    recorder.stop();
  }
}

async function sendAudioForTranscription(blob) {
  const formData = new FormData();
  formData.append('file', blob, 'speech.webm');
  try {
    const resp = await fetch('http://localhost:8086/api/v1/transcribe', {
      method: 'POST',
      body: formData
    });
    const data = await resp.json();
    if (data.text) {
      const messageDiv = document.getElementById('message');
      messageDiv.textContent = data.text;
    }
  } catch (e) {
    console.error('Transcription request failed', e);
  }
}
