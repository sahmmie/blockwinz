import { RoomType } from '@blockwinz/shared';
export declare class RoomDto {
    _id?: string;
    name: string;
    isActive: boolean;
    isPrivate: boolean;
    createdBy?: string;
    roomType: RoomType;
    members: Array<{
        user: string;
        canSend: boolean;
        isViewer: boolean;
        joinedAt: Date;
    }>;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class RoomMemberDto {
    user: string;
    canSend?: boolean;
    isViewer?: boolean;
}
export declare class CreateRoomDto {
    name: string;
    isPrivate?: boolean;
    members: RoomMemberDto[];
}
export declare class UpdateRoomDto {
    name?: string;
    isPrivate?: boolean;
    isActive?: boolean;
}
export declare class AddRoomMemberDto {
    userId: string;
    canSend?: boolean;
    isViewer?: boolean;
}
export declare class RoomInfo {
    _id: string;
    name: string;
    membersCount?: number;
    isPrivate?: boolean;
    isActive?: boolean;
    canSend?: boolean;
    onlineMembersCount?: number;
    isViewer?: boolean;
}
export {};
//# sourceMappingURL=room.dto.d.ts.map