namespace SpriteKind {
    export const PowerUp = SpriteKind.create()
}
info.onCountdownEnd(function () {
    game.gameOver(false)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    if (otherSprite.data["color"] == "red") {
        info.changeScoreBy(1)
    }
    sprites.destroy(otherSprite)
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
let redSquareImg = image.create(12, 12)
redSquareImg.fill(2)
let redSquareSprite = sprites.create(redSquareImg)
redSquareSprite.setFlag(SpriteFlag.RelativeToCamera, true)
redSquareSprite.setPosition(8, 8)
redSquareSprite.z = 100
info.setScore(0)
info.startCountdown(240)
let coinTypes = [
    { image: assets.image`金幣紅`, color: "red" },
    { image: assets.image`金幣橘`, color: "orange" },
    { image: assets.image`金幣黃`, color: "yellow" },
    { image: assets.image`金幣綠`, color: "green" },
    { image: assets.image`金幣藍`, color: "blue" },
    { image: assets.image`金幣靛`, color: "indigo" },
    { image: assets.image`金幣紫`, color: "purple" }
]
for (let index = 0; index <= 40; index++) {
    let coinType = coinTypes._pickRandom()
    dot = sprites.create(coinType.image, SpriteKind.Food)
    dot.data["color"] = coinType.color
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
