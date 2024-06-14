const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 设置Canvas尺寸为窗口的宽高
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 加载图像
const background = new Image();
background.src = 'background.png';

const basketImg = new Image();
basketImg.src = 'basket.png';

const eggImg = new Image();
eggImg.src = 'egg.png';

const basket = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 50, // 改变篮子的起始位置
    width: 100,
    height: 20,
    offsetX: 0, // 触摸点相对于篮子左上角的偏移
    isDragging: false // 是否正在拖动篮子
};

let eggs = []; // 用于管理多个鸡蛋
let score = 0;

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
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 10, 20);
}

function update() {
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
}

function addEgg() {
    const newEgg = {
        x: Math.random() * (canvas.width - 20),
        y: 0,
        width: 20,
        height: 20,
        dy: 7
    };
    eggs.push(newEgg);
}

function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    gameLoop();
    setInterval(addEgg, 1000); // 每隔1秒添加一个新的鸡蛋
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
    requestAnimationFrame(gameLoop);
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
