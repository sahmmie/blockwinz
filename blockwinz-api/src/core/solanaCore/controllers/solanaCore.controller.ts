import { Controller, UseGuards } from '@nestjs/common';
import { SolanaCoreRepository } from '../repositories/solanaCore.repository';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';

@ApiTags('Solana')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
@Controller('solana')
export class SolanaCoreController {
  constructor(private solanaCoreRepository: SolanaCoreRepository) {}

  // @Get()
  // async createSolWallet() {
  //     const to = '5XasF93T99NpNhsG9aUeQk7SngVocnyCR1P9z423srjf';
  //     // const fromSecretKey = '4d3c1f2b3a4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0';
  //     // const fromAddress = 'GVQVw1DPqXTvtt3BSqDWZFmsmSf69SMQ56f2Eop2E9sP';
  //     const amount = 1000;
  //     const res = await this.solanaCoreRepository.transferBwzToUserWallet(to, amount)
  //     console.log('====================================');
  //     console.log(await this.solanaCoreRepository.getBWZBalance(to));
  //     console.log('====================================');
  //     return res;
  // }
}
