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
    private readonly gameLoopBound: () => void;
    /** Set as soon as teardown begins so async `setContainer` can bail without racing renders. */
    private destroyed = false;

    constructor(coins: number, min: number, coinType: number) {
        this.coins = coins;
        this.min = min;
        this.coinType = coinType;
        this.coinsRenderer = new Coins(10, coins, min, coinType); // Assuming max coins is 10
        this.gameLoopBound = this.gameLoop.bind(this);
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
                /** Dedicated ticker so verify-modal teardown never stops the main game’s loop. */
                sharedTicker: false,
            });
            if (this.destroyed) {
                this.tearDownPixiApplication();
                return;
            }
            this.app.ticker.add(this.gameLoopBound);
            this.app.stage.addChild(this.coinsRenderer.getContainer());
        } else {
            this.app.resizeTo = container;
        }

        await this.coinsRenderer.ready;
        if (this.destroyed) return;

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
        void this.coinsRenderer.ready.then(() => {
            this.coinsRenderer.updateCoins(coins, min, coinType);
        });
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

    /**
     * Stops rendering, removes the coin scene from the stage, then destroys the app.
     * Order matters: the WebGL batcher must not run another frame while children are mid-teardown.
     */
    private tearDownPixiApplication(): void {
        const app = this.app;
        this.app = undefined;
        if (!app) return;

        try {
            app.ticker.stop();
        } catch {
            /* noop */
        }

        try {
            app.ticker.remove(this.gameLoopBound);
        } catch {
            /* noop */
        }

        const coinsRoot = this.coinsRenderer.getContainer();
        try {
            coinsRoot.parent?.removeChild(coinsRoot);
            coinsRoot.destroy({
                children: true,
                texture: false,
                textureSource: false,
            });
        } catch {
            /* noop */
        }

        // Pixi v8 ResizePlugin: detach resize target first or destroy() can throw
        // ("this._cancelResize is not a function").
        try {
            (app as { resizeTo: Window | HTMLElement | null }).resizeTo = null;
        } catch {
            /* noop */
        }

        try {
            app.cancelResize();
        } catch {
            /* ResizePlugin may be partially torn down */
        }

        try {
            app.destroy(true, {
                children: true,
                texture: false,
                textureSource: false,
            });
        } catch {
            /* e.g. init still in flight on unmount */
        }
    }

    public destroy(): void {
        if (this.destroyed) return;
        this.destroyed = true;
        window.removeEventListener('resize', this.resizeCallback);
        this.coinsRenderer.dispose();
        this.tearDownPixiApplication();
    }
}

