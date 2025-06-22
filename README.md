## README.md

# curiosity-capture

![Curiosity Capture Banner](https://via.placeholder.com/800x200.png?text=Curiosity+Capture)

## 📖 Overview
**Curiosity Capture** is a Chrome Extension designed to track and analyze user browsing behavior to discover their interests. By capturing page content, scroll depth, and time spent, it helps build a personalized interest map for further AI-driven analysis.

## 🚀 Features
- Auto-detects page visits and captures URLs and titles
- Monitors time spent on pages
- Analyzes page content and extracts keywords
- Calculates scroll depth to estimate engagement
- Optionally sends data to external APIs for analysis
- Receives prompts from a local WebSocket server
- Plays VOICEVOX-generated audio prompts automatically
- Captures spoken replies with speech recognition

## 📦 Installation
1. Clone this repository.
2. Navigate to `chrome://extensions/`.
3. Enable "Developer mode".
4. Click "Load unpacked" and select the project directory.
5. Start browsing and see the data flow!

## 📡 API Example Payload
```json
{
  "user_id": "user-001",
  "session_id": "session-xyz",
  "url": "https://example.com/ai-trends",
  "title": "AIの未来",
  "visit_duration_sec": 300,
  "scroll_depth": 0.8,
  "keywords": ["AI", "Deep Learning", "未来"],
"search_query": "生成AIの将来性"
}
```

## 🖧 システム構成
The project is composed of several services managed by **docker-compose**:

- **ui**: the front-end user interface
- **api**: FastAPI backend that receives browsing data and pushes messages
- **voicevox**: text-to-speech engine used for all audio output
- **db**: PostgreSQL database storing collected information
- **rabbitmq**: message broker for background jobs

Browsing data flows from the extension to the API, is stored in the database and processed. When the API sends a prompt, it generates audio using VOICEVOX and returns the text and Base64-encoded audio over WebSocket.

Environment variables `VOICEVOX_URL`, `VOICEVOX_SPEAKER` and `VOICEVOX_SPEED` can be set in `.env`. Their defaults are `http://voicevox:50021`, `1` and `1.0` respectively.

## ブラウジング情報の送信
WebSocket messages now include an `audio` field containing the VOICEVOX-generated WAV data encoded as Base64. The Chrome extension decodes this string and plays the audio when the popup opens.

