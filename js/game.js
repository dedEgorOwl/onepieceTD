const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

// global variables
const cellSize = 100;
const cellGap = 3;
const gameGrid = [];
const defenders =[];
let numberOfResources = 300;
const enemies = [];
const enemyPositions = [];
let score = 0;
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;
const projectiles = [];
const resources = [];
const winningScore = 1000;
let chosenDefender = 1;

//mouse
const mouse = {
	x: 10,
	y: 10,
	width: 0.1,
	height: 0.1,
	clicked: false,
}
canvas.addEventListener('mousedown', function(){
	mouse.clicked = true;
});
canvas.addEventListener('mouseup', function(){
	mouse.clicked = false;
});
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', function(e) {
	mouse.x = e.x - canvasPosition.left;
	mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', function() {
	mouse.x = undefined;
	mouse.y = undefined;
})

// game board
const controlsBar = {
	width: canvas.width,
	height: cellSize,
}
class Cell {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = cellSize;
		this.height = cellSize;
	}
	draw() {
		if (mouse.x && mouse.y && collision(this, mouse)) {
			ctx.strokeStyle = 'black';
			ctx.strokeRect(this.x, this.y, this.width, this.height);
		}
	}
}
function createGrid() {
	for (let y = cellSize; y < canvas.height; y += cellSize) {
		for (let x = 0; x < canvas.width; x += cellSize) {
			gameGrid.push(new Cell(x, y));
		}
	}
}
createGrid();
function handleGameGrid() {
	for (let i = 0; i < gameGrid.length; i++) {
		gameGrid[i].draw();
	}
}
// projectiles

class Projectile {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = 10;
		this.height = 10;
		this.power = 20;
		this.speed = 5;
	}
	update() {
		this.x += this.speed;
	}
	draw() {
		ctx.fillStyle = 'black';
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
		ctx.fill();
	}
}
function handleProjectiles() {
	for (let i = 0; i < projectiles.length; i++) {
		projectiles[i].update();
		projectiles[i].draw();

		for (let j = 0; j < enemies.length; j++) {
			if (enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])) {
				enemies[j].health -= projectiles[i].power;
				projectiles.splice(i, 1);
				i--;
			}
		}
		
		if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
			projectiles.splice(i, 1);
			i--;
		}
	}
}

// defenders
const defenderTypes = [];
const defender1 = new Image();
defender1.src = './source/img/zoroAnim1.png';
defenderTypes.push(defender1);
const defender2 = new Image();
defender2.src = './source/img/luffyAnim1.png';
defenderTypes.push(defender2);

class Defender {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = cellSize - cellGap * 2;
		this.height = cellSize - cellGap * 2;
		this.shooting = false;
		this.shootNow = false;
		this.health = 100;
		this.projectiles = [];
		this.timer = 0;
		this.defenderType = defenderTypes[Math.floor(Math.random() * defenderTypes.length)];
		this.frameX = 0;
		this.frameY = 0;
		this.minFrame = 0;
		this.maxFrame = 5;
		this.spriteWidth = 102;
		this.spriteHeight = 102;
		this.chosenDefender = chosenDefender;
	}
	draw() {
		//ctx.fillStyle = 'blue';
		//ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = 'green';
		ctx.font = '30px Archivo Black';
		ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 13);
		if (this.chosenDefender === 1) {
			ctx.drawImage(defender1, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
		} else if (this.chosenDefender === 2) {
			ctx.drawImage(defender2, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
		}
	}
	update() {
		if (frame % 13 === 0) {
			if (this.frameX < this.maxFrame) this.frameX++;
			else this.frameX = this.minFrame;
			if (this.frameX === 4) this.shootNow = true;
		}

		if (this.shooting) {
			this.minFrame = 0;
			this.maxFrame = 5;
		} else {
			this.minFrame = 0;
			this.maxFrame = 0;
		}

		if (this.shooting && this.shootNow) {
			projectiles.push(new Projectile(this.x + 50, this.y + 50));
			this.shootNow = false;
		}
	}
}

function handleDefenders() {
	for (let i = 0; i < defenders.length; i++) {
		defenders[i].draw();
		defenders[i].update();
		if (enemyPositions.indexOf(defenders[i].y) !== -1) {
			defenders[i].shooting = true;
		} else {
			defenders[i].shooting = false;
		}
		for (let j = 0; j < enemies.length; j++) {
			if (defenders[i] && collision(defenders[i], enemies[j])) {
				enemies[j].movement = 0;
				defenders[i].health -= 1;
			}
			if (defenders[i] && defenders[i].health <= 0) {
				defenders.splice(i, 1);
        i--;
        enemies[j].movement = enemies[j].speed;
			}
		}
	}
}

const card1 = {
	x: 10,
	y: 10,
	width: 70,
	height: 70,
}
const card2 = {
	x: 90,
	y: 10,
	width: 70,
	height: 70,
}

function chooseDefender() {
	let card1stroke = 'black';
	let card2stroke = 'black';
	if (collision(mouse, card1) && mouse.clicked) {
		chosenDefender = 1;
	} else if (collision(mouse, card2) && mouse.clicked) {
		chosenDefender = 2;
	}

	if (chosenDefender === 1) {
		card1stroke = '#f344ff';
		card2stroke = 'black';
	} else if (chosenDefender === 2) {
		card1stroke = 'black';
		card2stroke = '#f344ff';
	} else {
		card1stroke = 'black';
		card2stroke = 'black';
	}

	ctx.lineWidth = 1;
	ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
	ctx.fillRect(card1.x, card1.y, card1.width, card1.height);
	ctx.strokeStyle = card1stroke;
	ctx.strokeRect(card1.x, card1.y, card1.width, card1.height);
	ctx.drawImage(defender1, 0,0, 102, 102, 8, 8, 145/2, 145/2);
	ctx.fillRect(card2.x, card2.y, card2.width, card2.height);
	ctx.strokeStyle = card2stroke;
	ctx.strokeRect(card2.x, card2.y, card2.width, card2.height);
	ctx.drawImage(defender2, 0,0, 102, 102, 96, 14, 120/2, 120/2);
}

//Floating Messages
const floatingMessages = [];
class floatingMessage {
	constructor(value, x, y, size, color) {
		this.value = value;
		this.x = x;
		this.y = y;
		this.size = size;
		this.lifeSpan = 0;
		this.color = color;
		this.opacity = 1;
	}
	update() {
		this.y -= 0.3
		this.lifeSpan += 1;
		if (this.opacity > 0.03) this.opacity -= 0.03;
	}
	draw() {
		ctx.globalAlpha = this.opacity;
		ctx.fillStyle = this.color;
		ctx.font = this.size + 'px Archivo Black';
		ctx.fillText(this.value, this.x, this.y);
		ctx.globalAlpha = 1;
	}
}
function handleFloatingMessages() {
	for (let i = 0; i < floatingMessages.length; i++) {
		floatingMessages[i].update();
		floatingMessages[i].draw();
		if (floatingMessages[i].lifeSpan >= 50) {
			floatingMessages.splice(i, 1);
			i--;
		}
	}
}

//enemies
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = './source/img/kingAnim1.png';
enemyTypes.push(enemy1);
const enemy2 = new Image();
enemy2.src = './source/img/ryumaAnim1.png';
enemyTypes.push(enemy2);

class Enemy {
	constructor(verticalPosition) {
		this.x = canvas.width;
		this.y = verticalPosition;
		this.width = cellSize - cellGap * 2;
		this.height = cellSize - cellGap * 2;
		this.speed = Math.random() * 0.2 + 0.8;
		this.movement = this.speed;
		this.health = 100;
		this.maxHealth = this.health;
		this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
		this.frameX = 0;
		this.frameY = 0;
		this.minFrame = 0;
		this.maxFrame = 5;
		this.spriteWidth = 102;
		this.spriteHeight = 102;
	}
	update() {
		this.x -= this.movement;
		if (frame % 10 === 0) {
			if (this.frameX < this.maxFrame) this.frameX++;
			else this.frameX = this.minFrame;
		}
	}
	draw() {
		//ctx.fillStyle = 'red';
		//ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = 'black';
		ctx.font = '30px Archivo Black';
		ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 13);
		//ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
		ctx.drawImage(this.enemyType, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
	}
}
function handleEnemies() {
	for (let i = 0; i < enemies.length; i++) {
		enemies[i].update();
		enemies[i].draw();
		if (enemies[i].x < 0) {
			gameOver = true;
		}
		if (enemies[i].health <= 0) {
			let gainedResources = enemies[i].maxHealth/10;
			numberOfResources += gainedResources;
			score += gainedResources;
			let findThisIndex = enemyPositions.indexOf(enemies[i].y);
			floatingMessages.push(new floatingMessage('+' + gainedResources, 426, 50, 30, '#2c2c2c'));
			floatingMessages.push(new floatingMessage('+' + gainedResources, enemies[i].x, enemies[i].y, 30, '#2c2c2c'));
			enemyPositions.splice(findThisIndex, 1);
			enemies.splice(i, 1);
			i--;
		}
	}
	if (frame % enemiesInterval === 0 && score < winningScore) {
		let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
		enemies.push(new Enemy(verticalPosition));
		enemyPositions.push(verticalPosition);
		if (enemiesInterval > 120) enemiesInterval -= 50;
	}
}

// resources
const amounts = [20, 30, 40];
class Resource {
	constructor() {
		this.x = Math.random() * (canvas.width - cellSize);
		this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
		this.width = cellSize * 0.6;
		this.height = cellSize * 0.6;
		this.amount = amounts[Math.floor(Math.random() * amounts.length)];
	}
	draw() {
		ctx.fillStyle = 'yellow';
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = 'black';
		ctx.font = '20px Archivo Black'
		ctx.fillText(this.amount, this.x + 15, this.y + 25);
	}
}
function handleResources() {
	if (frame % 500 === 0 && score < winningScore) {
		resources.push(new Resource());
	}
	for (let i = 0; i < resources.length; i++) {
		resources[i].draw();
		if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)) {
			numberOfResources += resources[i].amount;
			floatingMessages.push(new floatingMessage('+' + resources[i].amount, resources[i].x, resources[i].y, 30, 'black'));
			floatingMessages.push(new floatingMessage('+' + resources[i].amount, 426, 50, 30, '#2c2c2c'));
			resources.splice(i, 1);
			i--;
		}
	}
}

// utilites
function handleGameStatus() {
	ctx.fillStyle = '#2c2c2c';
	ctx.font = '30px Archivo Black';
	ctx.fillText('Score: ' + score, 250, 40);
	ctx.fillText('Resources: ' + numberOfResources, 250, 80);
	if (gameOver) {
		ctx.fillStyle = 'black';
		ctx.font = '90px Archivo Black';
		ctx.fillText('GAME OVER', 135, 330);
	}
	if (score >= winningScore && enemies.length === 0) {
		ctx.fillStyle ='black';
		ctx.font = '60px Archivo Black';
		ctx.fillText('LEVEL COMPLETE', 130, 300);
		ctx.font = '30px Archivo Black';
		ctx.fillText('You win with ' + score + ' points!', 134, 340);
	}
}

canvas.addEventListener('click', function() {
	const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
	const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
	if (gridPositionY < cellSize) return;
	for (let i = 0; i < defenders.length; i++) {
		if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) return;
	}
	let defenderCost = 100;
	if (numberOfResources >= defenderCost) {
		defenders.push(new Defender(gridPositionX, gridPositionY));
		numberOfResources -= defenderCost;
	} else {
		floatingMessages.push(new floatingMessage('not enough resources', mouse.x, mouse.y, 20, 'green'));
	}
});

function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#d0ffc9';
	ctx.fillRect(0, 0 , controlsBar.width, controlsBar.height);
	handleGameGrid();
	handleDefenders();
	handleResources();
	handleProjectiles();
	handleEnemies();
	chooseDefender();
	handleGameStatus();
	handleFloatingMessages();
	frame++;
	if (!gameOver) requestAnimationFrame(animate);
}
animate();

function collision(first, second) {
	if (	!(first.x > second.x + second.width ||
				first.x + first.width < second.x ||
				first.y > second.y + second.height ||
				first.y + first.height < second.y)
			) {
				return true;
			};
};

window.addEventListener('resize', function() {
	canvasPosition = canvas.getBoundingClientRect();
});
