importScripts("/scripts/maze_util.js");


// Timestamp at the start of a step
let startTime;

addEventListener("message", e => {
    postMessage({
        msg: "complete",
        ...calculateSolution(e.data.maze, e.data.start, e.data.end),
        time: Date.now() - startTime
    });
});


/**
 * Calculates the solution using deadend filling.
 * @param {Maze} maze The maze.
 * @param {number} start The start.
 * @param {number} end The end.
 * @returns {{ squaresSolution: number[], squaresEndpoints: number[] }} An object containing `squaresSolution`, the array of squares that form the solution, and `squaresEndpoints`, the array containing the start and the end. `squaresSolution` and `squaresEndpoints` are not guaranteed to be ordered in any way.
 */
function calculateSolution(maze, start, end) {
    startTime = Date.now();
    postMessage({ msg: "progress", progress: 0, time: 0 });

    // 0 to 100, rounded down
    let progress = 0;
    // Number of `PROGRESS_REPORT_INTERVAL`s elapsed, rounded down
    let reportUnitsElapsed = 0;

    // Copy walls
    let hWallsCopy = [...maze.hWalls];
    let vWallsCopy = [...maze.vWalls];

    // Initialize return arrays
    let squaresSolution = Array.from({ length: maze.width * maze.height }, (_v, i) => i);
    const squaresEndpoints = start === end ? [start] : [start, end];

    // Search for deadends
    for (let square = 0; square < maze.width * maze.height; square++) {
        let currentSquare = square;

        while (true) {
            // Endpoints aren't filled
            if (currentSquare === start || currentSquare === end) break;

            // The direction of the opening (if one exists)
            const openingDir = checkDeadend(currentSquare, { ...maze, hWalls: hWallsCopy, vWalls: vWallsCopy });
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

        // Report progress
        const newProgress = Math.floor((square + 1) / maze.width / maze.height * 100);
        const newReportUnitsElapsed = Math.floor((Date.now() - startTime) / PROGRESS_REPORT_INTERVAL);
        if (newProgress > progress || newReportUnitsElapsed > reportUnitsElapsed) {
            progress = newProgress;
            reportUnitsElapsed = newReportUnitsElapsed;
            postMessage({
                msg: "progress",
                progress,
                time: reportUnitsElapsed * PROGRESS_REPORT_INTERVAL
            });
        }
    }

    return { squaresSolution, squaresEndpoints }
}
