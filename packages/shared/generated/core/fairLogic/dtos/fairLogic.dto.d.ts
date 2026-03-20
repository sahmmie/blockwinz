export declare class FairLogicRequestDto {
    serverSeed: string;
    clientSeed: string;
    nonce: number;
}
export declare class FairLogicGenerateFloatsDto extends FairLogicRequestDto {
    count: number;
    cursor: number;
}
export declare class FairLogicByteGeneratorDto {
    serverSeed: string;
    clientSeed: string;
    nonce: number;
    cursor: number;
}
export declare class FairLogicBytesToFloatsDto {
    bytes: number[];
}
export declare class FairLogicResponseDto {
}
//# sourceMappingURL=fairLogic.dto.d.ts.map