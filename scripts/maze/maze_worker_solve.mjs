import { removeItem } from "../common_util.mjs";
import { PROGRESS_REPORT_INTERVAL } from "./maze_util.mjs";
import { checkDeadend, connectedNeighbors } from "./maze_util.mjs";
// Timestamp at the start of a step
let startTime;
addEventListener("message", e => {
    const solution = solve(e.data.maze, e.data.start, e.data.end, e.data.algorithm);
    if (solution !== null) {
        postMessage({ msg: "complete", solution, time: Date.now() - startTime });
    }
    else {
        console.error(`Unknown algorithm: ${e.data.algorithm}`);
    }
});
/**
 *
 * @param maze The maze.
 * @param start The starting square.
 * @param end The ending square.
 * @param algorithm The solving algorithm.
 * @returns `null` if the given algorithm is unknown. Otherwise, an array of squares tracing out the solution.
 */
function solve(maze, start, end, algorithm) {
    switch (algorithm) {
        case "deadendFilling":
            return deadendFilling(maze, start, end);
        default:
            return null;
    }
}
/**
 * Calculates the solution using deadend filling.
 * @param maze The maze.
 * @param start The start.
 * @param end The end.
 * @returns An array of squares tracing out the solution.
 */
function deadendFilling(maze, start, end) {
    startTime = Date.now();
    postMessage({ msg: "progress", progress: 0, time: 0 });
    // 0 to 100, rounded down
    let progress = 0;
    // Number of `PROGRESS_REPORT_INTERVAL`s elapsed, rounded down
    let reportUnitsElapsed = 0;
    // Copy walls
    let hWallsCopy = [...maze.hWalls];
    let vWallsCopy = [...maze.vWalls];
    // Initialize solution path
    let path = Array.from({ length: maze.width * maze.height }, (_v, i) => i);
    // Search for deadends
    for (let square = 0; square < maze.width * maze.height; square++) {
        let currentSquare = square;
        while (true) {
            // Endpoints aren't filled
            if (currentSquare === start || currentSquare === end)
                break;
            // The direction of the opening (if one exists)
            const openingDir = checkDeadend(currentSquare, { ...maze, hWalls: hWallsCopy, vWalls: vWallsCopy });
            // Break the loop if not a deadend
            if (openingDir === "")
                break;
            // Remove current square from path
            removeItem(path, currentSquare);
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
    // Order solution
    let solution = [start];
    while (solution.at(-1) !== end) {
        // Connected (previous or next) square(s) on the solution path
        let connectedOnPath = connectedNeighbors(solution.at(-1), maze).filter(sq => path.includes(sq));
        // Remove previous square
        if (solution.length > 1) {
            removeItem(connectedOnPath, solution.at(-2));
        }
        // Walk forward
        solution.push(connectedOnPath[0]);
    }
    return solution;
}
