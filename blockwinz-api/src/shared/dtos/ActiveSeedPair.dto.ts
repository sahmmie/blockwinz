export class ActiveSeedPairDto {
  nonce: number;
  clientSeed: string;
  serverSeedHashed: string;
  futureClientSeed: string;
  futureServerSeedHashed: string;
}
