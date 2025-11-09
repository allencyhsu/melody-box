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
let axe: Sprite = null
let consecutiveCorrectCoins = 0
let consecutiveTimerStarted = false
let currentLevel = 1 // 新增：追蹤當前遊戲關卡

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

        // --- 斧頭道具生成邏輯 ---
        if (!consecutiveTimerStarted) {
            consecutiveTimerStarted = true
            consecutiveCorrectCoins = 1
            // 8 秒後重置連續計數
            setTimeout(function () {
                consecutiveCorrectCoins = 0
                consecutiveTimerStarted = false
            }, 8000)
        } else {
            consecutiveCorrectCoins += 1
        }

        if (consecutiveCorrectCoins >= 5) {
            axe = sprites.create(assets.image`斧頭`, SpriteKind.PowerUp)
            placeSpriteOnRandomEmptyTile(axe, assets.tile`myTile`)
            // 重置計數器
            consecutiveCorrectCoins = 0
            consecutiveTimerStarted = false
        }
        // --- 斧頭道具生成邏輯結束 ---

        // 如果收集滿 10 個，就挑選下一個目標顏色
        if (collectedOfTargetColor >= 10) {
            pickNewTargetColor()
        }
    } else {
        // 吃到錯誤顏色的金幣
        consecutiveCorrectCoins = 0
        consecutiveTimerStarted = false
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

sprites.onOverlap(SpriteKind.Player, SpriteKind.PowerUp, function (sprite, otherSprite) {
    otherSprite.destroy()
    info.changeCountdownBy(20)
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

/**
 * 轉換到第二關
 */
function goToLevel2() {
    currentLevel = 2
    game.splash("Level 2")

    // 清除所有現有金幣、敵人、道具
    sprites.destroyAllSpritesOfKind(SpriteKind.Food)
    sprites.destroyAllSpritesOfKind(SpriteKind.Enemy)
    sprites.destroyAllSpritesOfKind(SpriteKind.PowerUp)

    // 設定地圖為 Level 2
    tiles.setCurrentTilemap(tilemap`level2`)
    //tiles.setWall(myTiles.tile1, true) // 設定 Level 2 的牆壁

    // 重置玩家位置
    placeSpriteOnRandomEmptyTile(melodyBox, assets.tile`myTile`)
    scene.cameraFollowSprite(melodyBox) // Ensure camera follows after reset

    // 重置遊戲狀態
    info.setScore(0)
    info.startCountdown(270) // 4.5 minutes = 270 seconds
    pickNewTargetColor() // 挑選新的目標顏色

    // 生成 Level 2 的金幣 (62個隨機金幣)
    for (let i = 0; i < 62; i++) {
        let coinType = coinTypes._pickRandom()
        let newCoin = sprites.create(coinType.image, SpriteKind.Food)
        newCoin.data["color"] = coinType.color
        placeSpriteOnRandomEmptyTile(newCoin, assets.tile`myTile`)
    }

    // 生成 Level 2 的敵人 (沿用 Level 1 的邏輯)
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
}

// 遊戲勝利條件檢查
game.onUpdateInterval(500, function () {
    if (currentLevel === 1) {
        if (info.score() >= 55) {
            game.showLongText("Go to Level 2！", DialogLayout.Bottom)
            goToLevel2()
        }
    } else if (currentLevel === 2) {
        // Level 2 win condition: 62 coins collected
        if (info.score() >= 62) {
            game.gameOver(true) // Player wins Level 2
        }
    }
})


// --- 遊戲初始化 ---

// 設定地圖
tiles.setCurrentTilemap(tilemap`level1`)

// 設定玩家
melodyBox = sprites.create(assets.image`腳色`, SpriteKind.Player)
placeSpriteOnRandomEmptyTile(melodyBox, myTiles.transparency16)
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

// 生成初始金幣

let targetCoinType = coinTypes.find(t => t.color === targetColor)
if (targetCoinType) {
    // 先生成 10 個指定顏色的金幣
    for (let i = 0; i < 10; i++) {
        let newCoin = sprites.create(targetCoinType.image, SpriteKind.Food)
        newCoin.data["color"] = targetCoinType.color
        placeSpriteOnRandomEmptyTile(newCoin, myTiles.transparency16)
    }

    // 再隨機生成 10 個不同顏色的金幣
    let otherCoinTypes = coinTypes.filter(t => t.color !== targetColor)
    for (let i = 0; i < 10; i++) {
        let coinType = otherCoinTypes._pickRandom()
        let newCoin = sprites.create(coinType.image, SpriteKind.Food)
        newCoin.data["color"] = coinType.color
        placeSpriteOnRandomEmptyTile(newCoin, myTiles.transparency16)
    }

    // 生成敵人
    for (let i = 0; i < 3; i++) {
        greyRainbow = sprites.create(assets.image`灰色彩虹`, SpriteKind.Enemy)
        placeSpriteOnRandomEmptyTile(greyRainbow, myTiles.transparency16)
        // 初始給定水平速度
        if (Math.percentChance(50)) {
            greyRainbow.vx = 25
        } else {
            greyRainbow.vx = -25
        }
    }
}

// 按下 menu 按鈕可增加金幣
controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
    info.changeScoreBy(10) // 新增功能：增加分數10分
    // 先生成五個指定顏色的金幣
    let targetCoinType = coinTypes.find(t => t.color === targetColor)
    if (targetCoinType) {
        for (let i = 0; i < 5; i++) {
            let newCoin = sprites.create(targetCoinType.image, SpriteKind.Food)
            newCoin.data["color"] = targetCoinType.color
            placeSpriteOnRandomEmptyTile(newCoin, assets.tile`myTile`)
        }
    }
    // 再生成五個不同顏色的金幣
    let otherCoinTypes = coinTypes.filter(t => t.color !== targetColor)
    for (let i = 0; i < 5; i++) {
        let coinType = otherCoinTypes._pickRandom()
        let newCoin = sprites.create(coinType.image, SpriteKind.Food)
        newCoin.data["color"] = coinType.color
        placeSpriteOnRandomEmptyTile(newCoin, assets.tile`myTile`)
    }
})
