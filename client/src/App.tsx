import { useEffect, useRef, useState } from 'react'
import Peer, { PeerRefType } from './components/Peer'
import Mine from './components/Mine';
import { MessageType, type Message, type Signal } from '../types/Signal';

function App() {
    const [peerIDs, setPeerIDs] = useState<number[]>([])
    const peerEls = useRef<Record<number, PeerRefType>>({});
    const socketRef = useRef<WebSocket>()

    useEffect(() => {
        socketRef.current = new WebSocket("");
        socketRef.current.onmessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data) as Message;
            if (message.type == MessageType.hello) {
                setPeerIDs(currentPeerIDs => [...currentPeerIDs, message.peerID])
            } else if (message.type == MessageType.bye) {
                setPeerIDs(currentPeerIDs => currentPeerIDs.filter(id => id != message.peerID))
            } else if (message.type == MessageType.signal) {
                peerEls.current[message.peerID]?.handleSignal(message.payload)
            }
        }
        return () => {
            socketRef.current?.close();
        }
    }, [])

    const handleSendSignal = (t: number) => (s: Signal) => {
        socketRef.current?.send(JSON.stringify({
            type: MessageType.signal,
            peerID: t,
            payload: s
        } as Message))
    }

    return (
        <div className='bg-black h-screen grid grid-cols-1 md:grid-cols-2 p-2 gap-2'>
            {peerIDs.map(id => (
                <Peer
                    ref={el => {
                        if (el) peerEls.current[id] = el
                        else delete peerEls.current[id]
                    }}
                    onSignal={handleSendSignal(id)} />
            ))}
            <Mine />
        </div>
    );
}

export default App
