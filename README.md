## README.md

# curiosity-capture

![Curiosity Capture Banner](https://via.placeholder.com/800x200.png?text=Curiosity+Capture)

## 📖 Overview
**Curiosity Capture** is a Chrome Extension designed to silently track and analyze user browsing behavior to discover their interests. By capturing page content, scroll depth, and time spent, it sends data to a backend for analysis.

## 🚀 Features
- Auto-detects page visits and captures URLs and titles
- Analyzes page content and extracts main text
- Calculates scroll depth to estimate engagement
- Sends data to a local backend API
- Authentication via LINE Login

## ⚠️ Configuration Required
Before installing, you **must** configure your LINE Channel ID in `popup.js`:
```javascript
const LINE_CHANNEL_ID = 'YOUR_CHANNEL_ID_HERE'; // Replace with your actual Channel ID
```
You also need a backend server running at `http://localhost:8086`.

## 📦 Installation
1. Clone this repository.
2. Edit `popup.js` to add your LINE Channel ID.
3. Navigate to `chrome://extensions/`.
4. Enable "Developer mode".
5. Click "Load unpacked" and select the project directory.
6. Click the extension icon and log in with LINE.

## 📡 API Payload (Sent to Backend)
The extension sends a POST request to `/api/v1/webhook/capture` with:
```json
{
  "user_id": "line-user-id",
  "url": "https://example.com/page",
  "title": "Page Title",
  "content": "Main extracted text content...",
  "screenshot_url": null
}
```
