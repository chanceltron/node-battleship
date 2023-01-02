const readlineSync = require('readline-sync');

const characters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

let gameGrid = [];
let consoleGUI = '';
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

const gameGUI = () => {
  let gameBoard = [];
  gameGrid.forEach((col) => {
    let colArr = [];
    col.forEach((row) => {
      if (userTargets.includes(row)) {
        if (ships.some((ship) => ship.location.includes(row))) {
          colArr.push('X');
        } else {
          colArr.push('O');
        }
      } else {
        colArr.push(' ');
      }
    });
    gameBoard.push(colArr);
  });
  consoleGUI = '';
  consoleGUI += `
    1   2   3   4   5   6   7   8   9   10
  -----------------------------------------`;
  for (let i = 0; i < gameBoard.length; i++) {
    consoleGUI += `
${characters[i]} ${'|'} ${gameBoard[i].join(' | ')} ${'|'}
  -----------------------------------------`;
  }
  console.log(consoleGUI);
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

const locationValidator = () => {};

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
      gameGUI();
      if (ship.size === 0) {
        ship.alive = false;
        console.log(`
  You have sunk the enemy ${ship.name}!
  -----------------------------------------
  `);
      } else {
        console.log(`
  You have hit an enemy ship!
  -----------------------------------------
  `);
      }
    }
  });
  if (!shipHit) {
    gameGUI();
    console.log(`
  You have missed the enemy!

  -----------------------------------------
    `);
  }
  if (ships.every((ship) => ship.alive === false)) {
    return gameEndPrompt();
  } else {
    return userAttackPrompt();
  }
};

startGame();
