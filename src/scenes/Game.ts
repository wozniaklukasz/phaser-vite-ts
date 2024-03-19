import { Scene } from 'phaser'

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera
  background: Phaser.GameObjects.Image

  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

  constructor () {
    super('Game')
  }

  create () {
    let score = 0

    this.camera = this.cameras.main
    this.camera.setBackgroundColor(0x00ff00)

    this.background = this.add.image(512, 384, 'background')
    this.background.setAlpha(0.5)

    // @ts-expect-error
    const scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#f00' })

    const platforms = this.physics.add.staticGroup()
    platforms.create(400, 568, 'platform').setScale(4).refreshBody()
    platforms.create(600, 400, 'platform')
    platforms.create(50, 250, 'platform')
    platforms.create(750, 220, 'platform')

    this.player = this.physics.add.sprite(288, 48, 'dude')
    this.player.setBounce(0.2)
    this.player.setCollideWorldBounds(true)
    this.player.body.setGravityY(300)

    this.physics.add.collider(this.player, platforms)

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20
    })

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    })

    this.input.once('pointerdown', () => {
      this.scene.start('GameOver')
    })

    const stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
      setScale: { x: 0.1, y: 0.1 }
    })

    stars.children.iterate(function (child) {
      // @ts-expect-error
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
      return true
    })

    const collectStar = (player, star) => {
      star.disableBody(true, true)

      score += 10
      scoreText.setText('Score: ' + score)
    }

    this.physics.add.collider(stars, platforms)
    this.physics.add.overlap(this.player, stars, collectStar, undefined, this)
  }

  update (time: number, delta: number) {
    super.update(time, delta)
    const cursors = this.input.keyboard!.createCursorKeys()

    if (cursors.left.isDown) {
      this.player.setVelocityX(-160)

      this.player.anims.play('left', true)
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(160)

      this.player.anims.play('right', true)
    } else {
      this.player.setVelocityX(0)

      this.player.anims.play('turn')
    }

    if (cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330)
    }
  }
}
