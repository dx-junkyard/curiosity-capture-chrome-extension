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
- Speaks the prompt aloud using the Web Speech API
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

