namespace SpriteKind {
    export const PowerUp = SpriteKind.create()
}

// --- 遊戲狀態變數 ---
let targetColor: string
let targetColorIndex: number
let collectedOfTargetColor: number
let dotsCollectedInTimeWindow = 0
let isTimingDots = false
let greyRainbow: Sprite = null
let dot: Sprite = null
let melodyBox: Sprite = null

// --- HUD 介面變數 ---
let hudSquare: Sprite = null
let hudImage: Image = image.create(12, 12)

// --- 金幣定義 (加入了顏色索引) ---
const coinTypes = [
    { image: assets.image`金幣紅`, color: "red", index: 2 },
    { image: assets.image`金幣橘`, color: "orange", index: 4 },
    { image: assets.image`金幣黃`, color: "yellow", index: 5 },
    { image: assets.image`金幣綠`, color: "green", index: 7 },
    { image: assets.image`金幣藍`, color: "light blue", index: 9 },
    { image: assets.image`金幣靛`, color: "blue", index: 8 },
    { image: assets.image`金幣紫`, color: "purple", index: 10 }
]

// --- 遊戲核心函式 ---

/**
 * 將指定 sprite 放置在一個隨機的空磁磚上
 * @param sprite 要放置的 sprite
 * @param tile 要放置在哪種類型的磁磚上
 */
function placeSpriteOnRandomEmptyTile(sprite: Sprite, tile: Image) {
    tiles.placeOnRandomTile(sprite, tile)
}


/**
 * 挑選一個新的隨機目標顏色，並更新遊戲狀態和 HUD
 */
function pickNewTargetColor() {
    // 從不是當前目標的顏色中隨機挑選一個新顏色
    let newTargetType = coinTypes.filter(t => t.color !== targetColor)._pickRandom()
    targetColor = newTargetType.color
    // 修正：確保 HUD 顏色和目標顏色一致
    targetColorIndex = coinTypes.find(t => t.color === targetColor).index
    collectedOfTargetColor = 0
    hudImage.fill(targetColorIndex) // 更新 HUD 方塊的顏色
}

// 倒數計時結束
info.onCountdownEnd(function () {
    game.gameOver(false)
})

// 玩家與金幣的碰撞事件
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    // 檢查吃到的金幣是否為目標顏色
    if (otherSprite.data["color"] == targetColor) {
        info.changeScoreBy(1)
        collectedOfTargetColor += 1

        // 如果收集滿 10 個，就挑選下一個目標顏色
        if (collectedOfTargetColor >= 10) {
            pickNewTargetColor()
        }
    } else {
        game.gameOver(false)
    }

    // 無論顏色是否匹配，都銷毀金幣
    sprites.destroy(otherSprite)

    // (保留了原始程式碼中的計時邏輯)
    if (isTimingDots == true) {

    } else {
        isTimingDots = true
        dotsCollectedInTimeWindow = 0
    }
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    game.gameOver(false)
})

scene.onHitWall(SpriteKind.Enemy, function (sprite, location) {
    let wasMovingHorizontally = sprite.vx != 0
    if (wasMovingHorizontally) {
        sprite.vx = 0
        if (Math.percentChance(50)) {
            sprite.vy = 25
        } else {
            sprite.vy = -25
        }
    } else {
        sprite.vy = 0
        if (Math.percentChance(50)) {
            sprite.vx = 25
        } else {
            sprite.vx = -25
        }
    }
})

// 遊戲勝利條件檢查
game.onUpdateInterval(500, function () {
    // 注意：勝利條件可能需要根據新的遊戲機制調整，暫時保留
    if (info.score() >= 55) {
        game.gameOver(true)
    }
})


// --- 遊戲初始化 ---

// 設定地圖
tiles.setCurrentTilemap(tilemap`level2`)

// 設定玩家
melodyBox = sprites.create(assets.image`腳色`, SpriteKind.Player)
placeSpriteOnRandomEmptyTile(melodyBox, assets.tile`myTile`)
scene.cameraFollowSprite(melodyBox)
controller.moveSprite(melodyBox)

// 設定 HUD
hudSquare = sprites.create(hudImage)
hudSquare.setFlag(SpriteFlag.RelativeToCamera, true)
hudSquare.setPosition(8, 8)
hudSquare.z = 100

// 設定遊戲狀態
info.setScore(0)
info.startCountdown(240)

// 設定第一個目標顏色
pickNewTargetColor()

// 生成初始金幣 (稍微增加了數量以確保地圖上有足夠的各種顏色)
for (let i = 0; i < 40; i++) {
    let coinType = coinTypes._pickRandom()
    dot = sprites.create(coinType.image, SpriteKind.Food)
    dot.data["color"] = coinType.color
    placeSpriteOnRandomEmptyTile(dot, assets.tile`myTile`)
}

// 生成敵人
for (let i = 0; i < 3; i++) {
    greyRainbow = sprites.create(assets.image`灰色彩虹`, SpriteKind.Enemy)
    placeSpriteOnRandomEmptyTile(greyRainbow, assets.tile`myTile`)
    // 初始給定水平速度
    if (Math.percentChance(50)) {
        greyRainbow.vx = 25
    } else {
        greyRainbow.vx = -25
    }
}

// 按下 menu 按鈕可增加 10 個金幣
controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
    for (let i = 0; i < 10; i++) {
        let coinType = coinTypes._pickRandom()
        let newCoin = sprites.create(coinType.image, SpriteKind.Food)
        newCoin.data["color"] = coinType.color
        placeSpriteOnRandomEmptyTile(newCoin, assets.tile`myTile`)
    }
})
