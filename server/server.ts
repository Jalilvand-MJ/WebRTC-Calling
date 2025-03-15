import express from "express";
import { WebSocket, WebSocketServer } from "ws";
import { Message, MessageType } from "./types/Signal";

const STATIC_ROOT = process.env.STATIC_ROOT ?? './public'
const PORT = process.env.PORT ?? 80

const server = express()
    .use(express.static(STATIC_ROOT))
    .listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

const wss = new WebSocketServer({
    server,
    // perMessageDeflate: {
    //     zlibDeflateOptions: {
    //         // See zlib defaults.
    //         chunkSize: 1024,
    //         memLevel: 7,
    //         level: 3
    //     },
    //     zlibInflateOptions: {
    //         chunkSize: 10 * 1024
    //     },
    // }
});

type CliendHandle = {
    ws: WebSocket,
    id: number,
}

const clients = new Map<number, CliendHandle>();

wss.on('connection', (ws) => {
    const id = Date.now();
    clients.set(id, {
        ws,
        id
    });
    console.log('New client connected', id);

    clients.forEach(client => {
        if (client.ws == ws)
            return

        const m1 = {
            type:MessageType.hello,
            peerID: id,
        } as Message
        client.ws.send(JSON.stringify(m1))

        const m2 = {
            type:MessageType.hello,
            peerID: client.id,
        } as Message
        ws.send(JSON.stringify(m2))
    });

    ws.on('close', () => {
        clients.delete(id)
        clients.forEach(client => {
            const m1 = {
                type:MessageType.bye,
                peerID: id,
            } as Message
            client.ws.send(JSON.stringify(m1))
        })
        console.log('Client disconnected', id);
    });

    ws.on('message', (s: string) => {
        const message = JSON.parse(s) as Message
        if (message.type == MessageType.signal) {
            const trg = message.peerID;
            message.peerID = id;
            clients.get(trg)?.ws.send(JSON.stringify(message)) 
        }
        // clients.forEach(client => {
        //     if (client.ws == ws)
        //         return
        //     client.ws.send(String(s))
        // });
    });
});
