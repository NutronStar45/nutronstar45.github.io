/**
 * Write status to `textarea#game-status`
 * @param {string} text The text to write
 * @param {string[]} status The current status
 * @returns {string[]} The updated status
 */
function writeStatus(text, status) {
  if (status.length < 4) {
    status.push(text);
  } else {
    status[0] = status[1];
    status[1] = status[2];
    status[2] = status[3];
    status[3] = text;
  }
  $("textarea#game-status").text(status.join("\n"));
  return status;
}


/**
 * Write `<player>'s turn` to `textarea#game-status`
 * @param {string} type `pvp` or `pvc`
 * @param {number} turn `0` if it's Player 1's or Player's turn, `1` if it's Player 2's or Computer's turn
 * @param {string[]} status The current status
 * @returns {string[]} The updated status
 */
function writeStatusTurn(type, turn, status) {
  if (type === "pvp") {
    if (turn === 0)
      return writeStatus("Player 1's turn", status);
    else
      return writeStatus("Player 2's turn", status);
  } else {
    if (turn === 0)
      return writeStatus("Player's turn", status);
    else
      return writeStatus("Computer's turn", status);
  }
}


/**
 * Write `<player> removes <amount> object(s) from heap <heap #>` to `textarea#game-status`
 * @param {string} type `pvp` or `pvc`
 * @param {number} turn `0` if it's Player 1's or Player's turn, `1` if it's Player 2's or Computer's turn
 * @param {number} amount The amount of objects removed from the heap
 * @param {number} heap The index of the heap
 * @param {string[]} status The current status
 * @returns {string[]} The updated status
 */
function writeStatusRemove(type, turn, amount, heap, status) {
  if (type === "pvp") {
    if (turn === 0)
      return writeStatus(
        `Player 1 removes ${amount} object${amount>1 ? "s" : ""} from heap ${heap+1}`,
        status);
    else
      return writeStatus(
        `Player 2 removes ${amount} object${amount>1 ? "s" : ""} from heap ${heap+1}`,
        status);
  } else {
    if (turn === 0)
      return writeStatus(
        `Player removes ${amount} object${amount>1 ? "s" : ""} from heap ${heap+1}`,
        status);
    else
      return writeStatus(
        `Computer removes ${amount} object${amount>1 ? "s" : ""} from heap ${heap+1}`,
        status);
  }
}


/**
 * Write the result to `textarea#game-status` \
 * Parameters are before switching turns
 * @param {string} type `pvp` or `pvc`
 * @param {string} mode `normal` or `misere`
 * @param {number} turn `0` if it's Player 1's or Player's turn, `1` if it's Player 2's or Computer's turn
 * @param {string[]} status The current status
 * @returns {string[]} The updated status
 */
function writeStatusWin(type, mode, turn, status) {
  if (type === "pvp") {
    if (mode === "normal") {
      if (turn === 0) {
        // pvp, normal, Player 1's turn
        status = writeStatus("Player 1 wins", status);
      } else {
        // pvp, normal, Player 2's turn
        status = writeStatus("Player 2 wins", status)
      }
    } else {
      if (turn === 0) {
        // pvp, misere, Player 1's turn
        status = writeStatus("Player 2 wins", status);
      } else {
        // pvp, misere, Player 2's turn
        status = writeStatus("Player 1 wins", status)
      }
    }
  } else {
    if (mode === "normal") {
      if (turn === 0) {
        // pvc, normal, Player's turn
        status = writeStatus("Player wins", status);
      } else {
        // pvc, normal, Computer's turn
        status = writeStatus("Computer wins", status)
      }
    } else {
      if (turn === 0) {
        // pvc, misere, Player's turn
        status = writeStatus("Computer wins", status);
      } else {
        // pvc, misere, Computer's turn
        status = writeStatus("Player wins", status)
      }
    }
  }
  return status;
}


/**
 * Update `div#game` and write to `span#remove-object-event` \
 * heapSizes(,);turn;status(,);remainingHeaps(,)
 * @param {string} type `pvp` or `pvc`
 * @param {string} mode `normal` or `misere`
 * @param {number[]} heapSizes Sizes of heaps
 * @param {string} difficulty `easy`, `medium`, `hard`, or `extreme`
 * @param {number} turn `0` if it's Player 1's or Player's turn, `1` if it's Player 2's or Computer's turn
 * @param {string[]} status The current status
 * @param {number[]} remainingHeaps The indices of the remaining heaps
 */
function updateGame(type, mode, heapSizes, difficulty, turn, status, remainingHeaps) {
  $("div#game").empty();
  let circleSvg = '<svg width="20" height="20"><circle cx="10" cy="10" r="10" fill="white"/></svg>';

  for (let heapSize of heapSizes) {
    let heapDiv = $('<div class="heap"></div>');
    heapDiv.append($(circleSvg.repeat(heapSize)));
    heapDiv.append('<svg width="20" height="20" class="placeholder"></svg>');
    $("div#game").append(heapDiv);
  }

  // click event handler for objects
  $("div.heap svg:not(.placeholder)").click(function () {
    if (type === "pvp" || turn === 0) {
      let heapIndex = $(this).parent().index();
      let objectIndex = $(this).index();
      let removeAmount = heapSizes[heapIndex] - objectIndex;

      heapSizes[heapIndex] = objectIndex;
      if (objectIndex === 0) {
        remainingHeaps.remove(heapIndex);
      }
      status = writeStatusRemove(type, turn, removeAmount, heapIndex, status);
      if (type === "pvp") {
        if (remainingHeaps.length > 0) {
          // switch turns
          turn = 1 - turn;
          status = writeStatusTurn("pvp", turn, status);
        } else {
          // write result
          status = writeStatusWin(type, mode, turn, status);
        }
      } else {
        if (remainingHeaps.length > 0) {
          // switch turns
          turn = 1;
          status = writeStatusTurn("pvc", 1, status);
          // Computer plays
          [heapSizes, remainingHeaps, status]
          = computer(type, mode, heapSizes, difficulty, turn, status, remainingHeaps);
          if (remainingHeaps.length > 0) {
            //switch turns
            turn = 0
            status = writeStatusTurn("pvc", 0, status);
          } else {
            // write result
            status = writeStatusWin("pvc", mode, 1, status);
          }
        } else {
          // write result
          status = writeStatusWin("pvc", mode, 0, status);
        }
      }
    }
    $("span#remove-object-event").text(`${heapSizes.join(",")};${turn};${status.join(",")};${remainingHeaps.join(",")}`);
    $("span#remove-object-event").change(); // trigger change event
    updateGame(type, mode, heapSizes, difficulty, turn, status, remainingHeaps);
  });
}


/**
 * Set up the game
 * @param {string} type `pvp` or `pvc`
 * @param {string} mode `normal` or `misere`
 * @param {number[]} heapSizes Sizes of heaps
 * @param {string} difficulty `easy`, `medium`, `hard`, or `extreme`
 * @param {string} first `player` or `computer`
 * @param {string[]} status The current status
 * @param {number[]} remainingHeaps The indices of the remaining heaps
 * @returns {[number, string[]]} The first element is `0` if it's Player 1's or Player's turn, `1` if it's Player 2's or Computer's turn \
 * The second element is the updated status
 */
function gameSetup(type, mode, heapSizes, difficulty, first, status, remainingHeaps) {
  // 0: Player 1 or Player
  // 1: Player 2 or Computer
  let turn = (type === "pvp" || first === "player") ? 0 : 1;
  updateGame(type, mode, heapSizes, difficulty, turn, status, remainingHeaps);
  status = writeStatus("Game initialized", status);
  return [turn, status];
}


/**
 * Computer plays a random move
 * @param {string} type `pvp` or `pvc`
 * @param {string} mode `normal` or `misere`
 * @param {number[]} heapSizes Sizes of heaps
 * @param {string} difficulty `easy`, `medium`, `hard`, or `extreme`
 * @param {number} turn `0` if it's Player 1's or Player's turn, `1` if it's Player 2's or Computer's turn
 * @param {string[]} status The current status
 * @param {number[]} remainingHeaps The indices of the remaining heaps
 * @returns {[number[], number[], string[]]} The first element is the updated heap sizes \
 * The second element is the indices of the remaining heaps \
 * The third element is the updated status
 */
function computerRandom(type, mode, heapSizes, difficulty, turn, status, remainingHeaps) {
  let choosingFromHeap = remainingHeaps.random(); // choose from this heap
  let objectsOfHeap = heapSizes[choosingFromHeap]; // how many objects are in the heap
  let removeAmount = Math.floor(Math.random() * objectsOfHeap) + 1; // remove this much objects from the heap

  heapSizes[choosingFromHeap] -= removeAmount;
  updateGame(type, mode, heapSizes, difficulty, turn, status, remainingHeaps);
  if (heapSizes[choosingFromHeap] === 0) {
    remainingHeaps.remove(choosingFromHeap);
  }
  status = writeStatusRemove("pvc", 1, removeAmount, choosingFromHeap, status)
  return [heapSizes, remainingHeaps, status];
}


/**
 * Computer plays
 * @param {string} type `pvp` or `pvc`
 * @param {string} mode `normal` or `misere`
 * @param {number[]} heapSizes Sizes of heaps
 * @param {string} difficulty `easy`, `medium`, `hard`, or `extreme`
 * @param {number} turn `0` if it's Player 1's or Player's turn, `1` if it's Player 2's or Computer's turn
 * @param {string[]} status The current status
 * @param {number[]} remainingHeaps The indices of the remaining heaps
 * @returns {[number[], number[], string[]]} The first element is the updated heap sizes \
 * The second element is the indices of the remaining heaps \
 * The third element is the updated status
 */
function computer(type, mode, heapSizes, difficulty, turn, status, remainingHeaps) {
  if (difficulty === "easy") {
    return computerRandom(type, mode, heapSizes, difficulty, turn, status, remainingHeaps);
  }
  //TODO add more difficulty options
}


$(() => {
  $("div#pvc-only").hide();
  $("select#type").change(function () {
    if ($(this).val() === "pvp") {
      $("div#pvc-only").hide();
      $("div#pvc-only").after("<br>");
    } else {
      $("div#pvc-only").show();
      $("div#pvc-only").next().remove();
    }
  });

  let type; // pvp, pvc
  let mode; // normal, misere
  let heapSizes; // heap sizes in the format of [3, 4, 5]
  let difficulty; // easy, medium, hard, extreme
  let first; // player, computer

  let turn; // 0: Player 1 / Player, 1: Player 2 / Computer
  let status = []; // game status, max 4 lines
  let remainingHeaps; // indices of all remaining heaps

  $("button#play").click(() => {
    if (validate(["input#heap-sizes"])) {
      type = $("select#type").val();
      mode = $("select#mode").val();
      heapSizes = $("input#heap-sizes").val()
        .replace(/ /g, "")
        .split(",")
        .map(val => +val);
      difficulty = $("select#difficulty").val();
      first = $("select#first").val();

      remainingHeaps = [...heapSizes.keys()]; // indices of all remaining heaps

      [turn, status] = gameSetup(type, mode, heapSizes, difficulty, first, status, remainingHeaps); // set up the game
      status = writeStatusTurn(type, turn, status); // write turn

      if (type === "pvc" && turn === 1) {
        // Computer plays
        [heapSizes, remainingHeaps, status]
          = computer(type, mode, heapSizes, difficulty, turn, status, remainingHeaps);
        // Player's turn
        status = writeStatusTurn("pvc", 0, status);
        turn = 0;
      }
    }
  });

  // heapSizes(,);turn;status(,);remainingHeaps(,)
  $("span#remove-object-event").change(function () {
    let content = $(this).text().split(";");
    heapSizes = content[0].split(",").map(heapSize => +heapSize);
    turn = +content[1];
    status = content[2].split(",");
    remainingHeaps = content[3].split().map(remainingHeap => +remainingHeap);
  });
});
