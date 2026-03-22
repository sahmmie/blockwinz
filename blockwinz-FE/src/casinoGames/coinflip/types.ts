import { BaseBetRequest, BaseBetResponse, GameState } from "@/shared/types/core"
import { BetStatus } from "@/shared/types/core"

export interface CoinFlipBetRequest extends BaseBetRequest {
    min: number
    coins: number
    coinType: number
}

export interface CoinFlipBetResponse extends BaseBetResponse {
    results: number[]
    multiplier: number
}

export interface Result {
    value: number
    uid: string
    clr: string
    fontClr: string
}

export interface CoinFlipGameState extends GameState {
    forceUpdater: string
    prevResults: Result[]
    status: BetStatus
}

export type Preset = {
    coins: number;
    min: number;
    mul: number;
};

export const presets: Preset[] = [
    { coins: 10, min: 5, mul: 1.58 },
    { coins: 1, min: 1, mul: 1.98 },
    { coins: 4, min: 3, mul: 3.16 },
    { coins: 6, min: 5, mul: 9.05 },
    { coins: 9, min: 8, mul: 50.68 },
    { coins: 10, min: 10, mul: 1013.76 },
];

export const getPresetLabel = (preset: Preset) => {
    return `${preset.coins}:${preset.min} (x${preset.mul.toFixed(2)})`;
};

/** Preset rows only (no “Custom” item — custom is implied when coins/min don’t match any preset). */
export const presetOptions = presets.map((preset) => ({
    value: `${preset.coins}:${preset.min}`,
    label: getPresetLabel(preset),
}));

export const findPreset = (coins: number, min: number): Preset | undefined => {
    return presets.find(preset => preset.coins === coins && preset.min === min);
};
