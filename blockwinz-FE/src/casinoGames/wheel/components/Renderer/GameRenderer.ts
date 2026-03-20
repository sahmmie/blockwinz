import { Application, Assets, Graphics, Sprite, Texture, Container, Text, TextStyle } from 'pixi.js';
import { H, W, setAspectR, darkenColor } from './utils';
import { ColorMul, wheelMuls } from '@/casinoGames/wheel/wheelMuls';
import logoPath from '@/assets/bw-dark-no-bg.png';
import thumbPath from '@/assets/icons/wheel-thumb-icon.png';

export class GameRenderer {
    public app?: Application;
    public resizeCallback: () => void = () => { };
    public scale: number = 1;
    public segments: number;
    public risk: string;
    public onMulEnter: (multiplier: number) => void;

    public wheelContainer = new Container();
    public wheelSegments = new Graphics();
    public bigStroke = new Graphics();
    public centerStroke = new Graphics();
    public smallStroke = new Graphics();

    private logoTexture?: Texture;
    private logoSprite?: Sprite;
    private thumbTexture?: Texture;
    private thumbSprite?: Sprite;
    private multiplierText?: Text;

    private defaultColor = '#151832';
    private isMobile: boolean;

    constructor(segments: number, risk: string, isMobile: boolean) {
        this.segments = segments;
        this.risk = risk;
        this.onMulEnter = () => { };
        this.isMobile = isMobile;
    }

    public async setContainer(container: HTMLDivElement): Promise<void> {
        if (!this.app) {
            this.app = new Application();
            await this.app?.init({
                autoDensity: true,
                resolution: 1,
                antialias: true,
                backgroundAlpha: 0,
                resizeTo: container,
                width: container.clientWidth,
                height: (container.clientWidth * 3) / 4,
            });

            this.app?.ticker.add(this.gameLoop.bind(this));

            this.wheelContainer = new Container();
            this.wheelSegments = new Graphics();
            this.bigStroke = new Graphics();
            this.centerStroke = new Graphics();
            this.smallStroke = new Graphics();

            this.bigStroke.zIndex = 1;
            this.wheelContainer.zIndex = 2;
            this.centerStroke.zIndex = 3;
            this.smallStroke.zIndex = 3;

            this.logoTexture = await Assets.load(logoPath);
            this.thumbTexture = await Assets.load(thumbPath);
            this.logoSprite = new Sprite(this.logoTexture);
            this.thumbSprite = new Sprite(this.thumbTexture);

            this.logoSprite.zIndex = 4;
            this.thumbSprite.zIndex = 5;

            this.app.stage.sortableChildren = true;

            await this.initializeStaticElements();
            this.drawWheelSegments();

            this.wheelContainer.addChild(this.wheelSegments);
            this.wheelContainer.addChild(this.bigStroke);
            this.app?.stage.addChild(this.wheelContainer);
        } else {
            this.app.resizeTo = container;
        }

        this.resizeCallback = () => {
            setAspectR(container);
            this.updateScale(container);
            // Redraw wheel with new size when screen size changes
            this.initializeStaticElements();
            this.drawWheelSegments();
        };

        this.resizeCallback();

        window.addEventListener('resize', this.resizeCallback);
        container.appendChild(this.app.canvas);
    }

    private updateScale(container: HTMLDivElement) {
        this.scale = Math.min(container.clientWidth / W, container.clientHeight / H);
        this.app?.stage.scale.set(this.scale);
    }

    private getWheelRadius(): number {
        const baseRadius = Math.min(W, H) * 0.4;

        // Reduce wheel size only for larger screens (desktop/tablet)
        if (!this.isMobile) {
            return baseRadius * 0.85; // 25% smaller for desktop/tablet
        }

        return baseRadius; // Keep original size for mobile
    }

    private async initializeStaticElements(): Promise<void> {
        const radius = this.getWheelRadius();
        const centerX = W / 2;
        const centerY = H / 2;
        const bigstrokeRadius = radius + 26;

        // // Draw the outer ring of the wheel (Use this if you want  a static outer ring)
        // this.bigStroke.circle(centerX, centerY, bigstrokeRadius).fill({ color: this.darkColor });
        // this.app?.stage.addChild(this.bigStroke);

        // Inner stroke
        const centerStrokeRadius = radius * 0.9;
        this.centerStroke.circle(centerX, centerY, centerStrokeRadius).fill({ color: this.defaultColor });
        this.app?.stage.addChild(this.centerStroke);

        // Inner stroke
        const smallStrokeRadius = radius * 0.36;
        this.smallStroke.circle(centerX, centerY, smallStrokeRadius).stroke({ width: 1, color: '#ECF0F1' });
        // If you want to add the small stroke, uncomment the line below
        // this.app?.stage.addChild(this.smallStroke);

        // Logo
        if (this.logoSprite) {
            this.logoSprite.anchor.set(0.5);
            const logoSize = radius * 1.0;
            this.logoSprite.width = logoSize;
            this.logoSprite.height = logoSize;
            this.logoSprite.rotation = (0 * Math.PI) / 360;
            this.logoSprite.position.set(centerX, centerY);
            this.logoSprite.alpha = 0.02; // Set the logo opacity
            this.logoSprite.interactive = false;

            this.app?.stage.addChild(this.logoSprite);
        }

        // Multiplier text (centered, above logo)
        if (!this.multiplierText) {
            const style = new TextStyle({
                fontSize: 32,
                fontWeight: 'bold',
                fill: '#FFFFFF',
                align: 'center',
            });
            this.multiplierText = new Text({ text: '', style });
            this.multiplierText.anchor.set(0.5);
            this.multiplierText.x = W / 2;
            this.multiplierText.y = H / 2;
            this.multiplierText.zIndex = 10;
            this.app?.stage.addChild(this.multiplierText);
        }

        if (this.thumbSprite) {
            // Now place the thumbSprite above the stroke
            this.thumbSprite.anchor.set(0.5);
            const thumbSize = bigstrokeRadius * 0.11;
            this.thumbSprite.width = thumbSize;
            this.thumbSprite.height = thumbSize / (this.thumbSprite.texture.width / this.thumbSprite.texture.height);
            this.thumbSprite.x = centerX;
            this.thumbSprite.y = (centerY - bigstrokeRadius - 10);

            // Add the thumbSprite on top of the stroke
            this.app?.stage.addChild(this.thumbSprite);
        }



        this.bigStroke.pivot.set(centerX, centerY);
        this.bigStroke.position.set(centerX, centerY);

        this.smallStroke.pivot.set(centerX, centerY);
        this.smallStroke.position.set(centerX, centerY);

        this.centerStroke.pivot.set(centerX, centerY);
        this.centerStroke.position.set(centerX, centerY);
    }

    private drawWheelSegments(): void {
        this.wheelSegments.clear();
        this.bigStroke.clear();
        const radius = this.getWheelRadius() * 1.025; // Slightly larger for segments
        const centerX = W / 2;
        const centerY = H / 2;
        const anglePerSegment = (2 * Math.PI) / this.segments;
        const mulsData = wheelMuls[this.risk][this.segments];
        const bigstrokeRadius = radius + 22;

        for (let i = 0; i < this.segments; i++) {
            const startAngle = i * anglePerSegment;
            const endAngle = (i + 1) * anglePerSegment;
            const mul = mulsData.muls[i];
            const colorMul: ColorMul = mulsData.colors.find(c => c.mul === mul) as ColorMul;
            const color = colorMul;

            this.wheelSegments.fill(color);
            this.wheelSegments.moveTo(centerX, centerY);
            this.wheelSegments.arc(centerX, centerY, radius, startAngle, endAngle);
            this.wheelSegments.lineTo(centerX, centerY);
            this.wheelSegments.fill();
            this.wheelSegments.zIndex = 4;
            this.wheelSegments.closePath();

            // Draw for the first segment which is the outer ring
            this.bigStroke.fill(darkenColor(color.color, 0.2));
            this.bigStroke.moveTo(centerX, centerY);
            this.bigStroke.arc(centerX, centerY, bigstrokeRadius, startAngle, endAngle);
            this.bigStroke.lineTo(centerX, centerY);
            this.bigStroke.fill();
            this.bigStroke.closePath();
        }

        this.wheelContainer.pivot.set(centerX, centerY);
        this.wheelContainer.position.set(centerX, centerY);
        this.wheelContainer.rotation = (-90 * Math.PI) / 180;
    }

    public setOnMulEnter(onMulEnter: (multiplier: number) => void) {
        this.onMulEnter = onMulEnter;
    }

    public update(segments: number, risk: string): void {
        if (this.segments === segments && this.risk === risk) return;
        this.segments = segments;
        this.risk = risk;
        this.drawWheelSegments();
    }

    private multiplier: number = -1;
    private isSpinning: boolean = false;
    private startAngle: number = 0;
    private goalAngle: number = 0;
    private spinStartTime: number = 0;
    private readonly spinDuration: number = 1500;
    private spinDurMul = 1
    private isTurbo = false

    public setTurbo(isTurbo: boolean) {
        this.spinDurMul = isTurbo ? 0.2 : 1;
        this.isTurbo = isTurbo
    }

    public spin(multiplier: number): void {
        if (this.isSpinning || multiplier === -1) return;
        // Clear multiplier text at the start of spin
        if (this.multiplierText) this.multiplierText.text = '';
        const segmentsData = wheelMuls[this.risk][this.segments];
        const matchingIndices = segmentsData.muls
            .map((mul, index) => (mul === multiplier ? index : -1))
            .filter(index => index !== -1);

        if (matchingIndices.length === 0) return;
        const randomIndex = this.segments - matchingIndices[Math.floor(Math.random() * matchingIndices.length)];
        this.multiplier = multiplier
        this.isSpinning = true;
        this.spinStartTime = Date.now();

        this.startAngle = ((this.wheelContainer.rotation * 180) / Math.PI) % 360;
        if (this.startAngle < 0)
            this.startAngle += 360;

        const segmentAngle = 360 / this.segments;

        const minL = 0.05 * segmentAngle
        const randomOffset = -(minL + (Math.random() * segmentAngle * 0.9));
        const targetSegmentAngle = randomIndex * segmentAngle + randomOffset - 90;

        const angleDifference = (targetSegmentAngle - this.startAngle + 360) % 360;

        if (this.thumbSprite !== undefined)
            this.thumbSprite.rotation = (-45 * Math.PI / 180);
        this.goalAngle = angleDifference + (this.isTurbo ? 360 : 720);
    }

    private animateMultiplierTextIn() {
        if (!this.multiplierText) return;
        this.multiplierText!.scale.set(0);
        this.multiplierText!.alpha = 0;
        const duration = 500; // ms
        const start = performance.now();
        const animate = (now: number) => {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - t, 3);
            this.multiplierText!.scale.set(ease);
            this.multiplierText!.alpha = ease;
            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                this.multiplierText!.scale.set(1);
                this.multiplierText!.alpha = 1;
            }
        };
        requestAnimationFrame(animate);
    }

    public gameLoop(): void {
        if (!this.isSpinning) return;
        const elapsedTime = Date.now() - this.spinStartTime;
        const progress = Math.min(elapsedTime / (this.spinDuration * this.spinDurMul), 1);
        const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
        const easedProgress = easeOut(progress);

        const currentAngle = (this.startAngle + this.goalAngle * easedProgress) % 360;

        this.wheelContainer.rotation = (currentAngle * Math.PI) / 180;

        if (this.thumbSprite !== undefined) {
            const startP = 0.45; // Progress when the thumb rotation starts
            const endP = 0.65;     // Progress when the thumb rotation finishes

            if (progress >= startP && progress <= endP) {
                const thumbProgress = (progress - startP) / (endP - startP); // Normalize progress between startP and endP
                this.thumbSprite.rotation = (1 - thumbProgress) * (-45 * Math.PI / 180); // Smoothly rotate from -45 to 0 degrees
            }
        }

        if (progress < 1) return
        this.isSpinning = false;
        // Show multiplier text and color after spin
        if (this.multiplierText) {
            const mulsData = wheelMuls[this.risk][this.segments];
            const colorMul = mulsData.colors.find(c => c.mul === this.multiplier);
            this.multiplierText.text = `${this.multiplier.toFixed(2)}x`;
            this.multiplierText.style.fill = colorMul?.color || '#FFFFFF';
            this.animateMultiplierTextIn();
        }
        this.onMulEnter(this.multiplier);
    }

    public destroy(): void {
        window.removeEventListener('resize', this.resizeCallback);
        this.app?.destroy({
            removeView: true,
        }, {
            children: true,
            texture: true,
            context: true,
        });
    }
}

