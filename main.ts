namespace SpriteKind {
    export const PowerUp = SpriteKind.create()
}
info.onCountdownEnd(function () {
    game.gameOver(false)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    sprites.destroy(otherSprite)
    info.changeScoreBy(1)
    if (isTimingDots == true) {
    	
    } else {
        isTimingDots = true
        dotsCollectedInTimeWindow = 0
    }
})
let dotsCollectedInTimeWindow = 0
let isTimingDots = false
let greyRainbow: Sprite = null
let dot: Sprite = null
tiles.setCurrentTilemap(tilemap`level2`)
let melodyBox = sprites.create(assets.image`腳色`, SpriteKind.Player)
tiles.placeOnRandomTile(melodyBox, assets.tile`myTile`)
scene.cameraFollowSprite(melodyBox)
controller.moveSprite(melodyBox)
info.setScore(0)
info.startCountdown(240)
let coinImages = [
    assets.image`金幣紅`,
    assets.image`金幣橘`,
    assets.image`金幣黃`,
    assets.image`金幣綠`,
    assets.image`金幣藍`,
    assets.image`金幣靛`,
    assets.image`金幣紫`
]
for (let index = 0; index <= 40; index++) {
    dot = sprites.create(coinImages._pickRandom(), SpriteKind.Food)
    tiles.placeOnRandomTile(dot, assets.tile`myTile`)
}
for (let index = 0; index <= 2; index++) {
    greyRainbow = sprites.create(assets.image`灰色彩虹`, SpriteKind.Enemy)
    tiles.placeOnRandomTile(greyRainbow, assets.tile`myTile`)
}
game.onUpdateInterval(500, function () {
    if (info.score() >= 55) {
        game.gameOver(true)
    }
})
