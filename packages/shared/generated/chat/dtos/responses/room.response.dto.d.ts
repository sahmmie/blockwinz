export declare class RoomMemberResponseDto {
    userId: string;
    canSend: boolean;
    isViewer: boolean;
}
export declare class RoomResponseDto {
    id: string;
    name: string;
    isPrivate: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    members: RoomMemberResponseDto[];
}
//# sourceMappingURL=room.response.dto.d.ts.map