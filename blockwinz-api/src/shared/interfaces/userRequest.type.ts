import { UserDto } from 'src/shared/dtos/user.dto';

/**
 * Type for the authenticated user attached to the request (e.g. by JWT middleware).
 * Use getUserId() from shared/helpers/user.helper to get the string id from a UserRequestI.
 */
export type UserRequestI = UserDto;
