export enum ITechnology {
    VNC = 'VNC',
    WebRTC = 'WebRTC',
}

export enum IRole {
    Participant = 'Participant',
    Presenter = 'Presenter',
}

export interface IResponse {
    technology?: ITechnology;
    isConnected?: boolean;
    isMobile?: boolean;
    error?: string;
}

export interface IScreen {
    id: string;
    title: string;
}

export interface IWindow {
    id: string;
    title: string;
}