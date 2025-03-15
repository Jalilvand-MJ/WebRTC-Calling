export enum MessageType {
    hello,
    signal,
    bye,
    server
}

export enum SignalType {
    offer,
    answer,
    ice
}

export type Signal = {
    type: SignalType,
    data: any,
}

export type Message = 
{
    type: MessageType.signal,
    peerID: number,
    payload: Signal
} | {
    type: MessageType.hello | MessageType.bye,
    peerID: number,
} | {
    type: MessageType.server,
    payload: string
}