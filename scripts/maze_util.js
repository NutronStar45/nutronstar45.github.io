importScripts("/scripts/common_util.js");


// Time between individual progress reports in milliseconds
const PROGRESS_REPORT_INTERVAL = 1000;


/**
 * Returns the corresponding index difference of a direction.
 * @param {Direction} direction The direction.
 * @param {number} width The width of the grid.
 * @returns {number} The corresponding index difference.
 */
function directionDifference(direction, width) {
    switch (direction) {
        case "left":
            return -1;
        case "right":
            return 1;
        case "top":
            return -width;
        case "bottom":
            return width;
    }
}


/**
 * Returns directions in which a given square has neighbors.
 * @param {number} square A square.
 * @param {number} width The width of the grid.
 * @param {number} height The height of the grid.
 * @returns {Direction[]} The directions in which `square` has neighbors.
 */
function adjacentDirections(square, width, height) {
    let directions = [];

    if (square       % width !== 0)     directions.push("left");
    if ((square + 1) % width !== 0)     directions.push("right");
    if (square >= width)                directions.push("top");
    if (square <  width * (height - 1)) directions.push("bottom");

    return directions;
}


/**
 * Returns squares adjacent to a given square.
 * @param {number} square A square.
 * @param {number} width The width of the grid.
 * @param {number} height The height of the grid.
 * @returns {number[]} The squares adjacent to `square`.
 */
function neighbors(square, width, height) {
    const adjacentDirections_ = adjacentDirections(square, width, height);
    return adjacentDirections_.map(dir => square + directionDifference(dir, width));
}


/**
 * returns in which directions a given square is connected to.
 * @param {number} square The square whose connectedness is checked.
 * @param {Maze} maze The maze.
 * @returns {Direction[]} An array of directions in which `square` isn't blocked by a wall or the border.
 */
function connectedDirections(square, maze) {
    let directionsNoWalls = [];
    if (!maze.vWalls.includes(square - 1)) {
        directionsNoWalls.push("left");
    }
    if (!maze.vWalls.includes(square)) {
        directionsNoWalls.push("right");
    }
    if (!maze.hWalls.includes(square - maze.width)) {
        directionsNoWalls.push("top");
    }
    if (!maze.hWalls.includes(square)) {
        directionsNoWalls.push("bottom");
    }

    return adjacentDirections(square, maze.width, maze.height).filter(dir => directionsNoWalls.includes(dir));
}


/**
 * Returns an array of squares which a given square is connected to.
 * @param {number} square The square to be checked.
 * @param {Maze} maze The maze.
 * @returns {number[]} The neighbors which `square` is connected to.
 */
function connectedNeighbors(square, maze) {
    const adjacentDirections_ = adjacentDirections(square, maze.width, maze.height);
    const connectedDirections_ = connectedDirections(square, maze);
    return adjacentDirections_
        .filter(dir => connectedDirections_.includes(dir))
        .map(dir => square + directionDifference(dir, maze.width));
}


/**
 * Checks if a square is a deadend, i.e. only connected to a single square; if so, returns the direction of the opening.
 * @param {number} square The square to be checked.
 * @param {Maze} maze The maze.
 * @returns {Direction | ""} The direction of the opening, or an empty string if `square` is not a deadend.
 */
function checkDeadend(square, maze) {
    const directions = connectedDirections(square, maze);
    if (directions.length === 1) {
        return directions[0];
    } else {
        return "";
    }
}
