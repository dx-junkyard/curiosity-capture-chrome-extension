// Display message from WebSocket and handle audio playback and speech recognition

document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup DOMContentLoaded');
  const messageDiv = document.getElementById('message');
  const playBtn = document.getElementById('play');
  const startBtn = document.getElementById('start-rec');
  const stopBtn = document.getElementById('stop-rec');
  const audio = document.getElementById('audio-player');
  let messageText = '';
  let audioSrc = '';
  startBtn.addEventListener('click', () => {
    console.log('音声入力開始ボタンが押されました');
    startSpeechRecognition();
  });
  stopBtn.addEventListener('click', () => {
    console.log('終了ボタンが押されました');
    stopSpeechRecognition();
  });

  function playMessage() {
    if (!audioSrc) {
      console.warn('音声データが見つからないため再生をスキップします');
      return;
    }
    console.log('メッセージ音声を再生します');
    audio.src = audioSrc;
    audio.play().catch((err) => {
      console.error('音声の再生に失敗しました', err);
    });
  }

  audio.addEventListener('ended', () => {
    console.log('音声再生が終了しました。音声入力を開始します');
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
        console.log('WebSocketメッセージを取得:', messageText);
        messageDiv.textContent = messageText;
      }
      if (wsMessage.audio) {
        audioSrc = 'data:audio/wav;base64,' + wsMessage.audio;
        console.log('音声データを取得しました');
        playMessage();
      }
    } else {
      console.log('保存されたメッセージはありません');
    }
  });

  playBtn.addEventListener('click', () => {
    console.log('再生ボタンが押されました');
    playMessage();
  });
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
    console.log('5秒間入力がないため録音を停止します');
    stopSpeechRecognition();
  }, 5000);
}

function processTranscript() {
  if (collectedTranscript) {
    console.log('音声認識結果:', collectedTranscript);
  } else {
    console.log('認識結果は空です');
  }
  collectedTranscript = '';
}

async function startSpeechRecognition() {
  if (recognizing) {
    console.log('既に音声認識が実行中です');
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('SpeechRecognition API not supported');
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    console.error('getUserMedia がサポートされていません');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('マイク入力を開始します');
    recorder = new MediaRecorder(stream);
    audioChunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunks.push(e.data);
      }
    };
    recorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      console.log('録音を終了。サーバーへ送信します');
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
    console.log('音声入力を取得:', collectedTranscript);
    resetSilenceTimer();
  };
  recognition.onstart = () => {
    recognizing = true;
    console.log('音声認識を開始しました');
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
    console.log('音声認識が終了しました');
  };
  console.log('SpeechRecognition を開始します');
  recognition.start();
}

function stopSpeechRecognition() {
  if (recognizing && recognition) {
    console.log('音声認識を停止します');
    recognition.stop();
  }
  if (recorder && recorder.state !== 'inactive') {
    console.log('録音を停止します');
    recorder.stop();
  }
}

async function sendAudioForTranscription(blob) {
  const formData = new FormData();
  formData.append('file', blob, 'speech.webm');
  try {
    console.log('音声データをサーバーへ送信します');
    const resp = await fetch('http://localhost:8086/api/v1/transcribe', {
      method: 'POST',
      body: formData
    });
    console.log('Transcription response status', resp.status);
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }
    const data = await resp.json();
    if (data.text) {
      const messageDiv = document.getElementById('message');
      messageDiv.textContent = data.text;
      console.log('文字起こし結果を受信:', data.text);
    } else {
      console.log('文字起こし結果がありません');
    }
  } catch (e) {
    console.error('Transcription request failed', e);
  }
}
