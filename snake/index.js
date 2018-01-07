'use strict';

const randomRect = function(xMax, yMax, min = 1) {
  let x = Math.floor(Math.random() * (yMax - min)) + min;
  let y = Math.floor(Math.random() * (xMax - min)) + min;
  return {'x': x - 1, 'y': y - 1};
};

const Rect = function(x, y) {
  this.x = x;
  this.y = y;
  this.isSnake = false;
  this.isFood = false;
};

const Board = function(width, height, context) {
  this.context = context;
  this.width = width;
  this.height = height;
  this.rows = 20; // 网格行数
  this.columns = 20; // 网格列数
};

Board.prototype.init = function() {
  this.mapArray = new Array(this.rows);
  this.rectWidth = this.width / this.columns; // 每个网格的宽度
  this.rectHeight = this.height / this.rows; // 每个网格的高度
  this.mapArray = new Array(this.rows); // 网格数组
  for (let i = 0; i < this.rows; i++) {
    this.mapArray[i] = new Array(this.columns);
  }
};

Board.prototype.draw = function() {
  this.init();
  let xArray = [];
  let yArray = [];
  this.context.beginPath();
  for (let i = 0.5; i < this.width; i += this.rectWidth) {
    this.context.moveTo(i, 0);
    this.context.lineTo(i, this.height);
    xArray.push(i);
  }
  for (let i = 0.5; i < this.height; i += this.rectHeight) {
    this.context.moveTo(0, i);
    this.context.lineTo(this.width, i);
    yArray.push(i);
  }
  for (let i = 0; i < this.rows; i++) {
    for (let j = 0; j < this.columns; j++) {
      this.mapArray[i][j] = new Rect(xArray[j], yArray[i]);
    }
  }
  this.context.stroke();
};

const Food = function(map, context) {
  this.context = context;
  this.x = 0;
  this.y = 0;
  this.map = map;
};

Food.prototype.generate = function() {
  let coordinate, x, y, rect;
  do {
    coordinate = randomRect(this.map.rows + 1, this.map.columns + 1);
    x = coordinate.x;
    y = coordinate.y;
    rect = this.map.mapArray[x][y];
  }
  while (rect.isSnake);
  rect.isFood = true;
  this.context.fillStyle = '#eee';
  this.context.fillRect(rect.x + 0.5, rect.y + 0.5, this.map.rectWidth - 1, this.map.rectHeight - 1);
};

const Snake = function(map, food, context) {
  this.context = context;
  this.length = 1; // 身体长度
  this.bodyArray = [];
  this.direc = 'right';// 37-左，38-上，39-右，40-下
  this.nextRect = null;
  this.rapid = 150;
  this.next = true;
  this.map = map;
  this.food = food;
  this.gameOver = false;
};

Snake.prototype.init = function() {
  let coordinate = randomRect(this.map.columns, this.map.rows, 2);
  let x = coordinate.x;
  let y = coordinate.y;
  this.map.mapArray[x][y].isSnake = true;
  this.bodyArray.push({'x': x, 'y': y, 'body': this.map.mapArray[x][y]});
};

Snake.prototype.draw = function() {
  this.init();
  this.context.fillStyle = '#000';
  for (let i = 0; i < this.bodyArray.length; i++) {
    let body = this.bodyArray[i].body;
    this.context.fillRect(body.x + 0.5, body.y + 0.5, this.map.rectWidth - 1, this.map.rectHeight - 1);
  }
};

Snake.prototype.move = function() {
  this.nextStep();
  let rect = this.nextRect.body;
  if (rect) {
    if (rect.isFood) {
      this.length++;
      this.bodyArray.splice(0, 0, {'x': this.nextRect.x, 'y': this.nextRect.y, 'body': rect});
      rect.isFood = false;
      rect.isSnake = true;
      this.food.generate();
      this.context.clearRect(rect.x + 0.5, rect.y + 0.5, this.map.rectWidth - 1, this.map.rectHeight - 1);
      this.context.fillStyle = '#000';
      this.context.fillRect(rect.x + 0.5, rect.y + 0.5, this.map.rectWidth - 1, this.map.rectHeight - 1);
    } else if (rect.isSnake) {
      this.stop();
    } else {
      this.bodyArray.splice(0, 0, {'x': this.nextRect.x, 'y': this.nextRect.y, 'body': rect});
      let tail = this.bodyArray.pop();
      let tailRect = this.map.mapArray[tail.x][tail.y];
      tailRect.isSnake = false;
      rect.isSnake = true;
      this.context.clearRect(tailRect.x + 0.5, tailRect.y + 0.5, this.map.rectWidth - 1, this.map.rectHeight - 1);
      this.context.fillRect(rect.x + 0.5, rect.y + 0.5, this.map.rectWidth - 1, this.map.rectHeight - 1);
    }
  } else {
    this.stop();
  }
  this.next = true;
};

Snake.prototype.nextStep = function() {
  let snakeHead = this.bodyArray[0];
  switch (this.direc) {
  case 'left':
    this.nextRect = {
      'x': snakeHead.x,
      'y': snakeHead.y - 1,
      'body': snakeHead.y - 1 >= 0 ? this.map.mapArray[snakeHead.x][snakeHead.y - 1] : null
    };
    break;
  case 'up':
    this.nextRect = {
      'x': snakeHead.x - 1,
      'y': snakeHead.y,
      'body': snakeHead.x - 1 >= 0 ? this.map.mapArray[snakeHead.x - 1][snakeHead.y] : null
    };
    break;
  case 'right':
    this.nextRect = {
      'x': snakeHead.x,
      'y': snakeHead.y + 1,
      'body': snakeHead.y + 1 <= this.map.columns - 1 ? this.map.mapArray[snakeHead.x][snakeHead.y + 1] : null
    };
    break;
  case 'down':
    this.nextRect = {
      'x': snakeHead.x + 1,
      'y': snakeHead.y,
      'body': snakeHead.x + 1 <= this.map.rows - 1 ? this.map.mapArray[snakeHead.x + 1][snakeHead.y] : null
    };
    break;
  }
};

Snake.prototype.stop = function() {
  this.context.font = 'bold 60px sans-serif';
  this.context.fillText('Game Over', 140, 200);
  this.context.font = 'bold 30px sans-serif';
  this.context.fillText(`Your score is ${this.length}`, 190, 300);
  this.gameOver = true;
};

Snake.prototype.goLeft = function() {
  if (this.next && this.direc !== 'right') {
    this.direc = 'left';
  }
};

Snake.prototype.goRight = function() {
  if (this.next && this.direc !== 'left') {
    this.direc = 'right';
  }
};

Snake.prototype.goUp = function() {
  if (this.next && this.direc !== 'down') {
    this.direc = 'up';
  }
};

Snake.prototype.goDown = function() {
  if (this.next && this.direc !== 'up') {
    this.direc = 'down';
  }
};
const Game = function(canvas, controller) {
  this.canvas = $(canvas)[0];
  this.controller = controller;
  this.context = this.canvas.getContext('2d');
  this.context.strokeStyle = '#eee';
  this.width = parseInt(this.canvas.getAttribute('width'), 10);
  this.height = parseInt(this.canvas.getAttribute('height'), 10);
  this.startGame = false;
  this.interval = null;
  this.map = new Board(this.width, this.height, this.context);
  this.food = new Food(this.map, this.context);
  this.snake = new Snake(this.map, this.food, this.context);
  this.map.draw();
};

Game.prototype.init = function() {
  let self = this;

  $(this.controller).delegate('input', 'change', function (e) {
    let target = $(e.target);
    let inputClass = target.attr('class');
    if (!self.startGame) {
      switch (inputClass) {
      case 'rapid':
        self.snake.rapid = parseInt(target[0].value, 10);
        break;
      case 'rows':
        self.map.rows = parseInt(target[0].value, 10);
        self.context.clearRect(0, 0, self.width, self.height);
        self.map.draw();
        break;
      case 'cols':
        self.map.columns = parseInt(target[0].value, 10);
        self.context.clearRect(0, 0, self.width, self.height);
        self.map.draw();
        break;
      }
    }
  });

  $(`${this.controller} .button`).on('click', function (e) {
    $(e.target).attr('disabled', 'true');
    self.start();
  });
};

Game.prototype.start = function() {
  let that = this;
  this.startGame = true;
  this.map.draw();
  this.food.generate();
  this.snake.draw();
  this.interval = setInterval(function() {
    if (that.snake.gameOver) {
      clearInterval(that.interval);
    } else {
      that.snake.move();
    }
  }, that.snake.rapid);
};

const game = new Game('#cv', '#container');
game.init();

document.onkeydown = function (e) {
  let event = e || window.event;
  switch (event.keyCode) {
  case 37:
    game.snake.goLeft();
    break;
  case 38:
    game.snake.goUp();
    break;
  case 39:
    game.snake.goRight();
    break;
  case 40:
    game.snake.goDown();
    break;
  }
};
