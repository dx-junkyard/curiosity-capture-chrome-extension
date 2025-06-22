import base64
from fastapi import FastAPI
from pydantic import BaseModel

from .voicevox import synthesize

app = FastAPI()

class Notification(BaseModel):
    message: str

@app.post("/notify")
def send_notification(notification: Notification):
    message = notification.message
    audio_bytes = synthesize(message)
    payload = {"message": message}
    if audio_bytes:
        payload["audio"] = base64.b64encode(audio_bytes).decode()
    return payload
