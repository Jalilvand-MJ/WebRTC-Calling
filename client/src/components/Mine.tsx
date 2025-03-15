import { useState, useEffect } from 'react';

const Peer = () => {
    const [streams, setStreams] = useState<MediaStream[]>([])

    const createConnection = async () => {
        const userMedia = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        setStreams([userMedia]);
    }

    useEffect(() => {
        createConnection()
    }, [])

    return (
        <div className='gap-2 flex flex-col'>
            {streams.map((v, i) => (
                <div className='rounded-lg overflow-hidden bg-gray-900'>
                    <video className='max-h-screen m-auto' autoPlay key={i} ref={el => { if (el) el.srcObject = v }} />
                </div>
            ))}
        </div>
    );
};

export default Peer;
