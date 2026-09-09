import os
import time
import httpx
from datetime import datetime, timezone
from dotenv import load_dotenv
from gps import get_gps_coords

load_dotenv()

INGEST_URL = os.environ["INGEST_URL"]
API_SECRET = os.environ["INGEST_API_SECRET"]
BUS_ID = os.environ["BUS_ID"]

def send_payload(detections: list[dict]) -> bool:
    """Package detections and POST to central ingest API."""
    if not detections:
        return False

    payload = {
        "bus_id": BUS_ID,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "gps": get_gps_coords(),
        "detections": detections,
    }

    try:
        response = httpx.post(
            INGEST_URL,
            json=payload,
            headers={"x-api-secret": API_SECRET},
            timeout=5.0,
        )
        response.raise_for_status()
        print(f"[OK] Sent {len(detections)} detections")
        return True
    except Exception as e:
        print(f"[ERR] Failed to send: {e}")
        return False


def format_detection(
    det_type: str,
    confidence: float,
    camera: str,
    bbox: list,
    plate: str | None = None,
    plate_confidence: float | None = None,
    crop_b64: str | None = None,
) -> dict:
    """Helper for the CV pipeline to build a detection dict."""
    d: dict = {
        "type": det_type,
        "confidence": confidence,
        "camera": camera,
        "bbox": bbox,
    }
    if plate:
        d["plate"] = plate
    if plate_confidence is not None:
        d["plate_confidence"] = plate_confidence
    if crop_b64:
        d["crop_b64"] = crop_b64
    return d


# ── Integration point ──────────────────────────────────────────────────────────
# The CV pipeline (YOLOv8 + PaddleOCR) calls collect_and_send() once per frame
# batch, passing a list of detections built with format_detection() above.

def collect_and_send(detections: list[dict]):
    """Called by CV pipeline. Batches and sends."""
    send_payload(detections)


if __name__ == "__main__":
    # Smoke test — send a synthetic detection
    test = [format_detection("pothole", 0.91, "front", [120, 340, 280, 420])]
    send_payload(test)
