import { io, Socket } from 'socket.io-client';
import { SERVER_BASE_URL } from '@/shared/constants/app.constant';

type SocketError = Error & { message: string };

// Use "default" key internally to represent the root ("/") namespace
export const sockets: Record<string, Socket> = {};

/**
 * Get or create a socket instance for the given namespace.
 * If no namespace is provided, the root ("/") namespace is used.
 */
export function getSocket(namespace?: string, token?: string): Socket {
    const key = namespace || 'default';
    const fullUrl = namespace ? `${SERVER_BASE_URL}/${namespace}` : SERVER_BASE_URL;

    if (!sockets[key]) {
        const socket = io(fullUrl, {
            auth: token ? { token } : undefined,
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 3000,
        });

        setupEventListeners(socket, namespace || '/');
        sockets[key] = socket;
    }

    return sockets[key];
}

/**
 * Disconnect and remove a socket for a given namespace.
 */
export function disconnectSocket(namespace?: string): void {
    const key = namespace || 'default';

    if (sockets[key]) {
        sockets[key].disconnect();
        delete sockets[key];
    }
}

/**
 * Check if a socket is currently connected for a given namespace.
 */
export function isSocketConnected(namespace?: string): boolean {
    const key = namespace || 'default';
    return !!sockets[key]?.connected;
}

/**
 * Reconnect all existing sockets. Use `force = true` to force disconnect + reconnect.
 */
export function reconnectAllSockets(force: boolean = false): void {
    Object.entries(sockets).forEach(([namespace, socket]) => {
        if (force) {
            console.log(`Force reconnecting socket for namespace: ${namespace}`);
            socket.disconnect();
            socket.connect();
        } else if (!socket.connected) {
            console.log(`Reconnecting socket for namespace: ${namespace}`);
            socket.connect();
        }
    });
}

/**
 * Setup common event listeners for a socket instance.
 */
function setupEventListeners(socket: Socket, namespace: string): void {
    socket.on('connect', () => {
        console.log(`✅ Connected to namespace: ${namespace}`);
    });

    socket.on('disconnect', (reason: string) => {
        console.log(`⚠️ Socket disconnected from ${namespace}:`, reason);
    });

    socket.on('connect_error', (error: SocketError) => {
        console.error(`❌ Connection error on ${namespace}:`, error.message);
    });

    socket.on('error', (error: SocketError) => {
        console.error(`❌ Socket error on ${namespace}:`, error.message);
    });
}
