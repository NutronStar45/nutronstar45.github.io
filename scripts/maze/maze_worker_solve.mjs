import { removeItem } from "../common_util.mjs";
import { PROGRESS_REPORT_INTERVAL, SolveAlg, SolveParams } from "./maze_util.mjs";
// Timestamp at the start of a step
let startTime;
addEventListener("message", e => {
    const params = SolveParams.fromObject(e.data);
    if (params === null) {
        console.error("Solving worker received invalid message: ", e.data);
        return;
    }
    const solution = solvePlane(params);
    if (solution !== null) {
        postMessage({ msg: "complete", solution, time: Date.now() - startTime });
    }
    else {
        console.error("Solving worker received invalid message: ", e.data);
        return;
    }
});
/**
 * Specialized version of {@linkcode solve()} that can handle plane graphs.
 * @param params The solving parameters.
 * @returns An array of vertices tracing out the solution, or `null` if the given parameters are invalid.
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
 * @returns An array of vertices tracing out the solution, or `null` if the given parameters are invalid.
 */
function solve(params) {
    switch (params.alg) {
        case SolveAlg.DeadendFilling:
            return deadendFilling(params.maze, params.start, params.end);
        // case SolveAlg.RandomDFS:
        //     return randomDFS(params.maze, params.start, params.end);
        default:
            return null;
    }
}
/**
 * Finds the path between two vertices of a connected graph using deadend filling.
 * @param graph A connected graph.
 * @param start The start.
 * @param end The destination.
 * @returns An array of vertices tracing out the path, or `null` if the given parameters are invalid.
 */
function deadendFilling(graph, start, end) {
    if (!graph.hasVertex(start) || !graph.hasVertex(end))
        return null;
    startTime = Date.now();
    postMessage({ msg: "progress", progress: "0%", time: 0 });
    // 0 to 100, rounded down
    let progress = 0;
    // Number of `PROGRESS_REPORT_INTERVAL`s elapsed, rounded down
    let reportUnitsElapsed = 0;
    // Initialize the result
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
