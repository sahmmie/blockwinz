import { Application, Graphics, Container } from 'pixi.js'
import {
  H,
  MAX_A,
  OBS_COLOR,
  W,
  ballR,
  createObstaclePositions,
  obstacleR,
  setAspectR,
  spacing,
} from './utils'
import LZString from 'lz-string'
import { SimulationManager } from './sim'
import { ballColors } from '../../clrs'
import { PathData } from '../../types'

export class GameRenderer {
  public simulation = false
  public app?: Application
  public simManager: SimulationManager

  public resizeCallback: () => void = () => {}

  public scale: number = 1

  public rows: number
  public risk: string

  public setBucketsContainerP: (newP: number) => void

  public onBallInBucket: (bucketIndex: number) => void

  public ballContainer: Container
  public obstacleContainer: Container
  public animContainer: Container

  private animPool: Graphics[] = []
  private activeAnims: Graphics[] = []

  private activeBalls: {
    graphics: Graphics
    positions: { x: number; y: number; action?: string }[]
    currentIndex: number
    bucketIndex: number
  }[] = []

  public paths: PathData = {}
  public pathsLoaded: boolean = false
  private pathsLoading: boolean = false

  constructor(rows: number, risk: string, setBucketsContainerP: (newP: number) => void) {
    this.risk = risk
    this.setBucketsContainerP = setBucketsContainerP
    this.onBallInBucket = () => {}

    this.ballContainer = new Container()
    this.animContainer = new Container()
    this.obstacleContainer = new Container()

    this.initializePools()

    this.updateGame(rows)
    this.rows = rows
    this.simManager = new SimulationManager(this, this.simulation)
    if (this.simulation) this.simManager.runSimulation().then(() => this.simManager.testPaths())
    
    // Load paths during initialization
    this.initializePaths()
  }

  private initializePools(): void {
    for (let i = 0; i < MAX_A; i++) {
      const anim = new Graphics()
      anim.visible = false
      this.animContainer.addChild(anim)
      this.animPool.push(anim)
    }
  }

  public createObstacles() {
    const obsPositions = createObstaclePositions(this.rows)
    this.obstacleContainer.removeChildren()

    obsPositions.forEach(({ x, y }) => {
      const graphics = new Graphics().circle(0, 0, obstacleR(this.rows)).fill(OBS_COLOR)
      graphics.x = x
      graphics.y = y
      this.obstacleContainer.addChild(graphics)
    })
  }

  public setOnBallInBucket(onBallInBucket: (bucketIndex: number) => void) {
    this.onBallInBucket = onBallInBucket
  }

  public async setContainer(container: HTMLDivElement): Promise<void> {
    if (!this.app) {
      this.app = new Application()
      await this.app.init({
        autoDensity: true,
        resolution: 1.25,
        backgroundAlpha: 0,
        resizeTo: container,
        width: container.clientWidth,
        height: (container.clientWidth * 3) / 4,
      })
      this.app?.stage.addChild(this.obstacleContainer, this.ballContainer, this.animContainer)

      this.app?.ticker.add(({ deltaMS }) => this.gameLoop(deltaMS))
    } else {
      this.app.resizeTo = container
    }

    this.resizeCallback = () => {
      setAspectR(container)
      this.updateScale(container)
      this.updateGame(this.rows)
    }

    this.resizeCallback()

    window.addEventListener('resize', this.resizeCallback)
    container.appendChild(this.app.canvas)
  }

  private updateScale(container: HTMLDivElement) {
    this.scale = Math.min(container.clientWidth / W, container.clientHeight / H)
    this.app?.stage.scale.set(this.scale)
  }

  public updateGame(rows: number): void {
    const newP = ((W - (rows + 1) * spacing(rows)) / 2) * this.scale
    if (newP !== 0) this.setBucketsContainerP(newP)
    if (this.rows === rows) return
    this.rows = rows
    this.createObstacles()
  }

  private async initializePaths(): Promise<void> {
    console.info('Loading game data...')
    await this.loadPaths()
    console.info('Finished loading game data')
  }

  private async loadPaths(): Promise<void> {
    if (this.pathsLoaded || this.pathsLoading) return
    
    this.pathsLoading = true
    try {
      const pathsModule = await import('../../paths.json')
      this.paths = pathsModule.default
      this.pathsLoaded = true
    } catch (error) {
      console.warn('Failed to load paths:', error)
      this.paths = {}
    } finally {
      this.pathsLoading = false
    }
  }

  public async createBall(bucketIndex: number): Promise<void> {
    // Ensure paths are loaded before creating ball
    if (!this.pathsLoaded) {
      await this.loadPaths()
    }

    const paths = this.paths[this.rows]?.[bucketIndex]
    if (!paths || paths.length === 0) {
      console.warn(`No paths found for rows=${this.rows}, bucket=${bucketIndex}`)
      return
    }
    
    const compressedPath = paths[Math.floor(Math.random() * paths.length)]
    const path = this.decompressPath(compressedPath)
    this.animateBallAlongPath(bucketIndex, path)
  }

  private decompressPath(compressed: string): { x: number; y: number; action?: string }[] {
    const decompressed = LZString.decompressFromBase64(compressed)
    if (!decompressed) return []
    return JSON.parse(decompressed)
  }

  private animateBallAlongPath(
    bucketIndex: number,
    positions: { x: number; y: number; action?: string }[]
  ): void {
    const graphics = new Graphics().circle(0, 0, ballR(this.rows)).fill(ballColors[this.risk])

    this.ballContainer.addChild(graphics)

    this.activeBalls.push({
      graphics,
      positions,
      currentIndex: 0,
      bucketIndex,
    })
  }

  private updateActiveBalls(deltaTime: number): void {
    const timePerFrame = 1000 / 55 // Approximately 16.67 ms per frame at 60 FPS

    for (let i = this.activeBalls.length - 1; i >= 0; i--) {
      const ball = this.activeBalls[i]

      let framesToAdvance: number
      if (deltaTime > timePerFrame) {
        // FPS is less than 60, catch up by advancing multiple path indices
        framesToAdvance = deltaTime / timePerFrame
      } else {
        // ~60 FPS: advance one path sample per tick
        framesToAdvance = 1
      }

      const previousIndex = ball.currentIndex
      ball.currentIndex += framesToAdvance

      const index = Math.floor(ball.currentIndex)

      if (index < ball.positions.length) {
        const currentPos = ball.positions[index]

        // Handle collision action
        if (currentPos.action === 'collision' && Math.floor(previousIndex) !== index) {
          this.createAnim(currentPos.x, currentPos.y)
          continue
        }

        if (deltaTime > timePerFrame) {
          // Interpolate positions when FPS is less than 60
          const t = ball.currentIndex - index
          const nextIndex = index + 1
          if (nextIndex < ball.positions.length) {
            const nextPos = ball.positions[nextIndex]
            const x = currentPos.x + (nextPos.x - currentPos.x) * t
            const y = currentPos.y + (nextPos.y - currentPos.y) * t
            ball.graphics.x = x
            ball.graphics.y = y
          } else {
            // No next position, set to current
            ball.graphics.x = currentPos.x
            ball.graphics.y = currentPos.y
          }
        } else {
          // FPS >= 60, set position directly
          ball.graphics.x = currentPos.x
          ball.graphics.y = currentPos.y
        }
      } else {
        // Animation complete
        this.ballContainer.removeChild(ball.graphics)
        this.onBallInBucket(ball.bucketIndex)
        this.activeBalls.splice(i, 1)
      }
    }
  }
  public createAnim(x: number, y: number): void {
    const availableAnim = this.animPool.find((anim) => !anim.visible)
    if (!availableAnim) return

    availableAnim.x = x
    availableAnim.y = y
    availableAnim.scale.set(1)
    availableAnim.alpha = 1
    availableAnim.clear().circle(0, 0, obstacleR(this.rows)).fill({ color: 0xffffff, alpha: 0.3 })
    availableAnim.visible = true

    this.activeAnims.push(availableAnim)
  }

  private gameLoop(deltaTime: number): void {
    this.updateActiveBalls(deltaTime)
    this.updateAnimations()
  }

  private updateAnimations(): void {
    for (let i = this.activeAnims.length - 1; i >= 0; i--) {
      const anim = this.activeAnims[i]
      anim.scale.x += 0.05
      anim.scale.y += 0.05
      anim.alpha -= 0.03
      if (anim.alpha <= 0) {
        anim.visible = false
        this.activeAnims.splice(i, 1)
      }
    }
  }

  public updateRisk(risk: string) {
    this.risk = risk
  }

  public destroy(): void {
    window.removeEventListener('resize', this.resizeCallback)

    this.app?.destroy(
      {
        removeView: true,
      },
      {
        children: true,
        texture: true,
        context: true,
      }
    )
  }
}
