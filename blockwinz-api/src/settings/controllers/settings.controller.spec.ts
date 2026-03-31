import { Test, TestingModule } from '@nestjs/testing';
import { SettingsController } from './settings.controller';
import { SeedsRepository } from 'src/core/seeds /repositories/seeds.repository';
import { FavouriteRepository } from '../repositories/favourite.repository';
import { SettingRepository } from '../repositories/setting.repository';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';

describe('SettingsController', () => {
  let controller: SettingsController;

  const seedsRepository = {
    getPlayerActiveSeedData: jest.fn(),
    rotatePlayerSeed: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        { provide: SeedsRepository, useValue: seedsRepository },
        { provide: FavouriteRepository, useValue: {} },
        { provide: SettingRepository, useValue: {} },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(SettingsController);
  });

  it('userRotateSeed delegates to seed rotation repository method', async () => {
    const user = { _id: 'user-1', id: 'user-1' } as never;
    const response = {
      nonce: 0,
      clientSeed: 'client',
      serverSeedHashed: 'hash',
      futureClientSeed: 'future-client',
      futureServerSeedHashed: 'future-hash',
    };
    seedsRepository.rotatePlayerSeed.mockResolvedValue(response);

    const result = await controller.userRotateSeed(user);

    expect(seedsRepository.rotatePlayerSeed).toHaveBeenCalledWith(user);
    expect(result).toEqual(response);
  });
});
