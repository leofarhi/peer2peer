import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../constants';

class SocketService {
    public socket: Socket | null = null;

    connect(token: string) {
        // Si déjà connecté, on ne fait rien pour éviter les doublons
        if (this.socket && this.socket.connected) return;

        this.socket = io(`${BASE_URL}/`, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log("🟢 Connected to Socket.io ID:", this.socket?.id);
        });

        this.socket.on('connect_error', (err) => {
            console.error("🔴 Connection Error:", err.message);
        });

        this.socket.on('disconnect', () => {
            console.log("🔴 Disconnected from Socket.io");
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Helper pour écouter
    on(event: string, callback: (data: any) => void) {
        this.socket?.on(event, callback);
    }

    // Helper pour arrêter d'écouter (CORRIGÉ)
    // On passe le callback pour ne retirer que LUI, et pas les autres listeners (ceux de App.tsx par ex)
    off(event: string, callback?: (data: any) => void) {
        if (this.socket) {
            if (callback) {
                this.socket.off(event, callback);
            } else {
                this.socket.off(event); // Fallback: retire tout si pas de callback fourni
            }
        }
    }

    emit(event: string, data: any) {
        this.socket?.emit(event, data);
    }
}

export const socketService = new SocketService();