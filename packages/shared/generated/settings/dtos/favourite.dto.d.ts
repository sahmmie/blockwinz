import { UserDto } from 'src/shared/dtos/user.dto';
import { DbGameSchema } from '@blockwinz/shared';
declare class GameItemDto {
    game: DbGameSchema;
    addedAt: Date;
}
export declare class FavouriteDto {
    user: string | UserDto;
    games: GameItemDto[];
    createdAt?: Date;
    updatedAt?: Date;
}
export {};
//# sourceMappingURL=favourite.dto.d.ts.map