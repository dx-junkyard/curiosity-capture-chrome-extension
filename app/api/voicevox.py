import os
import requests
from typing import Optional


def synthesize(text: str, base_url: str = None, speaker: Optional[int] = None, speed: Optional[float] = None) -> bytes:
    """Synthesize speech using VOICEVOX and return WAV bytes."""
    base_url = base_url or os.getenv("VOICEVOX_URL", "http://voicevox:50021")
    speaker = speaker or int(os.getenv("VOICEVOX_SPEAKER", "1"))
    speed = speed or float(os.getenv("VOICEVOX_SPEED", "1.0"))

    try:
        query_resp = requests.post(f"{base_url}/audio_query", params={"speaker": speaker}, json={"text": text})
        query_resp.raise_for_status()
        query = query_resp.json()
        query["speedScale"] = speed

        synth_resp = requests.post(
            f"{base_url}/synthesis",
            params={"speaker": speaker, "enable_interrogative_upspeak": True},
            json=query,
        )
        synth_resp.raise_for_status()
        return synth_resp.content
    except Exception as e:
        print(f"VOICEVOX synthesis error: {e}")
        return b""
