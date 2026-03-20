import { Engine, World, Bodies, Body, Events, IEventCollision, Runner } from 'matter-js'
import { GameRenderer } from './GameRenderer'
import {
  SCL,
  DEF_BALL,
  delay,
  SIM_SETTINGS,
  spacing,
  obstacleR,
  ballR,
  lastRowX,
  lastRowY,
  createObstaclePositions,
  DEF_OBS,
  W,
} from './utils'
import { Graphics } from 'pixi.js'
import LZString from 'lz-string'
import { PathData } from '../../types'

export class SimulationManager {
  private engine?: Engine
  private runner?: Runner
  private renderer?: GameRenderer
  public paths: PathData = {}

  private balls: {
    body: Body
    positions: { x: number; y: number; action?: string }[]
    graphics: Graphics
  }[] = []

  private rows: number = 8

  constructor(renderer: GameRenderer, isRunning: boolean = true) {
    if (!isRunning) return

    this.renderer = renderer

    this.engine = Engine.create({
      gravity: { y: 1.20 * SCL },
      positionIterations: 10,
      velocityIterations: 8,
      constraintIterations: 2,
    })

    Events.on(this.engine, 'collisionStart', this.handleCollision.bind(this))
    Events.on(this.engine, 'afterUpdate', this.updateBalls.bind(this))

    this.runner = Runner.create({
      isFixed: true,
      delta: 1000 / 60,
    })
  }

  private createObstacles(rows: number) {
    this.renderer?.createObstacles()

    const obsPositions = createObstaclePositions(rows)

    if (this.engine) World.clear(this.engine.world, false)

    obsPositions.forEach(({ x, y }) => {
      const body = Bodies.circle(x, y, obstacleR(rows), DEF_OBS)
      if (this.engine) World.add(this.engine.world, body)
    })
  }

  public async runSimulation() {
    if (this.runner && this.engine) Runner.run(this.runner, this.engine)

    for (let rows = 8; rows <= 16; rows++) {
      this.rows = rows
      this.paths[rows] = {}

      this.renderer?.updateGame(rows)
      this.createObstacles(rows)

      await this.simulateForRows(rows)
    }

    if (this.runner) Runner.stop(this.runner)

    console.info('Simulation completed.')
    // Convert paths to JSON string
    const jsonPaths = JSON.stringify(this.paths, null, 2)
    console.info(jsonPaths)
    
    // You can save this to a file or use it as needed
    return jsonPaths
  }

  private async simulateForRows(rows: number) {
    for (let i = 0; i <= rows; i++) this.paths[rows][i] = []

    let completed = false

    const checkCompletion = () => {
      const allBucketsFilled = Object.values(this.paths[rows]).every(
        (pathsArray) => pathsArray.length >= SIM_SETTINGS.MIN_PATHS
      )
      if (allBucketsFilled) {
        completed = true
      }
    }

    const spawnBall = async () => {
      if (completed) return
      const startX = this.getRandomStartX(rows)
      this.createBall(startX)
      await delay(SIM_SETTINGS.BALL_SPAWN_DELAY)
      checkCompletion()
      if (!completed) {
        spawnBall()
      }
    }

    spawnBall()

    return new Promise<void>((resolve) => {
      const check = () => {
        if (completed) {
          this.clearBalls()
          resolve()
        } else {
          setTimeout(check, 100)
        }
      }
      check()
    })
  }

  private getRandomStartX(rows: number): number {
    return parseFloat((W / 2 + (Math.random() - 0.5) * spacing(rows) * 3).toFixed(2))
  }

  private createBall(startX: number) {
    const startY = 0

    const body = Bodies.circle(startX, startY, ballR(this.rows), DEF_BALL)
    body.label = 'ball'

    const positions: { x: number; y: number; action?: string }[] = []

    if (this.engine) World.add(this.engine.world, body)

    const graphics = new Graphics().circle(0, 0, ballR(this.rows)).fill('#ff0000')
    graphics.x = startX
    graphics.y = startY

    this.renderer?.ballContainer.addChild(graphics)

    this.balls.push({ body, positions, graphics })
  }

  private updateBalls() {
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i]
      const { body, positions, graphics } = ball

      positions.push({ x: body.position.x, y: body.position.y })

      graphics.x = body.position.x
      graphics.y = body.position.y

      if (body.position.y >= lastRowY(this.rows) + obstacleR(this.rows)) {
        let bucket = -1
        if (
          body.position.x >= lastRowX(this.rows) &&
          body.position.x <= lastRowX(this.rows) + (this.rows + 1) * spacing(this.rows)
        ) {
          bucket = Math.floor((body.position.x - lastRowX(this.rows)) / spacing(this.rows))
        }

        if (bucket !== -1) {
          if (!this.paths[this.rows][bucket]) {
            this.paths[this.rows][bucket] = []
          }
          
          // Optimize path data before compression
          const optimizedPositions = positions
            .filter((_, i) => i % SIM_SETTINGS.SAMPLE_INTERVAL === 0) // Sample every Nth frame
            .map(pos => ({
              x: Math.round(pos.x * SIM_SETTINGS.QUANT_FACTOR) / SIM_SETTINGS.QUANT_FACTOR,
              y: Math.round(pos.y * SIM_SETTINGS.QUANT_FACTOR) / SIM_SETTINGS.QUANT_FACTOR,
              action: pos.action
            }))
          
          // Ensure collision points are preserved even if they were filtered out
          const collisionPoints = positions.filter(pos => pos.action === 'collision')
          collisionPoints.forEach(collision => {
            const optimizedCollision = {
              x: Math.round(collision.x * SIM_SETTINGS.QUANT_FACTOR) / SIM_SETTINGS.QUANT_FACTOR,
              y: Math.round(collision.y * SIM_SETTINGS.QUANT_FACTOR) / SIM_SETTINGS.QUANT_FACTOR,
              action: 'collision'
            }
            // Insert collision points at appropriate positions
            const collisionIndex = optimizedPositions.findIndex(pos => 
              pos.y >= collision.y && !pos.action
            )
            if (collisionIndex !== -1) {
              optimizedPositions.splice(collisionIndex, 0, optimizedCollision)
            }
          })
          
          // Compress the optimized path data
          const compressedPath = LZString.compressToBase64(JSON.stringify(optimizedPositions))
          this.paths[this.rows][bucket].push(compressedPath)
        }

        if (this.engine) World.remove(this.engine.world, body)
        this.balls.splice(i, 1)

        this.renderer?.ballContainer.removeChild(graphics)
      }
    }
  }

  private handleCollision(event: IEventCollision<Engine>) {
    const pairs = event.pairs

    for (const pair of pairs) {
      const { bodyA, bodyB } = pair

      let ballBody: Body | null = null
      let obstacleBody: Body | null = null

      if (bodyA.label === 'ball' && bodyB.isStatic) {
        ballBody = bodyA
        obstacleBody = bodyB
      } else if (bodyB.label === 'ball' && bodyA.isStatic) {
        ballBody = bodyB
        obstacleBody = bodyA
      }

      if (ballBody && obstacleBody) {
        const ball = this.balls.find((b) => b.body.id === ballBody!.id)
        if (ball) {
          ball.positions.push({
            x: obstacleBody.position.x,
            y: obstacleBody.position.y,
            action: 'collision',
          })
        }
      }
    }
  }

  private clearBalls() {
    for (const ball of this.balls) {
      if (this.engine) World.remove(this.engine.world, ball.body)
      this.renderer?.ballContainer.removeChild(ball.graphics)
    }
    this.balls = []
  }

  public async testPaths() {
    console.info('Testing recorded paths for determinism...')

    for (let rows = 8; rows <= 16; rows++) {
      this.renderer?.updateGame(rows)
      this.createObstacles(rows)

      for (const bucket in this.paths[rows]) {
        const paths = this.paths[rows][bucket]

        for (const compressedPath of paths) {
          const positions = JSON.parse(LZString.decompressFromBase64(compressedPath))
          const resultBucket = await this.testSinglePath(positions)
          if (parseInt(bucket) !== resultBucket) {
            console.error(`Path expected to land in bucket ${bucket} but landed in ${resultBucket}`)
          }
        }
      }
    }

    console.info('Path testing completed.')
  }

  private async testSinglePath(
    positions: { x: number; y: number; action?: string }[]
  ): Promise<number> {
    if (this.engine) World.clear(this.engine.world, true)
    this.renderer?.createObstacles()

    const startPosition = positions[0]
    const body = Bodies.circle(startPosition.x, startPosition.y, ballR(this.rows), DEF_BALL)
    body.label = 'ball'
    if (this.engine) World.add(this.engine.world, body)

    return new Promise<number>((resolve) => {
      const checkBall = () => {
        if (body.position.y >= lastRowY(this.rows) + obstacleR(this.rows)) {
          let bucket = -1
          if (
            body.position.x >= lastRowX(this.rows) &&
            body.position.x <= lastRowX(this.rows) + (this.rows + 1) * spacing(this.rows)
          ) {
            bucket = Math.floor((body.position.x - lastRowX(this.rows)) / spacing(this.rows))
          }
          if (this.engine) World.remove(this.engine.world, body)
          resolve(bucket)
        } else {
          setTimeout(checkBall, 16)
        }
      }
      checkBall()
    })
  }
}
