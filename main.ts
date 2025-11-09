namespace SpriteKind {
    export const PowerUp = SpriteKind.create()
    // 新增：為動畫角色建立一個獨立的 SpriteKind，避免與遊戲元素互動
    export const UI = SpriteKind.create()
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
let currentLevel = 1
let introMelodyBox: Sprite = null // 新增：動畫角色變數

// --- HUD 介面變數 ---
let hudSquare: Sprite = null
let hudImage: Image = image.create(12, 12)

// --- 金幣定義 (平行陣列) ---
const coinImages = [
    assets.image`金幣紅`,
    assets.image`金幣橘`,
    assets.image`金幣黃`,
    assets.image`金幣綠`,
    assets.image`金幣藍`,
    assets.image`金幣靛`,
    assets.image`金幣紫`
]
const coinColors = [
    "red",
    "orange",
    "yellow",
    "green",
    "light blue",
    "blue",
    "purple"
]
const coinColorIndexes = [
    2,
    4,
    5,
    7,
    9,
    8,
    10
]

// --- 遊戲核心函式 ---

/**
 * 新增：開場動畫函式
 * 創建一個角色，將其放大，然後銷毀。
 */
function playIntroAnimation() {
    introMelodyBox = sprites.create(assets.image`腳色`, SpriteKind.UI)
    introMelodyBox.setPosition(80, 60) // 螢幕中心
    // 迴圈放大角色
    for (let i = 0; i <= 20; i++) {
        introMelodyBox.scale = i * 0.2 // 調整放大速率，使其更平滑
        pause(50) // 縮短暫停時間，讓動畫更快
    }
    pause(200) // 放大後稍作停留
    introMelodyBox.destroy()
}


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
    let newTargetIndex = 0
    let currentTargetIndex = coinColors.indexOf(targetColor)
    do {
        newTargetIndex = randint(0, coinColors.length - 1)
    } while (newTargetIndex == currentTargetIndex)
    targetColor = coinColors[newTargetIndex]
    targetColorIndex = coinColorIndexes[newTargetIndex]
    collectedOfTargetColor = 0
    hudImage.fill(targetColorIndex)
}

// 倒數計時結束
info.onCountdownEnd(function () {
    game.gameOver(false)
})

// 玩家與金幣的碰撞事件
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    if (otherSprite.data["color"] == targetColor) {
        info.changeScoreBy(1)
        collectedOfTargetColor += 1
        if (!consecutiveTimerStarted) {
            consecutiveTimerStarted = true
            consecutiveCorrectCoins = 1
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
            consecutiveCorrectCoins = 0
            consecutiveTimerStarted = false
        }
        if (collectedOfTargetColor >= 10) {
            pickNewTargetColor()
        }
    } else {
        consecutiveCorrectCoins = 0
        consecutiveTimerStarted = false
        game.gameOver(false)
    }
    sprites.destroy(otherSprite)
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
        sprite.vy = Math.percentChance(50) ? 25 : -25
    } else {
        sprite.vy = 0
        sprite.vx = Math.percentChance(50) ? 25 : -25
    }
})

/**
 * 轉換到第二關
 */
function goToLevel2() {
    currentLevel = 2
    game.splash("Level 2")
    sprites.destroyAllSpritesOfKind(SpriteKind.Food)
    sprites.destroyAllSpritesOfKind(SpriteKind.Enemy)
    sprites.destroyAllSpritesOfKind(SpriteKind.PowerUp)
    tiles.setCurrentTilemap(tilemap`level2`)
    placeSpriteOnRandomEmptyTile(melodyBox, assets.tile`myTile`)
    scene.cameraFollowSprite(melodyBox)
    info.setScore(0)
    info.startCountdown(270)
    pickNewTargetColor()

    // 生成初始金幣
    let targetIndex = coinColors.indexOf(targetColor)
    if (targetIndex != -1) {
        for (let i = 0; i < 10; i++) {
            let newCoin = sprites.create(coinImages[targetIndex], SpriteKind.Food)
            newCoin.data["color"] = coinColors[targetIndex]
            placeSpriteOnRandomEmptyTile(newCoin, assets.tile`myTile`)
        }
        for (let i = 0; i < 10; i++) {
            let randomIndex = 0
            do {
                randomIndex = randint(0, coinColors.length - 1)
            } while (randomIndex == targetIndex)
            let newCoin = sprites.create(coinImages[randomIndex], SpriteKind.Food)
            newCoin.data["color"] = coinColors[randomIndex]
            placeSpriteOnRandomEmptyTile(newCoin, assets.tile`myTile`)
        }
    }

    for (let i = 0; i < 3; i++) {
        greyRainbow = sprites.create(assets.image`灰色彩虹`, SpriteKind.Enemy)
        placeSpriteOnRandomEmptyTile(greyRainbow, assets.tile`myTile`)
        greyRainbow.vx = Math.percentChance(50) ? 25 : -25
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
        if (info.score() >= 62) {
            game.gameOver(true)
        }
    }
})

// --- 遊戲初始化 ---

// 新增：在遊戲開始時呼叫開場動畫
playIntroAnimation()

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
let targetIndex = coinColors.indexOf(targetColor)
if (targetIndex != -1) {
    for (let i = 0; i < 10; i++) {
        let newCoin = sprites.create(coinImages[targetIndex], SpriteKind.Food)
        newCoin.data["color"] = coinColors[targetIndex]
        placeSpriteOnRandomEmptyTile(newCoin, myTiles.transparency16)
    }
    for (let i = 0; i < 10; i++) {
        let randomIndex = 0
        do {
            randomIndex = randint(0, coinColors.length - 1)
        } while (randomIndex == targetIndex)
        let newCoin = sprites.create(coinImages[randomIndex], SpriteKind.Food)
        newCoin.data["color"] = coinColors[randomIndex]
        placeSpriteOnRandomEmptyTile(newCoin, myTiles.transparency16)
    }
}

// 生成敵人
for (let i = 0; i < 3; i++) {
    greyRainbow = sprites.create(assets.image`灰色彩虹`, SpriteKind.Enemy)
    placeSpriteOnRandomEmptyTile(greyRainbow, myTiles.transparency16)
    greyRainbow.vx = Math.percentChance(50) ? 25 : -25
}

// 按下 B 按鈕可增加金幣
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    info.changeScoreBy(10)
    let targetIndex = coinColors.indexOf(targetColor)
    if (targetIndex != -1) {
        for (let i = 0; i < 5; i++) {
            let newCoin = sprites.create(coinImages[targetIndex], SpriteKind.Food)
            newCoin.data["color"] = coinColors[targetIndex]
            placeSpriteOnRandomEmptyTile(newCoin, assets.tile`myTile`)
        }
    }
    for (let i = 0; i < 5; i++) {
        let randomIndex = randint(0, coinColors.length - 1)
        let newCoin = sprites.create(coinImages[randomIndex], SpriteKind.Food)
        newCoin.data["color"] = coinColors[randomIndex]
        placeSpriteOnRandomEmptyTile(newCoin, assets.tile`myTile`)
    }
})