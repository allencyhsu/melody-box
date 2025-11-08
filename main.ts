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
for (let index = 0; index <= 60; index++) {
    dot = sprites.create(assets.image`金幣紅`, SpriteKind.Food)
    dot = sprites.create(assets.image`金幣橘`, SpriteKind.Food)
    dot = sprites.create(assets.image`金幣黃`, SpriteKind.Food)
    dot = sprites.create(assets.image`金幣綠`, SpriteKind.Food)
    dot = sprites.create(assets.image`金幣藍`, SpriteKind.Food)
    dot = sprites.create(assets.image`金幣靛`, SpriteKind.Food)
    dot = sprites.create(assets.image`金幣紫`, SpriteKind.Food)
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
