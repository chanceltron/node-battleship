const readlineSync = require('readline-sync');

const characters = 'ABCDEFGHIJ';

let gameGrid = [];
let ships = [];
let currentShipLocations = [];
let userTargets = [];

const buildGrid = (area) => {
  gameGrid = new Array(area);
  for (let i = 0; i < gameGrid.length; i++) {
    gameGrid[i] = new Array();
    let colCount = 1;
    for (let j = 0; j < gameGrid.length; j++) {
      gameGrid[i].push(characters.charAt([i]) + colCount);
      colCount++;
    }
  }
  return gameGrid;
};
buildGrid(3);

const gridSquares = gameGrid.flat(1);
const randomGridLocation = () => gridSquares[Math.floor(Math.random() * gridSquares.length)];

const locationValidator = () => {
  const [ship1, ship2] = ships;
  if (ship1.location.toString() === ship2.location.toString()) {
    console.log(ships);
    createShips();
  }
};

class Ship {
  constructor(name, size, alive) {
    this.name = name;
    this.size = size;
    this.alive = alive;
    this.location = [randomGridLocation()];
    currentShipLocations.push(...this.location);
    ships.push(this);
  }
}

const createShips = () => {
  ships = [];
  new Ship('Ship 1', 1, true);
  new Ship('Ship 2', 1, true);
  locationValidator();
};

const startGame = () => {
  if (readlineSync.keyIn('Press any key to start the game. ', { hideEchoBack: true, mask: '' })) {
    userTargets = [];
    createShips();
    userAttackPrompt();
  }
};

const gameEndPrompt = () => {
  if (readlineSync.keyInYN('You have destroyed all battleships. Would you like to play again? Y/N')) {
    return startGame();
  }
};

const userAttackHandler = (userAttackInput) => {
  userTargets.push(userAttackInput);
  if (currentShipLocations.includes(userAttackInput)) {
    for (let i = 0; i < currentShipLocations.length; i++) {
      if (currentShipLocations[i] === userAttackInput) {
        currentShipLocations.splice(i, 1);
        console.log(`Hit! You sunk a battleship! There is ${currentShipLocations.length} ship left.`);
        if (currentShipLocations.length === 0) {
          return gameEndPrompt();
        } else {
        }
      }
    }
  } else {
    console.log('Miss!');
  }
  return userAttackPrompt();
};

const userAttackPrompt = () => {
  const userAttackInput = readlineSync
    .question(`Enter a location to strike ie 'A2' `, {
      limit: gridSquares,
      limitMessage: 'That is not a valid target. Please try again.',
    })
    .toUpperCase();

  if (userTargets.includes(userAttackInput)) {
    console.log('You have already picked this location. Miss!');
    return userAttackPrompt();
  } else {
    return userAttackHandler(userAttackInput);
  }
};

startGame();
