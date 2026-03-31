import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletRepository } from '../repositories/wallet.repository';
import { Currency, CHAIN } from '@blockwinz/shared';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';

describe('WalletController', () => {
  let controller: WalletController;
  const walletRepository = {
    getWalletAddresses: jest.fn(),
    getWalletBalances: jest.fn(),
    generateWalletAddresses: jest.fn(),
    convertToPublicWallet: jest.fn(),
    sendBwzToUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletRepository,
          useValue: walletRepository,
        },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WalletController>(WalletController);
  });

  it('generateWalletAddress returns only public wallet fields', async () => {
    const user = { _id: 'user-1', id: 'user-1' } as never;
    const internalWallets = [
      {
        _id: 'wallet-1',
        user: 'user-1',
        address: 'addr-1',
        privateKey: 'secret',
        publicKey: 'pub',
        currency: Currency.SOL,
        chain: CHAIN.SOLANA,
        onChainBalance: 0,
        appBalance: 10,
        pendingWithdrawal: 0,
        lockedInBets: 0,
        availableBalance: 10,
        syncedAt: new Date(),
      },
    ];
    const publicWallets = [
      {
        _id: 'wallet-1',
        user: 'user-1',
        address: 'addr-1',
        currency: Currency.SOL,
        chain: CHAIN.SOLANA,
        onChainBalance: 0,
        availableBalance: 10,
      },
    ];

    walletRepository.generateWalletAddresses.mockResolvedValue(internalWallets);
    walletRepository.convertToPublicWallet.mockReturnValue(publicWallets);

    const result = await controller.generateWalletAddress(user);

    expect(walletRepository.generateWalletAddresses).toHaveBeenCalledWith(user);
    expect(walletRepository.convertToPublicWallet).toHaveBeenCalledWith(
      internalWallets,
    );
    expect(result).toEqual(publicWallets);
    expect(result[0]).not.toHaveProperty('privateKey');
  });
});
