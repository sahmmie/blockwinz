export class FairLogicRequestDto {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
}

export class FairLogicGenerateFloatsDto extends FairLogicRequestDto {
  count: number;
  cursor: number;
}

export class FairLogicByteGeneratorDto {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  cursor: number;
}

export class FairLogicBytesToFloatsDto {
  bytes: number[];
}

export class FairLogicResponseDto {}
