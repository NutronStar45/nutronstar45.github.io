// Type `Maze` is defined in maze.js

importScripts("/scripts/common_util.js");


postMessage({ msg: "ready" });

addEventListener("message", e => {
    switch (e.data.msg) {
        // Generate maze
        case "gen":
            postMessage({ msg: "gen", maze: generateMaze(e.data.width, e.data.height) });
            break;

        // Calculate solution
        case "solve":
            let { squaresSolution, squaresEndpoints } = calculateSolution(e.data.maze, e.data.start, e.data.end);
            postMessage({ msg: "solve", squaresSolution, squaresEndpoints });
            break;

        // Unknown message
        default:
            console.error("Worker received unknown message:", e);
    }
});


/**
 * Returns squares adjacent to the square `square`.
 * @param {number} square A square.
 * @param {number[] | null} filter Squares won't be returned if they're not in this array
 * @param {number} width The width of the maze.
 * @param {number} height The height of the maze.
 * @returns {{ index: number, dir: string }[]} The adjacent squares around `square`. `index` is the index of the square, and `dir` is the direction, which can be one of `"horizontal"` and `"vertical"`.
 */
function getNeighbors(square, filter, width, height) {
    let neighbors = [];

    if (square % width !== 0) neighbors.push({ index: square - 1, dir: "horizontal" });             // Left
    if ((square + 1) % width !== 0) neighbors.push({ index: square + 1, dir: "horizontal" });       // Right
    if (square >= width) neighbors.push({ index: square - width, dir: "vertical" });                // Top
    if (square < width * (height - 1)) neighbors.push({ index: square + width, dir: "vertical" });  // Bottom

    if (filter) {
        return neighbors.filter(neighbor => filter.includes(neighbor.index));
    } else {
        return neighbors;
    }
}


/**
 * returns in which directions a given square is connected to.
 * @param {number} square The square whose connectedness is checked.
 * @param {Maze} maze The maze.
 * @returns {{ left: boolean, right: boolean, top: boolean, bottom: boolean }} Four booleans corresponding to each direction, `true` if `square` is connected to the adjacent square in that direction.
 */
function checkConnectedness(square, maze) {
    let left = !maze.vWalls.includes(square - 1) && square % maze.width !== 0;
    let right = !maze.vWalls.includes(square) && (square + 1) % maze.width !== 0;
    let top = !maze.hWalls.includes(square - maze.width) && square >= maze.width;
    let bottom = !maze.hWalls.includes(square) && square < maze.width * (maze.height - 1);

    return { left, right, top, bottom };
}


/**
 * Checks if a square is a deadend, i.e. only connected to a single square; if so, returns the direction of the opening.
 * @param {number} square The square to be checked.
 * @param {Maze} maze The maze.
 * @returns {string} One of `"left"`, `"right"`, `"top"`, `"bottom"`, indicating the direction of the opening, or an empty string if `square` is not a deadend.
 */
function checkDeadend(square, maze) {
    let { left, right, top, bottom } = checkConnectedness(square, maze);
    if ( left && !right && !top && !bottom ) return "left";
    if (!left &&  right && !top && !bottom ) return "right";
    if (!left && !right &&  top && !bottom ) return "top";
    if (!left && !right && !top &&  bottom ) return "bottom";
    return "";
}


/**
 * Checks if a square is blocked from all sides.
 * @param {number} square The square to be checked.
 * @param {Maze} maze The maze.
 * @returns {boolean} `true` if `square` is blocked from all sides.
 */
function isBlocked(square, maze) {
    let { left, right, top, bottom } = checkConnectedness(square, maze);
    return !left && !right && !top && !bottom;
}


/**
 * Uses Prim's algorithm to generate a spanning tree of a square grid.
 * @param {number} width The width of the maze.
 * @param {number} height The height of the maze.
 * @returns {Maze} The generated maze.
 */
function generateMaze(width, height) {
    // Initialize walls
    let hWalls = []; // Horizontal
    let vWalls = []; // Vertical

    // All squares have one of three states: default, searching, finished
    let squaresDefault = Array.from({ length: width * height }, (_v, i) => i);
    let squaresSearching = [];
    let squaresFinished = [];

    // Initialize vertical walls
    for (let vIndex = 0; vIndex < height; vIndex++) {
        for (let hIndex = 0; hIndex < width - 1; hIndex++) {
            vWalls.push(vIndex * width + hIndex);
        }
    }

    // Initialize horizontal walls
    for (let vIndex = 0; vIndex < height - 1; vIndex++) {
        for (let hIndex = 0; hIndex < width; hIndex++) {
            hWalls.push(vIndex * width + hIndex);
        }
    }

    // Mark a square as finished and its neighbors as searching
    let startingSquare = Math.floor(Math.random() * (width * height));
    let startingNeighbors = getNeighbors(startingSquare, null, width, height);

    removeItem(squaresDefault, startingSquare);
    squaresFinished.push(startingSquare);

    for (let neighbor of startingNeighbors) {
        removeItem(squaresDefault, neighbor.index);
        squaresSearching.push(neighbor.index);
    }

    // 0 to 100, rounded down
    let progress = 0;

    // Repeat until all squares are finished
    while (squaresSearching.length > 0) {
        // Choose a searching square as the "extension"
        // Then choose an adjacent finished square as the "base"
        // The finished portion will be extended to the extension from the base
        let extension = chooseRandom(squaresSearching);
        let finishedNeighbors = getNeighbors(extension, squaresFinished, width, height);
        let base = chooseRandom(finishedNeighbors);

        // Remove the wall between `base` and `extension`
        let wall = Math.min(extension, base.index);
        if (base.dir === "horizontal") removeItem(vWalls, wall);
        else removeItem(hWalls, wall);

        // Mark the extension as finished
        removeItem(squaresSearching, extension);
        squaresFinished.push(extension);

        // Mark the default squares adjacent to the extension as searching
        let defaultNeighbors = getNeighbors(extension, squaresDefault, width, height);
        for (let neighbor of defaultNeighbors) {
            removeItem(squaresDefault, neighbor.index);
            squaresSearching.push(neighbor.index);
        }

        let newProgress = Math.floor(squaresFinished.length / width / height * 100);
        if (newProgress > progress) {
            progress = newProgress;
            postMessage({ msg: "genProgress", progress });
        }
    }

    return { width, height, hWalls, vWalls };
}


/**
 * Calculates the solution using deadend filling.
 * @param {Maze} maze The maze.
 * @param {number} start The start.
 * @param {number} end The end.
 * @returns {{ squaresSolution: number[], squaresEndpoints: number[] }} `squaresSolution` is the list of squares that traces out the solution, excluding the start and the end; `squaresEndpoints` is the list containing the start and the end.
 */
function calculateSolution(maze, start, end) {
    let hWallsCopy = [...maze.hWalls];
    let vWallsCopy = [...maze.vWalls];

    let squaresSolution = Array.from({ length: maze.width * maze.height }, (_v, i) => i);
    let squaresEndpoints = start === end ? [start] : [start, end];

    // 0 to 100, rounded down
    let progress = 0;

    // Search for deadends
    for (let square = 0; square < maze.width * maze.height; square++) {
        let currentSquare = square;

        while (true) {
            // Endpoints aren't filled
            if (currentSquare === start || currentSquare === end) break;

            // The direction of the opening (if one exists)
            let openingDir = checkDeadend(currentSquare, { ...maze, hWalls: hWallsCopy, vWalls: vWallsCopy });
            // Break the loop if not a deadend
            if (openingDir === "") break;

            // Remove `currentSquare` from solution
            removeItem(squaresSolution, currentSquare);

            // Fill the deadend
            if (openingDir === "left") {
                vWallsCopy.push(currentSquare - 1);
                currentSquare -= 1;
            }
            if (openingDir === "right") {
                vWallsCopy.push(currentSquare);
                currentSquare += 1;
            }
            if (openingDir === "top") {
                hWallsCopy.push(currentSquare - maze.width);
                currentSquare -= maze.width;
            }
            if (openingDir === "bottom") {
                hWallsCopy.push(currentSquare);
                currentSquare += maze.width;
            }
        }

        let newProgress = Math.floor((square + 1) / maze.width / maze.height * 100);
        if (newProgress > progress) {
            progress = newProgress;
            postMessage({ msg: "solveProgress", progress });
        }
    }

    return { squaresSolution, squaresEndpoints }
}
