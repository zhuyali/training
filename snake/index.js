'use strict';

const canvas = document.getElementById('cv');
const context = canvas.getContext('2d');
context.strokeStyle = '#eee';
const width = parseInt(canvas.getAttribute('width'));
const height = parseInt(canvas.getAttribute('height'));

const randomRect = function(xMax = game.map.columns + 1, yMax = game.map.rows + 1, min = 1) {
  let x = Math.floor(Math.random() * (yMax - min)) + min;
  let y = Math.floor(Math.random() * (xMax - min)) + min;
  return {'x': x - 1, 'y': y - 1};
}

const Rect = function(x, y) {
  this.x = x;
  this.y = y;
  this.isSnake = false;
  this.isFood = false;
}

const Map = function(rows = 20, columns = 20) {
  this.rows = rows; //网格行数
  this.columns = columns; //网格列数
}

Map.prototype.init = function() {
  this.mapArray = new Array(this.rows);
  this.rectWidth = width / this.columns; //每个网格的宽度
  this.rectHeight = height / this.rows; //每个网格的高度
  this.mapArray = new Array(this.rows); //网格数组
  for(let i = 0; i < this.rows; i++) {
    this.mapArray[i] = new Array(this.columns);
  }
}

Map.prototype.draw = function() {
  this.init();
  let xArray = [];
  let yArray = [];
  context.beginPath();
  for(let i = 0.5; i < width; i += this.rectWidth) {
    context.moveTo(i, 0);
    context.lineTo(i, height);
    xArray.push(i);
  }
  for(let i = 0.5; i < height; i += this.rectHeight) {
    context.moveTo(0, i);
    context.lineTo(width, i);
    yArray.push(i);
  }
  for(let i = 0; i < this.rows; i++) {
    for (let j = 0; j < this.columns; j++) {
      this.mapArray[i][j] = new Rect(xArray[j], yArray[i]);
    }
  }
  context.stroke();
}

const Food = function(map) {
  this.x = 0;
  this.y = 0;
  this.map = map;
}

Food.prototype.generate = function() {
  let coordinate, x, y, rect;
  do {
    coordinate = randomRect();
    x = coordinate.x;
    y = coordinate.y;
    rect = this.map.mapArray[x][y];
  }
  while(rect.isSnake);
  rect.isFood = true;
  context.fillStyle = '#eee';
  context.fillRect(rect.x + 0.5, rect.y + 0.5, this.map.rectWidth - 1, this.map.rectHeight - 1);
}

const Snake = function(map, food, rapid = 150) {
  this.length = 1; //身体长度
  this.bodyArray = [];
  this.direc = 39;//37-左，38-上，39-右，40-下
  this.nextRect = null;
  this.rapid = rapid;
  this.start = false;
  this.next = true;
  this.map = map;
  this.food = food;
}

Snake.prototype.init = function() {
  let coordinate = randomRect(this.map.columns, this.map.rows, 2);
  let x = coordinate.x;
  let y = coordinate.y;
  this.map.mapArray[x][y].isSnake = true;
  this.bodyArray.push({'x':x, 'y':y, 'body':this.map.mapArray[x][y]});
}

Snake.prototype.draw = function() {
  this.init();
  context.fillStyle = '#000';
  for(let i = 0; i < this.bodyArray.length; i++) {
    let body = this.bodyArray[i].body;
    context.fillRect(body.x + 0.5, body.y + 0.5, this.map.rectWidth - 1, this.map.rectHeight - 1);
  }
}

Snake.prototype.move = function() {
  this.nextStep();
  let rect = this.nextRect.body;
  if(rect) {
    if(rect.isFood) {
      this.length++;
      this.bodyArray.splice(0, 0, {'x':this.nextRect.x, 'y':this.nextRect.y, 'body':rect});
      rect.isFood = false;
      rect.isSnake = true;
      this.food.generate();
      context.clearRect(rect.x + 0.5, rect.y + 0.5, this.map.rectWidth - 1, this.map.rectHeight - 1);
      context.fillStyle = '#000';
      context.fillRect(rect.x + 0.5, rect.y + 0.5, this.map.rectWidth - 1, this.map.rectHeight - 1);
    } else if(rect.isSnake) {
      this.stop();
      clearInterval(game.interval);
    } else {
      this.bodyArray.splice(0, 0, {'x':this.nextRect.x, 'y':this.nextRect.y, 'body':rect});
      let tail = this.bodyArray.pop();
      let tailRect = this.map.mapArray[tail.x][tail.y];
      tailRect.isSnake = false;
      rect.isSnake = true;
      context.clearRect(tailRect.x + 0.5, tailRect.y + 0.5,this.map.rectWidth - 1, this.map.rectHeight - 1);
      context.fillRect(rect.x + 0.5, rect.y + 0.5, this.map.rectWidth - 1, this.map.rectHeight - 1);
    }
  } else {
    this.stop();
    clearInterval(game.interval);
  }
  this.next = true;
}

Snake.prototype.nextStep = function() {
  let snakeHead = this.bodyArray[0];
  switch(this.direc) {
    case 37:
      this.nextRect = {
        'x': snakeHead.x,
        'y': snakeHead.y - 1,
        'body': snakeHead.y - 1 >= 0 ? this.map.mapArray[snakeHead.x][snakeHead.y - 1] : null
      };
      break;
    case 38:
      this.nextRect = {
        'x': snakeHead.x - 1,
        'y': snakeHead.y,
        'body': snakeHead.x - 1 >= 0 ? this.map.mapArray[snakeHead.x - 1][snakeHead.y] : null
      };
      break;
    case 39:
      this.nextRect = {
        'x': snakeHead.x,
        'y': snakeHead.y + 1,
        'body': snakeHead.y + 1 <= this.map.columns - 1 ? this.map.mapArray[snakeHead.x][snakeHead.y + 1] : null
      };
      break;
    case 40:
      this.nextRect = {
        'x': snakeHead.x + 1,
        'y': snakeHead.y,
        'body': snakeHead.x + 1 <= this.map.rows - 1 ? this.map.mapArray[snakeHead.x + 1][snakeHead.y] : null
      };
      break;
  }
}

Snake.prototype.stop = function() {
  context.font = 'bold 60px sans-serif';
  context.fillText('Game Over', 140, 200);
  context.font = 'bold 30px sans-serif';
  context.fillText(`Your score is ${this.length}`, 190, 300);
}

const Game = function(map, rapid) {
  this.interval = null;
  this.map = map;
  this.food = new Food(this.map);
  this.snake = new Snake(this.map, this.food, rapid);
}

Game.prototype.start = function() {
  let that = this;
  this.map.draw();
  this.food.generate();
  this.snake.draw();
  this.snake.start = true;
  this.interval = setInterval(function() {
    that.snake.move();
  }, this.snake.rapid);
}

var map = new Map();
var rapid = 200;
var game = null;
map.draw();

$('#container').delegate('input', 'change', function(e) {
  let target = $(e.target);
  let inputClass = target.attr('class');
  if(!game) {
    switch(inputClass) {
      case 'rapid':
        rapid = parseInt(target.value);
        break;
      case 'rows':
        map.rows = parseInt(target[0].value);
        context.clearRect(0, 0, width, height);
        map.draw();
        break;
      case 'cols':
        map.columns = parseInt(target[0].value);
        context.clearRect(0, 0, width, height);
        map.draw();
        break;
    }
  }
});

$('.button').on('click', function(e) {
  game = new Game(map, rapid);
  game.start();
  $('.button').attr('disabled', 'true');
});

document.onkeydown = function(e) {
  let event = e || window.event;
  if(game && game.snake.next) {
    game.snake.next = false;
    switch(event.keyCode) {
      case 37:
        if (game && game.snake.direc != 39) {
          game.snake.direc = 37;
        }
        break;
      case 38:
        if (game && game.snake.direc != 40) {
          game.snake.direc = 38;
        }
        break;
      case 39:
        if (game && game.snake.direc != 37) {
          game.snake.direc = 39;
        }
        break;
      case 40:
        if (game && game.snake.direc != 38) {
          game.snake.direc = 40;
        }
        break;
    }
  }
}
