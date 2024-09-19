const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scale = 20;
const rows = canvas.height / scale;
const cols = canvas.width / scale;

let snake;
let fruits = [];
let direction;
let score;
const numFruits = 5; // Número inicial de frutas

// Carregar efeitos sonoros
const eatSound = new Audio('eat.mp3');
const gameoverSound = new Audio('gameover.mp3');

function setup() {
    snake = new Snake();
    for (let i = 0; i < numFruits; i++) {
        fruits.push(new Fruit());
    }
    direction = { x: 1, y: 0 }; // Inicialmente movendo para a direita
    score = 0;

    document.addEventListener('mousemove', updateDirectionWithMouse);
    setInterval(update, 100); // Intervalo de atualização pode ser ajustado se necessário
}

function update() {
    snake.move();
    fruits.forEach((fruit, index) => {
        if (snake.eat(fruit)) {
            fruits.splice(index, 1); // Remove a fruta comida
            fruits.push(new Fruit()); // Adiciona uma nova fruta
            snake.grow(); // Faz a cobrinha crescer
            score++;
            eatSound.play(); // Toca o som ao comer a fruta
        }
    });
    if (snake.collide()) {
        gameoverSound.play(); // Toca o som ao finalizar o jogo
        alert('Game Over! Pontuação: ' + score);
        snake = new Snake();
        fruits = [];
        for (let i = 0; i < numFruits; i++) {
            fruits.push(new Fruit());
        }
        score = 0;
    }
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snake.draw();
    fruits.forEach(fruit => fruit.draw());
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Pontuação: ' + score, 10, 20);
}

function updateDirectionWithMouse(event) {
    const mouseX = event.clientX - canvas.offsetLeft;
    const mouseY = event.clientY - canvas.offsetTop;

    let head = snake.body[0];
    let dx = mouseX - (head.x * scale + scale / 2);
    let dy = mouseY - (head.y * scale + scale / 2);

    if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    } else {
        direction = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    }
}

class Snake {
    constructor() {
        this.body = [{ x: 2, y: 2 }];
        this.size = 1;
        this.history = []; // Histórico das posições para o rastro
    }

    draw() {
        ctx.shadowBlur = 10;    // Intensidade do brilho
        ctx.shadowColor = 'cyan'; // Cor do brilho
        ctx.shadowOffsetX = 0;  // Deslocamento do brilho horizontal
        ctx.shadowOffsetY = 0;  // Deslocamento do brilho vertical

        // Desenhar o rastro
        this.history.forEach((part, index) => {
            ctx.fillStyle = `rgba(0, 0, 255, ${1 - (index / this.history.length)})`; // Cor com opacidade
            ctx.fillRect(part.x * scale, part.y * scale, scale, scale);
        });

        // Desenhar a cobrinha
        ctx.fillStyle = 'blue'; // Cor da cobrinha
        this.body.forEach(part => {
            ctx.fillRect(part.x * scale, part.y * scale, scale, scale);
        });

        // Limpar efeitos de sombra após desenhar a cobrinha
        ctx.shadowBlur = 0;
    }

    move() {
        let head = { ...this.body[0] };

        head.x += direction.x;
        head.y += direction.y;

        this.body.unshift(head);
        if (this.body.length > this.size) {
            this.body.pop();
        }

        // Atualizar o histórico de posições para o rastro
        this.history.push(head);
        if (this.history.length > this.size * 5) { // Ajuste o tamanho do rastro se necessário
            this.history.shift();
        }
    }

    eat(fruit) {
        let head = this.body[0];
        if (head.x === fruit.x && head.y === fruit.y) {
            return true;
        }
        return false;
    }

    grow() {
        // Adiciona uma nova parte ao corpo da cobrinha
        this.size++;
    }

    collide() {
        let head = this.body[0];
        if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
            return true;
        }
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                return true;
            }
        }
        return false;
    }
}

class Fruit {
    constructor() {
        this.x = Math.floor(Math.random() * cols);
        this.y = Math.floor(Math.random() * rows);
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x * scale, this.y * scale, scale, scale);
    }
}

setup();
