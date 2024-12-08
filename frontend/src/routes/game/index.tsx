import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

interface GameObject {
  x: number
  y: number
  width: number
  height: number
  velocityY: number
  velocityX: number
  isJumping: boolean
  health: number
}

interface Monster {
  x: number
  y: number
  width: number
  height: number
  velocityX: number
  direction: number
  type: 'walker' | 'jumper'
  health: number
}

interface Platform {
  x: number
  y: number
  width: number
  height: number
  type: 'normal' | 'hazard'
}

interface Coin {
  x: number
  y: number
  width: number
  height: number
  collected: boolean
  value: number
}

interface Camera {
  x: number
  y: number
}

interface GameState {
  player: GameObject
  monsters: Monster[]
  camera: Camera
  score: number
  coins: Coin[]
}

const WORLD_WIDTH = 3200
const WORLD_HEIGHT = 800
const VIEWPORT_WIDTH = 800
const VIEWPORT_HEIGHT = 600
const GRAVITY = 0.5
const JUMP_FORCE = -12
const MOVE_SPEED = 5
const MONSTER_SPEED = 2

export const Route = createFileRoute('/game/')({
  component: GameComponent,
})

function GameComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const requestRef = useRef<number>()
  const activeKeys = useRef(new Set<string>())

  const [gameState, setGameState] = useState<GameState>({
    player: {
      x: 100,
      y: 100,
      width: 40,
      height: 40,
      velocityY: 0,
      velocityX: 0,
      isJumping: false,
      health: 100,
    },
    monsters: [
      { x: 500, y: 500, width: 40, height: 40, velocityX: MONSTER_SPEED, direction: 1, type: 'walker', health: 50 },
      { x: 800, y: 500, width: 40, height: 40, velocityX: MONSTER_SPEED, direction: 1, type: 'walker', health: 50 },
      { x: 1200, y: 300, width: 40, height: 40, velocityX: MONSTER_SPEED, direction: 1, type: 'walker', health: 50 },
      { x: 1500, y: 500, width: 40, height: 40, velocityX: MONSTER_SPEED, direction: 1, type: 'jumper', health: 30 },
      { x: 2000, y: 500, width: 40, height: 40, velocityX: MONSTER_SPEED, direction: 1, type: 'jumper', health: 30 },
    ],
    camera: { x: 0, y: 0 },
    score: 0,
    coins: [
      // Coins near platforms
      { x: 350, y: 350, width: 20, height: 20, collected: false, value: 10 },
      { x: 650, y: 250, width: 20, height: 20, collected: false, value: 10 },
      { x: 950, y: 300, width: 20, height: 20, collected: false, value: 10 },
      { x: 1250, y: 200, width: 20, height: 20, collected: false, value: 10 },
      { x: 1550, y: 350, width: 20, height: 20, collected: false, value: 10 },
      { x: 1850, y: 250, width: 20, height: 20, collected: false, value: 10 },
      { x: 2150, y: 300, width: 20, height: 20, collected: false, value: 10 },
      // Bonus coins in challenging positions
      { x: 1100, y: 450, width: 20, height: 20, collected: false, value: 25 },
      { x: 1700, y: 450, width: 20, height: 20, collected: false, value: 25 },
      { x: 2000, y: 200, width: 20, height: 20, collected: false, value: 50 },
    ],
  })

  const platforms: Platform[] = [
    // Ground platforms
    { x: 0, y: 550, width: WORLD_WIDTH, height: 50, type: 'normal' },
    // Regular platforms
    { x: 300, y: 400, width: 200, height: 20, type: 'normal' },
    { x: 600, y: 300, width: 200, height: 20, type: 'normal' },
    { x: 900, y: 350, width: 200, height: 20, type: 'normal' },
    { x: 1200, y: 250, width: 200, height: 20, type: 'normal' },
    { x: 1500, y: 400, width: 200, height: 20, type: 'normal' },
    { x: 1800, y: 300, width: 200, height: 20, type: 'normal' },
    { x: 2100, y: 350, width: 200, height: 20, type: 'normal' },
    // Hazard platforms
    { x: 1000, y: 500, width: 100, height: 20, type: 'hazard' },
    { x: 1600, y: 500, width: 100, height: 20, type: 'hazard' },
  ]

  const checkCollision = (obj1: { x: number, y: number, width: number, height: number }, obj2: { x: number, y: number, width: number, height: number }) => {
    return (
      obj1.x < obj2.x + obj2.width
      && obj1.x + obj1.width > obj2.x
      && obj1.y < obj2.y + obj2.height
      && obj1.y + obj1.height > obj2.y
    )
  }

  const updateGameState = () => {
    setGameState((prevState) => {
      const newState = { ...prevState }
      const { player, monsters, camera, coins } = newState

      // Apply horizontal movement
      if (activeKeys.current.has('ArrowLeft')) {
        player.velocityX = -MOVE_SPEED
      }
      else if (activeKeys.current.has('ArrowRight')) {
        player.velocityX = MOVE_SPEED
      }
      else {
        player.velocityX = 0
      }

      // Apply gravity to player
      player.velocityY += GRAVITY

      // Apply jump
      if (activeKeys.current.has(' ') && !player.isJumping) {
        player.velocityY = JUMP_FORCE
        player.isJumping = true
      }

      // Update player position
      player.x += player.velocityX
      player.y += player.velocityY

      // Update camera position
      camera.x = Math.max(0, Math.min(player.x - VIEWPORT_WIDTH / 2, WORLD_WIDTH - VIEWPORT_WIDTH))
      camera.y = Math.max(0, Math.min(player.y - VIEWPORT_HEIGHT / 2, WORLD_HEIGHT - VIEWPORT_HEIGHT))

      // Check coin collisions
      coins.forEach((coin) => {
        if (!coin.collected && checkCollision(player, coin)) {
          coin.collected = true
          newState.score += coin.value
        }
      })

      // Update monsters
      monsters.forEach((monster) => {
        // Update monster position
        monster.x += monster.velocityX * monster.direction

        // Monster AI behavior
        if (monster.type === 'walker') {
          // Walker monsters move back and forth
          if (monster.x <= monster.x - 200 || monster.x >= monster.x + 200) {
            monster.direction *= -1
          }
        }
        else if (monster.type === 'jumper') {
          // Jumper monsters jump when player is nearby
          const distanceToPlayer = Math.abs(monster.x - player.x)
          if (distanceToPlayer < 200 && Math.random() < 0.02) {
            monster.y -= 100 // Simple jump
          }
        }

        // Check collision with player
        if (checkCollision(player, monster)) {
          player.health -= 10
          // Knock player back
          player.velocityX = (player.x < monster.x) ? -10 : 10
          player.velocityY = -5
        }
      })

      // Check platform collisions
      platforms.forEach((platform) => {
        if (checkCollision(player, platform)) {
          // Top collision
          if (player.velocityY > 0
            && player.y + player.height - player.velocityY <= platform.y) {
            player.y = platform.y - player.height
            player.velocityY = 0
            player.isJumping = false

            // Damage player if it's a hazard platform
            if (platform.type === 'hazard') {
              player.health -= 5
            }
          }
          // Bottom collision
          else if (player.velocityY < 0
            && player.y - player.velocityY >= platform.y + platform.height) {
            player.y = platform.y + platform.height
            player.velocityY = 0
          }
          // Side collisions
          else {
            player.x -= player.velocityX
          }
        }
      })

      // World boundaries
      player.x = Math.max(0, Math.min(player.x, WORLD_WIDTH - player.width))
      if (player.y < 0) {
        player.y = 0
        player.velocityY = 0
      }
      if (player.y + player.height > WORLD_HEIGHT) {
        player.y = WORLD_HEIGHT - player.height
        player.velocityY = 0
        player.isJumping = false
      }

      return newState
    })
  }

  const gameLoop = () => {
    updateGameState()
    requestRef.current = requestAnimationFrame(gameLoop)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas)
      return

    canvas.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      activeKeys.current.add(e.key)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault()
      activeKeys.current.delete(e.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    requestRef.current = requestAnimationFrame(gameLoop)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx)
      return

    const logoImage = new Image()
    logoImage.src = '/favicon.png'

    const coinImage = new Image()
    coinImage.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSI4IiBmaWxsPSIjZmZkNzAwIiBzdHJva2U9IiNmZmE1MDAiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg=='

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Apply camera transform
      ctx.save()
      ctx.translate(-gameState.camera.x, -gameState.camera.y)

      // Draw platforms
      platforms.forEach((platform) => {
        ctx.fillStyle = platform.type === 'hazard' ? '#ff0000' : '#4a4a4a'
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height)
      })

      // Draw coins with animation
      const coinBob = Math.sin(Date.now() / 200) * 5 // Bobbing animation
      gameState.coins.forEach((coin) => {
        if (!coin.collected) {
          ctx.save()
          ctx.translate(coin.x, coin.y + coinBob)

          // Coin glow effect
          const gradient = ctx.createRadialGradient(
            coin.width / 2,
            coin.height / 2,
            0,
            coin.width / 2,
            coin.height / 2,
            coin.width,
          )
          gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)')
          gradient.addColorStop(1, 'rgba(255, 215, 0, 0)')

          ctx.fillStyle = gradient
          ctx.fillRect(-5, -5, coin.width + 10, coin.height + 10)

          // Draw the coin
          ctx.drawImage(coinImage, 0, 0, coin.width, coin.height)
          ctx.restore()
        }
      })

      // Draw monsters
      gameState.monsters.forEach((monster) => {
        ctx.fillStyle = monster.type === 'jumper' ? '#ff00ff' : '#ff0000'
        ctx.fillRect(monster.x, monster.y, monster.width, monster.height)
      })

      // Draw player
      ctx.drawImage(logoImage, gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height)

      // Restore camera transform
      ctx.restore()

      // Draw HUD
      ctx.fillStyle = '#ffffff'
      ctx.font = '20px Arial'
      ctx.fillText(`Health: ${gameState.player.health}`, 20, 30)
      ctx.fillText(`Score: ${gameState.score}`, 20, 60)

      // Draw coin counter with icon
      ctx.drawImage(coinImage, 20, 70, 20, 20)
      ctx.fillText(`× ${gameState.coins.filter(c => c.collected).length}/${gameState.coins.length}`, 45, 87)

      requestAnimationFrame(render)
    }

    logoImage.onload = () => {
      requestAnimationFrame(render)
    }
  }, [gameState])

  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        width={VIEWPORT_WIDTH}
        height={VIEWPORT_HEIGHT}
        style={{ border: '1px solid #333' }}
        tabIndex={0}
      />
      <div className="controls">
        <p>Use Arrow Keys to move</p>
        <p>Press Space to jump</p>
        <p>Avoid red monsters and hazards!</p>
        <p>Collect golden coins for points!</p>
      </div>
      <style>
        {`
        .game-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #1a1a1a;
          color: white;
          padding: 20px;
        }
        .controls {
          margin-top: 20px;
          text-align: center;
          font-family: sans-serif;
        }
        canvas {
          background: #2a2a2a;
          border-radius: 8px;
          outline: none;
        }
      `}
      </style>
    </div>
  )
}
