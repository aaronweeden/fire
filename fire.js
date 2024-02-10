// Forest fire simulation
// Author: Aaron Weeden, Shodor, 2016-2018

const BURN_CHANCE = 50; // Burn chance (0-100)
const TREE_COUNT_X = 20; // # of trees in x direction
const TREE_COUNT_Y = 20; // # of trees in y direction
const NON_BURNING_STATE = { outline: "black", fill: "green" };
const BURNING_STATE = { outline: "black", fill: "red" };
const BURNT_STATE = { outline: "black", fill: "gray" };
const INTERVAL_MILLIS = 100; // Number of milliseconds between time steps
const CANVAS_WIDTH = 300; // Pixel width of canvas
const CANVAS_HEIGHT = 300; // Pixel height of canvas
const TREE_WIDTH = CANVAS_WIDTH / TREE_COUNT_X; // Pixel width of each tree
const TREE_HEIGHT = CANVAS_HEIGHT / TREE_COUNT_Y; // Pixel height of each tree

var Trees; // 2D array of tree objects
var InitBurnX; // x position of initially-burning tree
var InitBurnY; // y position of initially-burning tree
var Canvas; // DOM canvas
var Context; // DOM canvas drawing context
var PlayPauseButton; // DOM play/pause button
var StepButton; // DOM step button
var IntervalID; // Time interval ID

onload = function () {
  storeDOMObjs();
  reset();
};

function storeDOMObjs() {
  Canvas = document.getElementById("canvas");
  Canvas.width = CANVAS_WIDTH;
  Canvas.height = CANVAS_HEIGHT;
  Context = Canvas.getContext("2d");
  PlayPauseButton = document.getElementById("button-play-pause");
  StepButton = document.getElementById("button-step");
}

function reset() {
  pause();
  resetTrees();
  draw();
}

function pause() {
  PlayPauseButton.innerHTML = "Play";
  PlayPauseButton.onclick = play;
  StepButton.disabled = false;
  clearInterval(IntervalID);
}

function resetTrees() {
  InitBurnX = randIntInRange(1, TREE_COUNT_X - 1);
  InitBurnY = randIntInRange(1, TREE_COUNT_Y - 1);
  Trees = [];
  for (let x = 0; x < TREE_COUNT_X; x++) {
    Trees.push([]);
    for (let y = 0; y < TREE_COUNT_Y; y++) {
      const tree = {
        x: x,
        y: y
      };
      Trees[x].push(tree);
      setTreeState(tree);
    }
  }
}

function draw() {
  clearCanvas();
  drawTrees();
}

function play() {
  PlayPauseButton.innerHTML = "Pause";
  PlayPauseButton.onclick = pause;
  StepButton.disabled = true;
  IntervalID = setInterval(step, INTERVAL_MILLIS);
}

function randIntInRange(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

function setTreeState(tree) {
  if (isOnBorder(tree)) {
    tree.currentState = BURNT_STATE;
  } else if (isInitBurning(tree)) {
    tree.currentState = BURNING_STATE;
  } else {
    tree.currentState = NON_BURNING_STATE;
  }

  // Make a copy of the tree's state, because when we advance the model,
  // we don't want to update a tree's state until its neighbors have had a
  // chance to check it.
  tree.nextState = tree.currentState;
}

function clearCanvas() {
  Context.clearRect(0, 0, Canvas.width, Canvas.height);
}

function drawTrees() {
  for (let x = 0; x < TREE_COUNT_X; x++) {
    drawTreesInX(x);
  }
}

function step() {
  setNextStates();
  advance();
  draw();
}

function isOnBorder(tree) {
  return (
    isInLeftBorderColumn(tree)
    || isInTopBorderRow(tree)
    || isInRightBorderColumn(tree)
    || isInBottomBorderRow(tree)
  );
}

function isInitBurning(tree) {
  return tree.x === InitBurnX && tree.y === InitBurnY;
}

function drawTreesInX(x) {
  const left = x * TREE_WIDTH;
  for (let y = 0; y < TREE_COUNT_Y; y++) {
    const top = y * TREE_HEIGHT;
    setDrawingColors(Trees[x][y]);
    Context.fillRect(left, top, TREE_WIDTH, TREE_HEIGHT);
    Context.strokeRect(left, top, TREE_WIDTH, TREE_HEIGHT);
  }
}

function setNextStates() {
  for (let x = 1; x < TREE_COUNT_X - 1; x++) {
    for (let y = 1; y < TREE_COUNT_Y - 1; y++) {
      setNextState(Trees[x][y]);
    }
  }
}

function advance() {
  for (let x = 1; x < TREE_COUNT_X - 1; x++) {
    for (let y = 1; y < TREE_COUNT_Y - 1; y++) {
      Trees[x][y].currentState = Trees[x][y].nextState;
    }
  }
}

function isInLeftBorderColumn(tree)  { return tree.x === 0; }
function isInTopBorderRow(tree)      { return tree.y === 0; }
function isInRightBorderColumn(tree) { return tree.x === TREE_COUNT_X - 1; }
function isInBottomBorderRow(tree)   { return tree.y === TREE_COUNT_Y - 1; }

function setDrawingColors(tree) {
  Context.fillStyle = tree.currentState.fill;
  Context.strokeStyle = tree.currentState.outline;
}

function setNextState(tree) {
  if (tree.currentState === BURNING_STATE) {
    tree.nextState = BURNT_STATE;
  } else {
    tree.nextState = tree.currentState;
  }
  if (tree.nextState === NON_BURNING_STATE) {
    trySpread(tree);
  }
}

function trySpread(tree) {
  if (
    spreadFromTop(tree)
    || spreadFromLeft(tree)
    || spreadFromRight(tree)
    || spreadFromBottom(tree)
  ) {
    tree.nextState = BURNING_STATE;
  }
}

function spreadFromTop(tree)    { return spread(tree.x,     tree.y - 1); }
function spreadFromLeft(tree)   { return spread(tree.x - 1, tree.y    ); }
function spreadFromBottom(tree) { return spread(tree.x,     tree.y + 1); }
function spreadFromRight(tree)  { return spread(tree.x + 1, tree.y    ); }

function spread(x, y) {
  return Trees[x][y].currentState === BURNING_STATE && burnChanceHappens();
}

function burnChanceHappens() { return randIntInRange(0, 100) < BURN_CHANCE; }
