import { AuthenticationRepository } from './authentication.repository';
import { SeedStatus, UserAccountEnum } from '@blockwinz/shared';
import { UserDto } from 'src/shared/dtos/user.dto';

describe('AuthenticationRepository', () => {
  const buildRepository = () =>
    new AuthenticationRepository(
      {} as never,
      { get: jest.fn() } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

  it('findPublicUserWithProfile strips sensitive fields from the public response', async () => {
    const repository = buildRepository();
    const internalUser = {
      _id: 'user-1',
      id: 'user-1',
      username: 'demo_user',
      email: 'demo@example.com',
      password: 'hashed-password',
      userAccounts: [UserAccountEnum.USER],
      nonce: 7,
      faEnabled: false,
      futureClientSeed: 'client-seed',
      futureServerSeed: 'future-server-seed',
      futureServerSeedHash: 'future-server-hash',
      emailVerificationToken: 'verify-token',
      emailVerified: true,
      activeSeed: {
        _id: 'seed-1',
        id: 'seed-1',
        status: SeedStatus.ACTIVE,
        clientSeed: 'client-seed',
        serverSeed: 'plain-server-seed',
        serverSeedHash: 'server-seed-hash',
      },
      profile: {
        _id: 'profile-1',
        id: 'profile-1',
        user: 'user-1',
        canWithdraw: true,
        isMuted: false,
        isBanned: false,
        isTurbo: false,
      },
    } as UserDto;

    jest
      .spyOn(repository, 'findUserWithProfile')
      .mockResolvedValue(internalUser);

    const result = await repository.findPublicUserWithProfile('user-1');

    expect(result).toMatchObject({
      _id: 'user-1',
      username: 'demo_user',
      email: 'demo@example.com',
      futureClientSeed: 'client-seed',
      emailVerified: true,
    });
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('futureServerSeed');
    expect(result).not.toHaveProperty('futureServerSeedHash');
    expect(result).not.toHaveProperty('emailVerificationToken');
    expect(result.activeSeed).toMatchObject({
      _id: 'seed-1',
      clientSeed: 'client-seed',
      serverSeedHash: 'server-seed-hash',
    });
    expect(result.activeSeed).not.toHaveProperty('serverSeed');
  });
});
