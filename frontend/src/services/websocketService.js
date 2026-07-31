import { io } from "socket.io-client";
import { SOCKET_URL } from "../redux/constants";

class WebSocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    if (this.socket && this.socket.connected) return;


  this.socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"], 
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });


    this.socket.on("connect", () => {
      console.log(`📡 WebSocket Connected. ID: ${this.socket.id}`);
      this.socket.emit("authenticate", userId);
    });

    this.socket.on("connect_error", (err) => {
      console.error("❌ Socket Connection Error:", err.message);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Socket Disconnected. Reason:", reason);
    });
  }

  onNotification(callback) {
    if (this.socket) {
      this.socket.off("new-notification");
      this.socket.on("new-notification", (data) => {
        callback(data);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("🛑 WebSocket Manually Disconnected");
    }
  }
}

export default new WebSocketService();
