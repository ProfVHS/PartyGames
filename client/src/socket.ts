import { io } from "socket.io-client";

const serverUrl = import.meta.env.VITE_SERVER_URL;

export const socket = io(serverUrl!);
