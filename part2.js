const readlineSync = require('readline-sync');

const characters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

let gameGrid = [];
let ships = [];
let userTargets = [];

const buildGrid = (area) => {
  gameGrid = new Array(area);
  for (let col = 0; col < gameGrid.length; col++) {
    gameGrid[col] = new Array();
    let colCount = 1;
    for (let row = 0; row < gameGrid.length; row++) {
      gameGrid[col].push(characters.at([col]) + colCount);
      colCount++;
    }
  }
  return gameGrid;
};

const placeShips = (shipSize) => {
  const xAxis = Math.floor(Math.random() * 10 + 1);
  const yAxis = characters[Math.floor(Math.random() * characters.length)];
  let shipLocation = [];
  let colIndex = xAxis;
  let rowIndex = characters.indexOf(yAxis);
  // Horizontal Orientation
  if (Math.random() < 0.5) {
    if (colIndex + shipSize > 10) {
      colIndex = 10 - shipSize;
    }
    for (let i = 0; i < shipSize; i++) {
      colIndex++;
      let gridCoord = yAxis + colIndex;
      shipLocation.push(gridCoord);
    }
    // Vertical Orientation
  } else {
    if (rowIndex + shipSize >= 10) {
      rowIndex = 9 - shipSize;
    }
    for (let i = 0; i < shipSize; i++) {
      rowIndex++;
      let gridCoord = characters.at(rowIndex) + xAxis;
      shipLocation.push(gridCoord);
    }
  }
  return shipLocation;
};

const locationValidator = () => {
  const allLocations = ships.map((ship) => ship.location).flat();
  let hasDuplicates = false;
  hasDuplicates = allLocations.some((coord, index) => {
    return allLocations.indexOf(coord) !== index;
  });
  if (hasDuplicates) {
    createShips();
  } else {
    return;
  }
};

class Ship {
  constructor(name, size) {
    this.name = name;
    this.size = size;
    this.alive = true;
    this.location = placeShips(this.size);
    ships.push(this);
  }
}

const createShips = () => {
  ships = [];
  let destroyer = new Ship('Destroyer', 2);
  let cruiser = new Ship('Cruiser', 3);
  let submarine = new Ship('Submarine', 3);
  let battleship = new Ship('Battleship', 4);
  let carrier = new Ship('Aircraft Carrier', 5);
  locationValidator();
};

const startGame = () => {
  if (
    readlineSync.keyIn(
      `Press any key to start the game.
  `,
      { hideEchoBack: true, mask: '' }
    )
  ) {
    buildGrid(10);
    userTargets = [];
    createShips();
    userAttackPrompt();
  }
};

const userAttackPrompt = () => {
  const gridFlat = gameGrid.flat();
  const userAttackInput = readlineSync
    .question(`Enter a location to strike ie 'A2' `, {
      limit: gridFlat,
      limitMessage: `That is not a valid target. Please try again.
      `,
    })
    .toUpperCase();

  if (userTargets.includes(userAttackInput)) {
    console.log(`You have already picked this location. Miss!
    `);
    return userAttackPrompt();
  } else {
    return userAttackHandler(userAttackInput);
  }
};

const userAttackHandler = (userAttackInput) => {
  userTargets.push(userAttackInput);
  let shipHit = false;
  ships.forEach((ship) => {
    if (ship.location.includes(userAttackInput)) {
      shipHit = true;
      ship.size--;
      if (ship.size === 0) {
        ship.alive = false;
        console.log(`You have sunk the enemy ${ship.name}!
        `);
      } else {
        console.log(`You have hit the enemy ${ship.name}!
        `);
      }
    }
  });
  if (!shipHit) {
    console.log(`
You missed!
    `);
  }
  if (ships.every((ship) => ship.alive === false)) {
    return gameEndPrompt();
  } else {
    return userAttackPrompt();
  }
};

const gameEndPrompt = () => {
  if (
    readlineSync.keyInYN(`You have destroyed all battleships. Would you like to play again? Y/N
  `)
  ) {
    return startGame();
  }
};

startGame();
