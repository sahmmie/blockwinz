import { Assets, Container, Sprite, Texture } from 'pixi.js';
import { gsap } from 'gsap';
import { W, H } from './utils';
import { BetStatus } from '@/shared/types/core';
import goldTexture from '../../assets/gold.png';
import silverTexture from '../../assets/silver.png';

export class Coins {
    private container: Container;
    private coins: Sprite[][];
    private coinStates: number[];
    private currentCoins: number;
    private maxCoins: number;
    private goldTexture?: Texture;
    private silverTexture?: Texture;
    private min: number;
    private coinType: number;
    private flipSpeed = 0.3;
    private flipSpeedMul = 1;
    private positionSpeed = 0.5;
    private positionSpeedMul = 1;
    private gapFactor = 3.5;
    private scl = 0.5;
    public onResults: (results: number[], multiplier: number, status: BetStatus) => void;

    constructor(maxCoins: number, coins: number, min: number, coinType: number) {
        this.container = new Container();
        this.coins = [];
        this.coinStates = [];
        this.currentCoins = 0;
        this.maxCoins = maxCoins;
        this.min = min;
        this.coinType = coinType;
        this.onResults = () => { };

        (async () => {
            this.goldTexture = await Assets.load(goldTexture);
            this.silverTexture = await Assets.load(silverTexture);
            this.initializeCoins();
            this.updateCoins(coins, min, coinType);
        })();
    }

    public setTurbo(isTurbo: boolean) {
        this.flipSpeedMul = isTurbo ? 0.2 : 1;
        this.positionSpeedMul = isTurbo ? 0.2 : 1;
    }

    private initializeCoins() {
        for (let i = 0; i < this.maxCoins; i++) {
            const goldCoin = new Sprite(this.goldTexture);
            const silverCoin = new Sprite(this.silverTexture);
            goldCoin.scale.set(this.scl);
            silverCoin.scale.set(this.scl);
            goldCoin.anchor.set(0.5);
            silverCoin.anchor.set(0.5);
            goldCoin.visible = silverCoin.visible = false;
            goldCoin.alpha = silverCoin.alpha = 0;
            this.coins.push([goldCoin, silverCoin]);
            this.container.addChild(goldCoin, silverCoin);
        }
    }

    public setOnResults(onResults: (results: number[], multiplier: number, status: BetStatus) => void) {
        this.onResults = onResults;
    }

    public updateCoins(count: number, min: number, coinType: number) {
        const oldCoinStates = [...this.coinStates];
        const oldCurrentCoins = this.currentCoins;
        this.currentCoins = Math.min(count, this.maxCoins);
        this.min = min;
        this.coinType = coinType;

        // Adjust coinStates array
        this.coinStates = [];
        for (let i = 0; i < this.currentCoins; i++) {
            this.coinStates.push(i < this.min ? this.coinType : 1 - this.coinType);
        }

        // Hide coins that are no longer in use
        for (let i = this.currentCoins; i < this.maxCoins; i++) {
            const [goldCoin, silverCoin] = this.coins[i];
            goldCoin.visible = false;
            silverCoin.visible = false;
            goldCoin.alpha = silverCoin.alpha = 0;
        }

        // Initialize new coins (when currentCoins increased)
        for (let i = oldCurrentCoins; i < this.currentCoins; i++) {
            const [goldCoin, silverCoin] = this.coins[i];
            goldCoin.x = silverCoin.x = W / 2;
            goldCoin.y = silverCoin.y = H / 2;
            goldCoin.alpha = silverCoin.alpha = 0;
            goldCoin.scale.set(this.scl);
            silverCoin.scale.set(this.scl);
            // Set both coins to not visible initially
            goldCoin.visible = false;
            silverCoin.visible = false;
        }

        // Only flip coins if this is not the initial setup
        if (oldCoinStates.length > 0) {
            // Flip coins if their state has changed, only for existing coins
            const numCoinsToFlip = Math.min(oldCurrentCoins, this.currentCoins);
            for (let i = 0; i < numCoinsToFlip; i++) {
                if (oldCoinStates[i] !== this.coinStates[i]) {
                    this.flipCoin(i, this.coinStates[i]);
                }
            }
        }

        this.updateCoinVisibility();
    }

    private updateCoinVisibility() {
        for (let i = 0; i < this.currentCoins; i++) {
            const [goldCoin, silverCoin] = this.coins[i];
            const isGold = this.coinStates[i] === 0;
            const targetCoin = isGold ? goldCoin : silverCoin;

            targetCoin.visible = true;

            const [x, y] = this.calculatePosition(i);

            // If coin is new (alpha == 0), animate from center
            if (targetCoin.alpha === 0) {
                // New coin animation from center with opacity transition
                gsap.to(targetCoin, {
                    x,
                    y,
                    alpha: 1,
                    duration: this.positionSpeed * this.positionSpeedMul,
                    ease: 'power2.out',
                });
            } else {
                gsap.to(targetCoin, {
                    x,
                    y,
                    duration: this.positionSpeed * this.positionSpeedMul,
                    ease: 'power2.out',
                });
            }
        }
    }

    private calculatePosition(index: number): [number, number] {
        const coinSize = Math.min(W, H) * 0.1 * this.scl;
        const gap = coinSize * this.gapFactor;
        let numRows = 1;
        let coinsInFirstRow = this.currentCoins;
        let coinsInSecondRow = 0;

        if (this.currentCoins > 3) {
            numRows = 2;
            coinsInFirstRow = Math.ceil(this.currentCoins / 2);
            coinsInSecondRow = this.currentCoins - coinsInFirstRow;
        }

        const row = numRows === 1 ? 0 : Math.floor(index / coinsInFirstRow);
        const col = numRows === 1 ? index : index % coinsInFirstRow;
        const coinsInRow = row === 0 ? coinsInFirstRow : coinsInSecondRow;

        const totalWidth = coinsInRow * coinSize + (coinsInRow - 1) * gap;
        const startX = (W - totalWidth) / 2 + coinSize / 2;
        const startY = numRows === 1
            ? H / 2
            : H / 2 - (coinSize + gap) / 2 + row * (coinSize + gap);

        const x = startX + col * (coinSize + gap);
        const y = startY;

        return [x, y];
    }

    private flipCoin(index: number, state: number) {
        const [goldCoin, silverCoin] = this.coins[index];
        const targetCoin = state === 0 ? goldCoin : silverCoin;
        const hiddenCoin = state === 0 ? silverCoin : goldCoin;

        // Ensure both coins are visible for the flip animation
        hiddenCoin.visible = true;
        targetCoin.visible = true;

        // Reset scales before starting animation
        hiddenCoin.scale.set(this.scl, this.scl);
        targetCoin.scale.set(0, this.scl);

        // Ensure alpha is set correctly
        hiddenCoin.alpha = 1;
        targetCoin.alpha = 1;

        gsap.to(hiddenCoin.scale, {
            x: 0,
            duration: this.flipSpeed * this.flipSpeedMul,
            ease: 'power2.in',
            onComplete: () => {
                hiddenCoin.visible = false;
                hiddenCoin.scale.set(this.scl, this.scl); // Reset scale
                gsap.to(targetCoin.scale, {
                    x: this.scl,
                    duration: this.flipSpeed * this.flipSpeedMul,
                    ease: 'power2.out',
                });
            },
        });

        this.coinStates[index] = state;
    }

    public flipCoins(newStates: number[], multiplier: number, status: BetStatus) {
        // Update coinStates with new results
        const oldCoinStates = [...this.coinStates];
        this.coinStates = newStates.slice(0, this.currentCoins);

        // Update positions based on new states
        this.updateCoinVisibility(); // Recalculate positions

        newStates.forEach((state, index) => {
            if (index >= this.currentCoins) return;

            if (oldCoinStates[index] !== undefined && oldCoinStates[index] !== state) {
                this.flipCoin(index, state);
            } else if (oldCoinStates[index] === undefined) {
                // For new coins, ensure they are visible
                const [goldCoin, silverCoin] = this.coins[index];
                const targetCoin = state === 0 ? goldCoin : silverCoin;
                targetCoin.visible = true;
                targetCoin.alpha = 1;
                targetCoin.scale.set(this.scl);
            }
        });

        setTimeout(() => {
            this.onResults(newStates, multiplier, status)
        }, this.flipSpeed * this.flipSpeedMul * 2)
    }

    public getContainer(): Container {
        return this.container;
    }
}

