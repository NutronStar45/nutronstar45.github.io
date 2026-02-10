importScripts("/scripts/common_util.js");


// Time between individual progress reports in milliseconds
const PROGRESS_REPORT_INTERVAL = 1000;


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
    const left = !maze.vWalls.includes(square - 1) && square % maze.width !== 0;
    const right = !maze.vWalls.includes(square) && (square + 1) % maze.width !== 0;
    const top = !maze.hWalls.includes(square - maze.width) && square >= maze.width;
    const bottom = !maze.hWalls.includes(square) && square < maze.width * (maze.height - 1);

    return { left, right, top, bottom };
}


/**
 * Checks if a square is a deadend, i.e. only connected to a single square; if so, returns the direction of the opening.
 * @param {number} square The square to be checked.
 * @param {Maze} maze The maze.
 * @returns {string} One of `"left"`, `"right"`, `"top"`, `"bottom"`, indicating the direction of the opening, or an empty string if `square` is not a deadend.
 */
function checkDeadend(square, maze) {
    const { left, right, top, bottom } = checkConnectedness(square, maze);
    if ( left && !right && !top && !bottom ) return "left";
    if (!left &&  right && !top && !bottom ) return "right";
    if (!left && !right &&  top && !bottom ) return "top";
    if (!left && !right && !top &&  bottom ) return "bottom";
    return "";
}
