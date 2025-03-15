import { useImperativeHandle, forwardRef, useState, useRef, useEffect } from 'react';
import { SignalType, type Signal } from '../../types/Signal';
import config from '../RTCconfig'
import Chat from './Chat';

type Props = {
    onSignal: (s: Signal) => unknown,
}

export type PeerRefType = {
    handleSignal: (s: Signal) => unknown
}

const Peer = forwardRef<PeerRefType, Props>((props, ref) => {
    const [streams, setStreams] = useState<Record<string, MediaStream>>({})
    const connectionRef = useRef<RTCPeerConnection>()
    const [chatChannelRef, setChatChannelRef] = useState<RTCDataChannel>()

    useEffect(() => {
        Promise.resolve().then(async () => {
            connectionRef.current = new RTCPeerConnection(config);
            const userMedia = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            userMedia.getTracks().forEach(t => connectionRef.current?.addTrack(t, userMedia));
            connectionRef.current.ontrack = e => {
                setStreams(currentStreams => {
                    const newStreams = { ...currentStreams }
                    e.streams.forEach(s => {
                        newStreams[s.id] = s
                    })
                    return newStreams
                })
            }
            connectionRef.current.onicecandidate = e => {
                if (e.candidate)
                    props.onSignal({
                        type: SignalType.ice,
                        data: e.candidate
                    })
            }
            connectionRef.current.ondatachannel = e => {
                console.log(e)
                setChatChannelRef(e.channel)
            }
        })
        return () => {
            connectionRef.current?.close();
        }
    }, [])

    useImperativeHandle(ref, () => ({
        handleSignal: async (s: Signal) => {
            if (!connectionRef.current) return;
            const obj = s.data;
            if (s.type == SignalType.offer) {
                await connectionRef.current.setRemoteDescription(obj);
                const answer = await connectionRef.current.createAnswer();
                connectionRef.current.setLocalDescription(answer);
                props.onSignal({
                    type: SignalType.answer,
                    data: answer
                });
            }
            else if (s.type == SignalType.answer) {
                await connectionRef.current.setRemoteDescription(obj);
            }
            else if (s.type == SignalType.ice) {
                await connectionRef.current.addIceCandidate(obj);
            }
        }
    }))

    const handleOffer = async () => {
        if (!connectionRef.current) return;
        setChatChannelRef(connectionRef.current.createDataChannel('chat', {}))
        const offer = await connectionRef.current.createOffer();
        await connectionRef.current.setLocalDescription(offer);
        props.onSignal({
            type: SignalType.offer,
            data: offer
        })
    };

    return (
        <div className='gap-2 flex flex-col'>
            {Object.keys(streams).length == 0 && <button className='bg-cyan-600 text-white rounded-sm px-3 py-2 mx-auto' onClick={handleOffer}>CONNECT</button>}
            {Object.keys(streams).map(id => (
                <div className='rounded-lg overflow-hidden bg-gray-900'>
                    <video className='max-h-screen m-auto' autoPlay key={id} ref={el => { if (el) el.srcObject = streams[id] }} />
                </div>
            ))}
            {chatChannelRef && <Chat channel={chatChannelRef} />}
        </div>
    );
});

export default Peer;
