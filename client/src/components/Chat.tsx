import { useState } from "react";

type Props = {
    channel: RTCDataChannel
}

type ChatMessage = {
    direction: 'in' | 'out';
    text: string;
}

const Chat = ({ channel }: Props) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState("");

    channel.onmessage = (event) => {
        setMessages((prevMessages) => [...prevMessages, { direction: 'in', text: event.data }]);
    };

    const sendMessage = () => {
        if (channel && channel.readyState === "open") {
            channel.send(inputMessage);
            setMessages((prevMessages) => [...prevMessages, { direction: 'out', text: inputMessage }]);
            setInputMessage("");
        }
    };

    return (
        <div className="flex flex-col items-center p-2 space-y-2 rounded-lg overflow-hidden bg-gray-100">
            <div className="w-full border border-gray-300 rounded-md p-4 h-64 overflow-y-auto">
                {messages.map((msg, index) => (
                    <p key={index} className={`mb-2 ${msg.direction == 'out' && "text-blue-500"}`}>
                        {msg.text}
                    </p>
                ))}
            </div>
            <div className="flex w-full space-x-2">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type a message"
                    className="flex-grow border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default Chat