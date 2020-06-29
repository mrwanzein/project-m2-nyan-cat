// Game instructions
let instruction = setInterval(() => {
  alert(`Instructions
1. Arrows to move left and right
2. Spacebar to shoot
3. You can only shoot when a bullet disappeared e.g: bullet out of bounds or hit cat
`);
  clearTimeout(instruction);
}, 200);

// DOM references and creations
const root = document.getElementById('app');
const uiDiv = document.createElement('div');
const uiDivFlex = document.createElement('div');
const score = document.createElement('span');
const lives = document.createElement('span');
const gameOver = document.createElement('span');

uiDiv.setAttribute('class', 'UI');
uiDivFlex.setAttribute('class', 'uiDivFlex');
lives.setAttribute('class', 'lives');

// We create an instance of the Engine class. Looking at our index.html,
// we see that it has a div with an id of `"app"`
const gameEngine = new Engine(root);

score.innerHTML = `SCORE: ${gameEngine.player.score}`;
score.style.fontFamily = 'Orbitron, sans-serif';
score.style.fontSize = '3em';

gameOver.style.position = 'absolute';
gameOver.style.left = `60px`;
gameOver.style.top = `${(GAME_HEIGHT / 2) - 40}px`;
gameOver.style.color = 'red';
gameOver.style.fontFamily = 'Orbitron, sans-serif';
gameOver.style.fontSize = '2em';
gameOver.innerHTML = 'GAME OVER';
gameOver.style.display = 'none';
gameOver.style.zIndex = '101';

// keydownHandler is a variable that refers to a function. The function has one parameter
// (does the parameter name matter?) which is called event. As we will see below, this function
// will be called every time the user presses a key. The argument of the function call will be an object.
// The object will contain information about the key press, such as which key was pressed.
const keydownHandler = (event) => {
  // event.code contains a string. The string represents which key was press. If the
  // key is left, then we call the moveLeft method of gameEngine.player (where is this method defined?)
  if (event.code === 'ArrowLeft') {
    gameEngine.player.moveLeft();
  }
  
  // If `event.code` is the string that represents a right arrow keypress,
  // then move our hamburger to the right
  if (event.code === 'ArrowRight') {
    gameEngine.player.moveRight();
  }
  
  if (event.code === 'Space') {
    gameEngine.player.shootBullet();
  }
};

// We add an event listener to document. document the ancestor of all DOM nodes in the DOM.
document.addEventListener('keydown', keydownHandler);

// Creating a play button
const playButton = document.createElement('button');
playButton.setAttribute('class', 'play');
playButton.innerHTML = 'Play'
playButton.style.visibility = 'unset';

// Creating restart button
const resetButton = document.createElement('button');
resetButton.setAttribute('class', 'reset');
resetButton.innerHTML = 'Restart';

// Appending multiple element that give info about the game
root.append(uiDiv);
root.append(gameOver);
uiDiv.append(uiDivFlex);
uiDivFlex.append(score);
uiDivFlex.append(lives);

for(let i=0; i<3; i++) {
  let life = document.createElement('img');
  life.src = './images/player.png';
  gameEngine.player.lives.push(life);
  lives.append(life);
}

uiDivFlex.append(playButton);
uiDivFlex.append(resetButton);


const startGame = () => {
  gameEngine.gameLoop();
  playButton.style.visibility = 'hidden';
}

const restartGame = () => {
  gameEngine.gameLoop();
  resetButton.style.visibility = 'hidden';
  gameOver.style.display = 'none';
  gameEngine.player.score = 0;
}

// Event listeners to our buttons to start and restart the game
playButton.addEventListener('click', startGame);
resetButton.addEventListener('click', restartGame);
