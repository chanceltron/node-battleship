const readlineSync = require('readline-sync');

const characters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

let gameGrid = [];
let players;

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
buildGrid(10);

class Players {
  constructor() {
    this.userAttackLog = [];
    this.computerAttackLog = [];
    this.userGUI = '';
    this.computerGUI = '';
    this.userShips = [
      { name: 'Destroyer', size: 2, location: [] },
      { name: 'Submarine', size: 3, location: [] },
      { name: 'Cruiser', size: 3, location: [] },
      { name: 'Battleship', size: 4, location: [] },
      { name: 'Carrier', size: 5, location: [] },
    ];
    this.computerShips = [
      { name: 'Destroyer', size: 2, location: [] },
      { name: 'Submarine', size: 3, location: [] },
      { name: 'Cruiser', size: 3, location: [] },
      { name: 'Battleship', size: 4, location: [] },
      { name: 'Carrier', size: 5, location: [] },
    ];
  }

  shipPlacementLogic = (ships) => {
    ships.forEach((ship) => {
      const xAxis = Math.floor(Math.random() * 10 + 1);
      const yAxis = characters[Math.floor(Math.random() * characters.length)];
      let colIndex = xAxis;
      let rowIndex = characters.indexOf(yAxis);
      let shipLocation = [];
      // Horizontal Orientation
      if (Math.random() < 0.5) {
        if (colIndex + ship.size > 10) {
          colIndex = 10 - ship.size;
        }
        for (let i = 0; i < ship.size; i++) {
          colIndex++;
          let gridCoord = yAxis + colIndex;
          shipLocation.push(gridCoord);
        }
        // Vertical Orientation
      } else {
        if (rowIndex + ship.size >= 10) {
          rowIndex = 9 - ship.size;
        }
        for (let i = 0; i < ship.size; i++) {
          rowIndex++;
          let gridCoord = characters.at(rowIndex) + xAxis;
          shipLocation.push(gridCoord);
        }
      }
      ship.location = shipLocation;
    });

    // Check for overlapping ships
    const allLocations = ships.map((ship) => ship.location).flat();
    let hasDuplicates = false;
    hasDuplicates = allLocations.some((coord, index) => {
      return allLocations.indexOf(coord) !== index;
    });
    if (hasDuplicates) {
      this.shipPlacementLogic(ships);
    }
  };

  setShipLocations = () => {
    this.shipPlacementLogic(this.userShips);
    this.shipPlacementLogic(this.computerShips);
  };
}

const newGame = () => {
  readlineSync.keyIn(
    `
  Press any key to start the game.
  `,
    { hideEchoBack: true, mask: '' }
  );
  players = new Players();
  players.setShipLocations();
  userAttackPrompt();
};

const userAttackPrompt = () => {
  console.log(`  It is your turn to attack!`);
  buildUserGUI();
  const gridFlat = gameGrid.flat();
  const attackCoord = readlineSync
    .question(
      `
  Enter a location to strike ie 'A2' 
  `,
      {
        limit: gridFlat,
        limitMessage: `That is not a valid target. Please try again.
    `,
      }
    )
    .toUpperCase();

  if (players.userAttackLog.includes(attackCoord)) {
    console.log(`
  You have already picked this location. Miss!

  -----------------------------------------
  `);
    computerAttackHandler();
  } else {
    userAttackHandler(attackCoord);
  }
};

const userAttackHandler = (attackCoord) => {
  players.userAttackLog.push(attackCoord);
  let shipHit = false;
  players.computerShips.forEach((ship) => {
    if (ship.location.includes(attackCoord)) {
      shipHit = true;
      ship.size--;
      buildUserGUI();
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
    buildUserGUI();
    console.log(`
You have missed the enemy!

-----------------------------------------
    `);
  }
  if (players.computerShips.every((ship) => ship.alive === false)) {
    return gameEndPrompt();
  } else {
    setTimeout(() => {
      computerAttackHandler();
    }, 3000);
  }
};

const buildUserGUI = () => {
  let gameBoard = [];
  gameGrid.forEach((col) => {
    let colArr = [];
    col.forEach((row) => {
      if (players.userAttackLog.includes(row)) {
        if (players.computerShips.some((ship) => ship.location.includes(row))) {
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
  players.userGUI = '';
  players.userGUI += `
    1   2   3   4   5   6   7   8   9   10
  -----------------------------------------`;
  for (let i = 0; i < gameBoard.length; i++) {
    players.userGUI += `
${characters[i]} ${'|'} ${gameBoard[i].join(' | ')} ${'|'}
  -----------------------------------------`;
  }
  console.log(players.userGUI);
};

computerAttackHandler = () => {
  const attackCoord = characters[Math.floor(Math.random() * characters.length)] + Math.floor(Math.random() * 10 + 1);
  if (players.computerAttackLog.includes(attackCoord)) {
    computerAttackHandler();
  } else {
    players.computerAttackLog.push(attackCoord);
    let shipHit = false;
    players.userShips.forEach((ship) => {
      if (ship.location.includes(attackCoord)) {
        shipHit = true;
        ship.size--;
        buildComputerGUI();
        if (ship.size === 0) {
          ship.alive = false;
          console.log(`
  The enemy has sunk your ${ship.name}!

  -----------------------------------------
  `);
        } else {
          console.log(`
  The enemy has hit your ${ship.name}!

  -----------------------------------------
  `);
        }
      }
    });
    if (!shipHit) {
      buildComputerGUI();
      console.log(`
The enemy has missed!

-----------------------------------------
    `);
    }
    if (players.userShips.every((ship) => ship.alive === false)) {
      return gameEndPrompt();
    } else {
      setTimeout(() => {
        userAttackPrompt();
      }, 3000);
    }
  }
};

const buildComputerGUI = () => {
  let gameBoard = [];
  let userShipsFlat = players.userShips.map((ship) => ship.location).flat();
  gameGrid.forEach((col) => {
    let colArr = [];
    col.forEach((coord) => {
      if (players.computerAttackLog.includes(coord)) {
        if (players.userShips.some((ship) => ship.location.includes(coord))) {
          colArr.push('X');
        } else {
          colArr.push('O');
        }
      } else {
        if (userShipsFlat.includes(coord)) {
          colArr.push('M');
        } else {
          colArr.push(' ');
        }
      }
    });
    gameBoard.push(colArr);
  });
  players.computerGUI = '';
  players.computerGUI += `
    1   2   3   4   5   6   7   8   9   10
  -----------------------------------------`;
  for (let i = 0; i < gameBoard.length; i++) {
    players.computerGUI += `
${characters[i]} ${'|'} ${gameBoard[i].join(' | ')} ${'|'}
  -----------------------------------------`;
  }
  console.log(players.computerGUI);
};

const gameEndPrompt = () => {
  if (
    readlineSync.keyInYN(`You have destroyed all battleships. Would you like to play again? Y/N
  `)
  ) {
    return newGame();
  }
};

newGame();
