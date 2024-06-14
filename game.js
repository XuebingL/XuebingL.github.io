const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 设置Canvas尺寸为窗口的宽高
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 加载图像
const background = new Image();
background.src = 'images/background.png';

const basketImg = new Image();
basketImg.src = 'images/rainbow.png';

const eggImg = new Image();
eggImg.src = 'images/skygrass.png';

const basket = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 120, // 改变篮子的起始位置
    width: 100,
    height: 100,
    offsetX: 0, // 触摸点相对于篮子左上角的偏移
    isDragging: false // 是否正在拖动篮子
};

let eggs = []; // 用于管理多个鸡蛋
let score = 0;
let isGameOver = false;
let gameTimer;
let gameTime = 30; // 游戏时间，单位：秒

function drawBackground() {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

function drawBasket() {
    ctx.drawImage(basketImg, basket.x, basket.y, basket.width, basket.height);
}

function drawEgg(egg) {
    ctx.drawImage(eggImg, egg.x, egg.y, egg.width, egg.height);
}

function drawScore() {
    const padding = 10;
    const fontSize = 24;
    const fontColor = 'white';
    const backgroundColor = 'rgba(0, 0, 0, 0.5)';

    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = fontColor;
    const text = 'Score: ' + score;
    const textWidth = ctx.measureText(text).width;
    const textHeight = fontSize;

    // 绘制背景框
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(10, 10, textWidth + 2 * padding, textHeight + 2 * padding);

    // 绘制分数
    ctx.fillStyle = fontColor;
    ctx.fillText(text, 10 + padding, 10 + textHeight + padding / 2);
}

function drawTime() {
    const padding = 10;
    const fontSize = 24;
    const fontColor = 'white';
    const backgroundColor = 'rgba(0, 0, 0, 0.5)';
    const timeText = 'Time: ' + Math.floor(gameTime); // 只显示整数秒
    const textWidth = ctx.measureText(timeText).width;
    const textHeight = fontSize;

    // 绘制背景框
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(canvas.width - textWidth - 2 * padding, 10, textWidth + 2 * padding, textHeight + 2 * padding);

    // 绘制时间
    ctx.fillStyle = fontColor;
    ctx.fillText(timeText, canvas.width - textWidth - padding, 10 + textHeight + padding / 2);
}

function drawGameOver() {
    const text = `Game Over\nYour Score: ${score}`;
    const fontSize = 30;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 30);

    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart Game';
    restartButton.style.position = 'absolute';
    restartButton.style.top = '50%';
    restartButton.style.left = '50%';
    restartButton.style.transform = 'translate(-50%, -50%)';
    restartButton.style.padding = '20px';
    restartButton.style.fontSize = '24px';
    restartButton.style.backgroundColor = '#4CAF50';
    restartButton.style.color = 'white';
    restartButton.style.border = 'none';
    restartButton.style.borderRadius = '5px';
    restartButton.style.cursor = 'pointer';
    document.body.appendChild(restartButton);

    restartButton.addEventListener('click', () => {
        document.body.removeChild(restartButton);
        location.reload(); // 重新加载页面
    });
}

function update() {
    if (isGameOver) {
        drawGameOver();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    eggs.forEach((egg, index) => {
        egg.y += egg.dy;

        if (egg.y + egg.height > basket.y && egg.x > basket.x && egg.x < basket.x + basket.width) {
            score++;
            eggs.splice(index, 1); // 移除被接住的鸡蛋
        } else if (egg.y + egg.height > canvas.height) {
            eggs.splice(index, 1); // 移除掉落到地面的鸡蛋
        }

        drawEgg(egg);
    });

    if (basket.isDragging) {
        basket.x = basket.offsetX - basket.width / 2;
        if (basket.x < 0) {
            basket.x = 0;
        } else if (basket.x + basket.width > canvas.width) {
            basket.x = canvas.width - basket.width;
        }
    }

    drawBasket();
    drawScore();
    drawTime();

    // 更新游戏时间
    if (gameTime > 0) {
        gameTime -= 1 / 60; // 每帧减少1秒，假设帧率为60FPS
    } else {
        isGameOver = true;
    }
}

function addEgg() {
    if (isGameOver) {
        return; // 游戏结束时不再添加新的鸡蛋
    }

    const newEgg = {
        x: Math.random() * (canvas.width - 50), // Adjust to ensure the egg doesn't spawn partially off-screen
        y: 0,
        width: 50, // New width
        height: 50, // New height
        dy: 7
    };
    eggs.push(newEgg);
}

function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    gameLoop();
    setInterval(addEgg, 1000); // 每隔1秒添加一个新的鸡蛋

    gameTimer = setInterval(() => {
        if (gameTime <= 0) {
            clearInterval(gameTimer); // 停止计时器
            isGameOver = true; // 结束游戏
        }
    }, 1000); // 每秒检查一次时间
}

function moveBasket(event) {
    if (!basket.isDragging) {
        return;
    }

    let rect = canvas.getBoundingClientRect();
    let touchX = event.touches[0].clientX - rect.left;
    basket.offsetX = touchX;

    event.preventDefault();
}

function startDragging(event) {
    let rect = canvas.getBoundingClientRect();
    let touchX = event.touches[0].clientX - rect.left;

    if (touchX >= basket.x && touchX <= basket.x + basket.width && event.touches[0].clientY >= basket.y) {
        basket.isDragging = true;
        basket.offsetX = basket.x + basket.width / 2 - touchX;
    }
}

function stopDragging(event) {
    if (basket.isDragging) {
        basket.isDragging = false;
    }
}

// 添加事件监听器
canvas.addEventListener('touchstart', startDragging);
canvas.addEventListener('touchmove', moveBasket);
canvas.addEventListener('touchend', stopDragging);
document.getElementById('startButton').addEventListener('click', startGame);

function gameLoop() {
    update();
    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// 等待所有图片加载完成后再开始游戏
let imagesLoaded = 0;
const totalImages = 3;

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        document.getElementById('startButton').disabled = false;
    }
}

background.onload = imageLoaded;
basketImg.onload = imageLoaded;
eggImg.onload = imageLoaded;
