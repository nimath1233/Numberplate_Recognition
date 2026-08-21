from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from websocket_manager import ws_manager
from datetime import datetime

router = APIRouter(
    prefix="/ws",
    tags=["WebSockets"]
)

@router.websocket("/live")
async def websocket_live_endpoint(websocket: WebSocket):
    """
    Live WebSocket endpoint for ANPR events (detections, alerts, parking updates).
    Connect from frontend via: ws://<server-ip>:8000/ws/live
    """
    await ws_manager.connect(websocket)
    try:
        # Send an immediate connection welcome message
        await websocket.send_json({
            "event": "CONNECTED",
            "message": "Connected to ANPR Live Stream",
            "timestamp": datetime.now().isoformat()
        })
        
        while True:
            # Keep the socket open and receive any client ping/messages
            data = await websocket.receive_text()
            # Respond to client ping heartbeat
            if data == "ping":
                await websocket.send_json({"event": "PONG", "timestamp": datetime.now().isoformat()})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        ws_manager.disconnect(websocket)

@router.post("/test-broadcast")
async def test_broadcast_event(message: str = "Test plate detection event"):
    """
    Test endpoint to simulate broadcasting a live event without AI.
    """
    payload = {
        "event": "DETECTION_ALERT",
        "data": {
            "plate_number": "ABC-9999",
            "status": "Allowed",
            "parking_slot": "A-01",
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
    }
    await ws_manager.broadcast(payload)
    return {"status": "broadcast_sent", "active_clients": len(ws_manager.active_connections), "payload": payload}
