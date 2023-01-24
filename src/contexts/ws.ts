import { createContext } from "react";
import { io } from "socket.io-client";

const WS_URL = 'http://localhost:4000'

// only websocket connection
export const ws = io(WS_URL, {
    transports: ['websocket'],
})
export const SocketContext = createContext(ws)

