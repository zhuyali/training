'use strict';

const canvas = document.getElementById('cv');
const context = canvas.getContext('2d');
context.strokeStyle = '#eee';
const width = parseInt(canvas.getAttribute('width'));
const height = parseInt(canvas.getAttribute('height'));

const randomRect = function(xMax = map.columns + 1, yMax = map.rows + 1, min = 1) {
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

const Map = function(rows = 40, columns = 40) {
  this.rows = rows; //网格行数
  this.columns = columns; //网格列数
  this.rectWidth = width / this.columns; //每个网格的宽度
  this.rectHeight = height / this.rows; //每个网格的高度
  this.mapArray = new Array(this.rows); //网格数组
}

Map.prototype.init = function() {
  this.mapArray = new Array(this.rows);
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

const Food = function() {
  this.x = 0;
  this.y = 0;
}

Food.prototype.generate = function() {
  let coordinate, x, y, rect;
  do {
    coordinate = randomRect();
    x = coordinate.x;
    y = coordinate.y;
    rect = map.mapArray[x][y];
  }
  while(rect.isSnake);
  rect.isFood = true;
  context.fillStyle = '#eee';
  context.fillRect(rect.x + 0.5, rect.y + 0.5, map.rectWidth - 1, map.rectHeight - 1);
}

const Snake = function() {
  this.length = 1; //身体长度
  this.bodyArray = [];
  this.direc = 39;//37-左，38-上，39-右，40-下
  this.nextRect = null;
  this.rapid = 200;
  this.start = false;
}

Snake.prototype.init = function() {
  let coordinate = randomRect(map.columns, map.rows, 2);
  let x = coordinate.x;
  let y = coordinate.y;
  map.mapArray[x][y].isSnake = true;
  this.bodyArray.push({'x':x, 'y':y, 'body':map.mapArray[x][y]});
}

Snake.prototype.draw = function() {
  this.init();
  context.fillStyle = '#000';
  for(let i = 0; i < this.bodyArray.length; i++) {
    let body = this.bodyArray[i].body;
    context.fillRect(body.x + 0.5, body.y + 0.5, map.rectWidth - 1, map.rectHeight - 1);
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
      food.generate();
      context.clearRect(rect.x + 0.5, rect.y + 0.5, map.rectWidth - 1, map.rectHeight - 1);
      context.fillStyle = '#000';
      context.fillRect(rect.x + 0.5, rect.y + 0.5, map.rectWidth - 1, map.rectHeight - 1);
    } else if(rect.isSnake) {
      this.stop();
      clearInterval(interval);
    } else {
      this.bodyArray.splice(0, 0, {'x':this.nextRect.x, 'y':this.nextRect.y, 'body':rect});
      let tail = this.bodyArray.pop();
      let tailRect = map.mapArray[tail.x][tail.y];
      tailRect.isSnake = false;
      rect.isSnake = true;
      context.clearRect(tailRect.x + 0.5, tailRect.y + 0.5, map.rectWidth - 1, map.rectHeight - 1);
      context.fillRect(rect.x + 0.5, rect.y + 0.5, map.rectWidth - 1, map.rectHeight - 1);
    }
  } else {
    this.stop();
    clearInterval(interval);
  }
}

Snake.prototype.nextStep = function() {
  let snakeHead = this.bodyArray[0];
  switch(this.direc) {
    case 37:
      this.nextRect = {
        'x': snakeHead.x,
        'y': snakeHead.y - 1,
        'body': snakeHead.y - 1 >= 0 ? map.mapArray[snakeHead.x][snakeHead.y - 1] : null
      };
      break;
    case 38:
      this.nextRect = {
        'x': snakeHead.x - 1,
        'y': snakeHead.y,
        'body': snakeHead.x - 1 >= 0 ? map.mapArray[snakeHead.x - 1][snakeHead.y] : null
      };
      break;
    case 39:
      this.nextRect = {
        'x': snakeHead.x,
        'y': snakeHead.y + 1,
        'body': snakeHead.y + 1 <= map.columns - 1 ? map.mapArray[snakeHead.x][snakeHead.y + 1] : null
      };
      break;
    case 40:
      this.nextRect = {
        'x': snakeHead.x + 1,
        'y': snakeHead.y,
        'body': snakeHead.x + 1 <= map.rows - 1 ? map.mapArray[snakeHead.x + 1][snakeHead.y] : null
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

var interval = null;
var redrawMap = false;
var map = new Map();
const food = new Food();
const snake = new Snake();
map.draw();

$('#container').delegate('input', 'change', function(e) {
  let target = $(e.target);
  let inputClass = target.attr('class');
  if(!snake.start) {
    switch(inputClass) {
      case 'rapid':
        snake.rapid = parseInt(target.value);
        break;
      case 'rows':
        map.rows = parseInt(target[0].value);
        redrawMap = true;
        break;
      case 'cols':
        map.columns = parseInt(target[0].value);
        redrawMap = true;
        break;
    }
  }
});

$('.button').on('click', function(e) {
  context.clearRect(0, 0, width, height);
  map = new Map(map.rows, map.columns);
  map.draw();
  food.generate();
  snake.draw();
  snake.start = true;
  interval = setInterval(function() {
    snake.move();
  }, snake.rapid);
  $('.button').attr('disabled', 'true');
});

document.onkeydown = function(e) {
  let event = e || window.event;
  switch(event.keyCode) {
    case 37:
      if (snake.direc != 39) {
        snake.direc = 37;
      }
      break;
    case 38:
      if (snake.direc != 40) {
        snake.direc = 38;
      }
      break;
    case 39:
      if (snake.direc != 37) {
        snake.direc = 39;
      }
      break;
    case 40:
      if (snake.direc != 38) {
        snake.direc = 40;
      }
      break;
  }
}