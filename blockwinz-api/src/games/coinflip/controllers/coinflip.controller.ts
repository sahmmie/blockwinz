import { Controller } from '@nestjs/common';
import { CoinflipRepository } from '../repos/coinflip.repository';

@Controller('coinflip')
export class CoinflipController {
  constructor(private readonly coinflipRepository: CoinflipRepository) {}
}
