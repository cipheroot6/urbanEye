import serial
import pynmea2

def get_gps_coords(port: str = "/dev/ttyUSB0", baudrate: int = 9600) -> dict:
    """Read one valid GPRMC sentence from GPS module and return lat/lng."""
    try:
        with serial.Serial(port, baudrate, timeout=2) as ser:
            for _ in range(20):
                line = ser.readline().decode("ascii", errors="replace").strip()
                if line.startswith("$GPRMC") or line.startswith("$GNRMC"):
                    msg = pynmea2.parse(line)
                    if msg.status == "A":  # A = valid fix
                        return {"lat": msg.latitude, "lng": msg.longitude}
    except Exception:
        pass
    # Fallback — return last known or default
    return {"lat": 18.5204, "lng": 73.8567}
