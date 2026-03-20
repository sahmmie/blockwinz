export declare class SendMessageDto {
    roomName: string;
    content: string;
}
export declare class JoinRoomDto {
    roomName: string;
}
export declare class LeaveRoomDto {
    roomName: string;
}
export declare class MessageDto {
    _id?: string;
    userId: string;
    username: string;
    roomId: string;
    roomName: string;
    content: string;
    timestamp: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
//# sourceMappingURL=message.dto.d.ts.map