import { Application } from 'pixi.js';
import { H, W, setAspectR } from './utils';
import { Coins } from './Coins';
import { BetStatus } from '@/shared/types/core';

export class GameRenderer {
    public app?: Application;
    public resizeCallback: () => void = () => {};
    public scale: number = 1;
    public coins: number;
    public min: number;
    public coinType: number;
    private coinsRenderer: Coins;

    constructor(coins: number, min: number, coinType: number) {
        this.coins = coins;
        this.min = min;
        this.coinType = coinType;
        this.coinsRenderer = new Coins(10, coins, min, coinType); // Assuming max coins is 10
    }

    public async setContainer(container: HTMLDivElement): Promise<void> {
        if (!this.app) {
            this.app = new Application();
            await this.app.init({
                autoDensity: true,
                resolution: 1,
                antialias: false,
                backgroundAlpha: 0,
                resizeTo: container,
                width: container.clientWidth,
                height: container.clientHeight,
            });
            this.app.ticker.add(this.gameLoop.bind(this));
            this.app.stage.addChild(this.coinsRenderer.getContainer());
        } else {
            this.app.resizeTo = container;
        }

        this.resizeCallback = () => {
            setAspectR(container);
            this.updateScale(container);
        };
        this.resizeCallback();
        window.addEventListener('resize', this.resizeCallback);
        container.appendChild(this.app.canvas);
    }

    private updateScale(container: HTMLDivElement) {
        const scaleX = container.clientWidth / W;
        const scaleY = container.clientHeight / H;
        this.scale = Math.min(scaleX, scaleY);
        if (this.app) {
            this.app.stage.scale.set(this.scale);
        }
    }

    public setOnResults(onResults: (results: number[], multiplier: number, status: BetStatus) => void) {
        this.coinsRenderer.onResults = onResults
    }

    public update(coins: number, min: number, coinType: number): void {
        if (this.coins === coins && this.min === min && this.coinType === coinType) return;
        this.coins = coins;
        this.min = min;
        this.coinType = coinType;
        this.coinsRenderer.updateCoins(coins, min, coinType);
    }

    public get(results: number[], multiplier: number, status: BetStatus) {
        this.coinsRenderer.flipCoins(results, multiplier, status);
    }

    public setTurbo(isTurbo: boolean) {
        this.coinsRenderer.setTurbo(isTurbo);
    }

    public startIdleToss(): void {
        this.coinsRenderer.startIdleToss();
    }

    public stopIdleToss(): void {
        this.coinsRenderer.stopIdleToss();
    }

    public gameLoop(): void {
    }

    public destroy(): void {
        window.removeEventListener('resize', this.resizeCallback);
        this.app?.destroy(true, {
            children: true,
            texture: true,
        });
    }
}

