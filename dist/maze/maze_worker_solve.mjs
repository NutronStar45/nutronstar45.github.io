import { chooseRandom, removeItem } from "../common_util.mjs";
import { PROGRESS_REPORT_INTERVAL, SolveAlg, SolveParams } from "./maze_util.mjs";
// Timestamp at the start of a step
let startTime;
addEventListener("message", e => {
    const params = SolveParams.fromObject(e.data);
    const solution = solvePlane(params);
    postMessage({ msg: "progress", progress: "100%", time: Date.now() - startTime });
    postMessage({ msg: "complete", solution, time: Date.now() - startTime });
});
/**
 * Specialized version of {@linkcode solve()} that can handle plane graphs.
 * @param params The solving parameters.
 * @returns An array of vertices tracing out the solution.
 * @throws {TypeError} Thrown if the given parameters are invalid.
 */
function solvePlane(params) {
    switch (params.alg) {
        // case SolveAlg.LeftHandRule:
        //     return leftHandRule(params.maze, params.start, params.end);
        // case SolveAlg.RightHandRule:
        //     return rightHandRule(params.maze, params.start, params.end);
        default:
            return solve(params);
    }
}
/**
 * Finds a path between two given vertices in a spanning tree using the given algorithm.
 * @param params The solving parameters.
 * @returns An array of vertices tracing out the solution.
 * @throws {TypeError} Thrown if the given parameters are invalid.
 */
function solve(params) {
    switch (params.alg) {
        case SolveAlg.DeadendFilling:
            return deadendFilling(params.maze, params.start, params.end);
        case SolveAlg.RandomDFS:
            return randomDFS(params.maze, params.start, params.end);
        default:
            throw new TypeError("Invalid algorithm");
    }
}
/**
 * Finds the path between two vertices of a connected graph using random depth-first search.
 * @param graph A connected graph.
 * @param start The start.
 * @param end The destination.
 * @returns An array of vertices tracing out the path.
 * @throws {TypeError} Thrown if the given parameters are invalid.
 */
function randomDFS(graph, start, end) {
    startTime = Date.now();
    postMessage({ msg: "progress", progress: "0%", time: 0 });
    // 0 to 100, rounded down
    let progress = 0;
    // Number of `PROGRESS_REPORT_INTERVAL`s elapsed, rounded down
    let reportUnitsElapsed = 0;
    // The current vertex
    let current = start;
    // The recorded path, including the last
    let path = [];
    // The vertices already visited at each step, including the last
    let visited = [[]];
    // Number of unique vertices visited
    let numberVisited = 1;
    while (current !== end) {
        const neighbors = graph.neighbors(current);
        const nextNeighbors = neighbors.filter(val => val !== path.at(-2) && !visited.at(-1).includes(val));
        if (nextNeighbors.length !== 0) {
            current = chooseRandom(nextNeighbors);
            path.push(current);
            visited.push([]);
            numberVisited++;
        }
        else {
            visited.pop();
            visited.at(-1).push(current);
            path.pop();
            current = path.at(-1);
        }
        // Report progress
        const newProgress = Math.floor(numberVisited / graph.order() * 100);
        const newReportUnitsElapsed = Math.floor((Date.now() - startTime) / PROGRESS_REPORT_INTERVAL);
        if (newProgress > progress || newReportUnitsElapsed > reportUnitsElapsed) {
            progress = newProgress;
            reportUnitsElapsed = newReportUnitsElapsed;
            postMessage({
                msg: "progress",
                progress: `${progress}%`,
                time: reportUnitsElapsed * PROGRESS_REPORT_INTERVAL
            });
        }
    }
    return path;
}
/**
 * Finds the path between two vertices of a connected graph using deadend filling.
 * @param graph A connected graph.
 * @param start The start.
 * @param end The destination.
 * @returns An array of vertices tracing out the path.
 * @throws {TypeError} Thrown if the given parameters are invalid.
 */
function deadendFilling(graph, start, end) {
    startTime = Date.now();
    postMessage({ msg: "progress", progress: "0%", time: 0 });
    // 0 to 100, rounded down
    let progress = 0;
    // Number of `PROGRESS_REPORT_INTERVAL`s elapsed, rounded down
    let reportUnitsElapsed = 0;
    // Initialize result
    let pathGraph = graph.copy();
    // Search for deadends
    for (const [index, vertex] of graph.vertices().entries()) {
        let currentVertex = vertex;
        while (true) {
            // Stop filling at endpoints
            if (currentVertex === start || currentVertex === end)
                break;
            // Break the loop if not a deadend
            const neighbors = pathGraph.neighbors(currentVertex);
            if (neighbors.length !== 1)
                break;
            const neighbor = neighbors[0];
            // Fill the deadend
            pathGraph.disconnect(currentVertex, neighbor);
            // Move out
            currentVertex = neighbor;
        }
        // Report progress
        const newProgress = Math.floor((index + 1) / graph.order() * 100);
        const newReportUnitsElapsed = Math.floor((Date.now() - startTime) / PROGRESS_REPORT_INTERVAL);
        if (newProgress > progress || newReportUnitsElapsed > reportUnitsElapsed) {
            progress = newProgress;
            reportUnitsElapsed = newReportUnitsElapsed;
            postMessage({
                msg: "progress",
                progress: `${progress}%`,
                time: reportUnitsElapsed * PROGRESS_REPORT_INTERVAL
            });
        }
    }
    // Extract path
    let path = [start];
    while (path.at(-1) !== end) {
        // Previous and/or next vertices
        let neighbors = pathGraph.neighbors(path.at(-1));
        // Disregard previous vertex
        if (path.length > 1) {
            removeItem(neighbors, path.at(-2));
        }
        // Walk forward
        path.push(neighbors[0]);
    }
    return path;
}
