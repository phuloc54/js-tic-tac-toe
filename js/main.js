import { CELL_VALUE, GAME_STATUS, TURN } from './constants.js';
import {
  getCellElementAtIdx,
  getCellElementList,
  getCurrentTurnElement,
  getGameStatusElement,
  getReplayButton,
} from './selectors.js';
import { checkGameStatus } from './utils.js';

/**
 * Global variables
 */
let currentTurn = TURN.CROSS;
let isGameEnded = false;
let cellValues = new Array(9).fill('');

/**
 * TODOs
 *
 * 1. Bind click event for all cells
 * 2. On cell click, do the following:
 *    - Toggle current turn
 *    - Mark current turn to the selected cell
 *    - Check game state: win, ended or playing
 *    - If game is win, highlight win cells
 *    - Not allow to re-click the cell having value.
 *
 * 3. If game is win or ended --> show replay button.
 * 4. On replay button click --> reset game to play again.
 *
 */

function toggleTurn() {
  // toggle turn
  currentTurn = currentTurn === TURN.CROSS ? TURN.CIRCLE : TURN.CROSS;
  // Update "currentTurn status" on DOM
  const currentTurnElement = getCurrentTurnElement();
  if (!currentTurnElement) return;
  currentTurnElement.classList.remove(TURN.CROSS, TURN.CIRCLE);
  currentTurnElement.classList.add(currentTurn);
}

function updateGameStatus(newGameStatus) {
  const gameStatusElement = getGameStatusElement();

  if (gameStatusElement) return (gameStatusElement.textContent = newGameStatus);
}

function showReplayButton() {
  const replayButtonElement = getReplayButton();
  if (replayButtonElement) {
    replayButtonElement.classList.add('show');
  }
}

function hideReplayButton() {
  const replayButtonElement = getReplayButton();
  if (replayButtonElement) {
    replayButtonElement.classList.remove('show');
  }
}

function highlightWinCells(winnerPositions) {
  if (!Array.isArray(winnerPositions) || winnerPositions.length !== 3) {
    throw new Error('Invalid winner positions');
  }

  winnerPositions.forEach((i) => {
    const cellElement = getCellElementAtIdx(i);
    if (cellElement) cellElement.classList.add('win');
  });
}

function handleCellClick(cell, index) {
  const isClicked = cell.classList.contains(TURN.CIRCLE) || cell.classList.contains(TURN.CROSS);

  // Only allow to click if game is playing and that cell is not clicked yet
  if (isClicked || isGameEnded) return;

  // set selected cell - on DOM
  cell.classList.add(currentTurn);

  // update to cell values
  cellValues[index] = currentTurn === TURN.CROSS ? CELL_VALUE.CROSS : CELL_VALUE.CIRCLE;

  // toggle turn
  toggleTurn();

  // check game status
  const game = checkGameStatus(cellValues);

  switch (game.status) {
    case GAME_STATUS.ENDED: {
      isGameEnded = true;
      updateGameStatus(GAME_STATUS.ENDED);
      showReplayButton();
      break;
    }

    case GAME_STATUS.X_WIN:
    case GAME_STATUS.O_WIN: {
      isGameEnded = true;
      updateGameStatus(game.status);
      showReplayButton();
      highlightWinCells(game.winPositions);
      break;
    }
    default:
  }
}

function initCellElementList() {
  const cellElementList = getCellElementList();
  cellElementList.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(cell, index));
  });
}

function resetGame() {
  // reset temp global vars
  currentTurn = TURN.CROSS;
  isGameEnded = false;
  cellValues = cellValues.map(() => '');

  // reset dom element:
  // 1. reset game status
  updateGameStatus(GAME_STATUS.PLAYING);

  // 2. reset game board
  const cellElementList = getCellElementList();
  if (cellElementList) {
    for (const cell of cellElementList) {
      cell.className = '';
    }
  }

  // 3. reset current turn
  // 'Status show above the board table game'
  const currentTurnElement = getCurrentTurnElement();
  if (currentTurnElement) {
    currentTurnElement.classList.remove(TURN.CIRCLE, TURN.CROSS);
    currentTurnElement.classList.add(currentTurn);
  }

  // 4. hide replay button
  hideReplayButton();
}

function initReplayButton() {
  const replayButtonElement = getReplayButton();
  if (replayButtonElement) {
    replayButtonElement.addEventListener('click', resetGame);
  }
}

(() => {
  // Bind click event for all li element
  initCellElementList();

  // Bind click event for replace button
  initReplayButton();
})();
