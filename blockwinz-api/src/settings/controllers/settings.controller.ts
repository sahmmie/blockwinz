import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SeedsRepository } from 'src/core/seeds /repositories/seeds.repository';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { ActiveSeedPairDto } from 'src/shared/dtos/ActiveSeedPair.dto';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { getProfileId } from 'src/shared/helpers/user.helper';
import { FavouriteDto } from '../dtos/favourite.dto';
import { FavouriteRepository } from '../repositories/favourite.repository';
import { DbGameSchema } from '@blockwinz/shared';
import { SettingRepository } from '../repositories/setting.repository';
import { ProfileDto } from 'src/shared/dtos/profile.dto';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';

@ApiTags('Settings')
@Controller('settings')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class SettingsController {
  constructor(
    private seedsRepository: SeedsRepository,
    private favouriteRepository: FavouriteRepository,
    private settingRepository: SettingRepository,
  ) {}

  @ApiResponse({
    type: ActiveSeedPairDto,
    status: 200,
  })
  @ApiOperation({ summary: 'Get player active seed data' })
  @ApiBearerAuth('JWT-auth')
  @Get('activeSeed')
  @HttpCode(200)
  /** Returns the currently active provably-fair seed pair for the authenticated player. */
  userActiveSeed(
    @CurrentUser() user: UserRequestI,
  ): Promise<ActiveSeedPairDto> {
    return this.seedsRepository.getPlayerActiveSeedData(user);
  }

  @ApiResponse({
    type: ActiveSeedPairDto,
    status: 200,
  })
  @ApiOperation({ summary: 'Rotate player seed' })
  @ApiBearerAuth('JWT-auth')
  @Post('rotateSeed')
  @HttpCode(200)
  /** Rotates the authenticated player's active seed pair and returns the replacement pair. */
  userRotateSeed(
    @CurrentUser() user: UserRequestI,
  ): Promise<ActiveSeedPairDto> {
    return this.seedsRepository.rotatePlayerSeed(user);
  }

  @Post('add-favourites')
  @HttpCode(200)
  @ApiOperation({ summary: 'Add game to favourites' })
  @ApiResponse({ type: FavouriteDto })
  @ApiBody({
    type: FavouriteDto,
    examples: {
      default: {
        value: {
          game: DbGameSchema.DiceGame,
        },
      },
    },
    description: 'Request body to add game to favourites',
  })
  async addToFavourites(
    @CurrentUser() user: UserRequestI,
    @Body() body: { game: DbGameSchema },
  ): Promise<FavouriteDto> {
    return this.favouriteRepository.addToFavourites(user._id, body.game);
  }

  @Delete('remove-favourites')
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove game from favourites' })
  @ApiResponse({ type: FavouriteDto })
  @ApiBody({
    type: FavouriteDto,
    examples: {
      default: {
        value: {
          game: DbGameSchema.DiceGame,
        },
      },
    },
    description: 'Request body to remove game from favourites',
  })
  async removeFromFavourites(
    @CurrentUser() user: UserRequestI,
    @Body() body: { game: string },
  ): Promise<FavouriteDto | null> {
    return this.favouriteRepository.removeFromFavourites(user._id, body.game);
  }

  @Get('my-favourites')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get user favourites' })
  @ApiResponse({ type: FavouriteDto })
  async getFavourites(
    @CurrentUser() user: UserRequestI,
  ): Promise<FavouriteDto | null> {
    return this.favouriteRepository.getUserFavourites(user._id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile settings' })
  @ApiBody({
    type: ProfileDto,
    examples: {
      default: {
        value: {
          isMuted: true,
        } as Partial<ProfileDto>,
      },
    },
  })
  async updateProfileSettings(
    @CurrentUser() user: UserRequestI,
    @Body()
    body: Partial<ProfileDto>,
  ) {
    return await this.settingRepository.updateProfileSetting(
      getProfileId(user.profile),
      body,
    );
  }
}
