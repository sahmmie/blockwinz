export interface RoomInfo {
    _id: string;
    name: string;
    isActive: boolean;
    isPrivate: boolean;
    membersCount: number;
    roomType: RoomType
    onlineMembersCount: number;
    canSend?: boolean;
    isViewer?: boolean;
}

export enum RoomType {
    CHAT = 'chat',
    LOBBY = 'lobby',
}