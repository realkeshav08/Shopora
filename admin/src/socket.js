import { io } from 'socket.io-client';

// One shared real-time socket for the whole admin panel. Pages import this and
// subscribe to events (products:updated / users:updated / orders:updated) to
// refresh their data live, without a page reload.
export const socket = io(import.meta.env.VITE_BACKEND_URL, {
  transports: ['websocket', 'polling'],
});
