import { chooseRandom, removeItem } from "../common_util.mjs";
import { PROGRESS_REPORT_INTERVAL } from "./maze_util.mjs";
import { adjacentDirections, directionDifference, neighbors } from "./maze_util.mjs";
// Timestamp at the start of generation
let startTime;
addEventListener("message", e => {
    const maze = generate(e.data.width, e.data.height, e.data.algorithm);
    if (maze !== null) {
        postMessage({ msg: "complete", maze, time: Date.now() - startTime });
    }
    else {
        console.error(`Unknown algorithm: ${e.data.algorithm}`);
    }
});
/**
 * Generates a spanning tree of a square grid using the given algorithm.
 * @param width The width of the maze.
 * @param height The height of the maze.
 * @param algorithm The generation algorithm.
 * @returns The generated maze, or `null` if the given algorithm is unknown.
 */
function generate(width, height, algorithm) {
    switch (algorithm) {
        case "prims":
            return prims(width, height);
        default:
            return null;
    }
}
/**
 * Uses Prim's algorithm to generate a spanning tree of a square grid.
 * @param width The width of the maze.
 * @param height The height of the maze.
 * @returns The generated maze.
 */
function prims(width, height) {
    startTime = Date.now();
    postMessage({ msg: "progress", progress: 0, time: 0 });
    // 0 to 100, rounded down
    let progress = 0;
    // Number of `PROGRESS_REPORT_INTERVAL`s elapsed, rounded down
    let reportUnitsElapsed = 0;
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
    const startingSquare = Math.floor(Math.random() * (width * height));
    const startingNeighbors = neighbors(startingSquare, width, height);
    removeItem(squaresDefault, startingSquare);
    squaresFinished.push(startingSquare);
    for (const neighbor of startingNeighbors) {
        removeItem(squaresDefault, neighbor);
        squaresSearching.push(neighbor);
    }
    // Repeat until all squares are finished
    while (squaresSearching.length > 0) {
        // Choose a searching square as the "extension"
        // Then choose an adjacent finished square as the "base"
        // The finished portion will be extended to the extension from the base
        const extension = chooseRandom(squaresSearching);
        const finishedDirections = adjacentDirections(extension, width, height)
            .filter(dir => squaresFinished.includes(extension + directionDifference(dir, width)));
        const baseDirection = chooseRandom(finishedDirections);
        const base = extension + directionDifference(baseDirection, width);
        // Remove the wall between `base` and `extension`
        const wallBetween = Math.min(extension, base);
        if (baseDirection === "left" || baseDirection === "right")
            removeItem(vWalls, wallBetween);
        else
            removeItem(hWalls, wallBetween);
        // Mark the extension as finished
        removeItem(squaresSearching, extension);
        squaresFinished.push(extension);
        // Mark the default squares adjacent to the extension as searching
        const defaultNeighbors = neighbors(extension, width, height)
            .filter(square => squaresDefault.includes(square));
        for (const neighbor of defaultNeighbors) {
            removeItem(squaresDefault, neighbor);
            squaresSearching.push(neighbor);
        }
        // Report progress
        const newProgress = Math.floor(squaresFinished.length / width / height * 100);
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
    return { width, height, hWalls, vWalls };
}
