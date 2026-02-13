import { removeItem } from "../common_util.mjs";
import { PROGRESS_REPORT_INTERVAL, type Subgraph, type PlaneSubgraph, SolveAlgorithm } from "./maze_util.mjs";
import { SquareMaze } from "./shapes/maze_square.mjs";


// Timestamp at the start of a step
let startTime: number;

addEventListener("message", e => {
    const maze = SquareMaze.fromObject(e.data.maze as object);
    if (maze === null) {
        console.error("Solving worker received invalid message: ", e.data);
        return;
    }

    const solution = solvePlane(maze, e.data.start as number, e.data.end as number, e.data.algorithm);
    if (solution !== null) {
        postMessage({ msg: "complete", solution, time: Date.now() - startTime });
    } else {
        console.error("Solving worker received invalid message: ", e.data);
        return;
    }
});


/**
 * Specialized version of {@linkcode solve()} that can handle plane graphs.
 * @param maze The maze.
 * @param start The start.
 * @param end The destination.
 * @param algorithm The solving algorithm.
 * @returns An array of vertices tracing out the solution, or `null` if the given parameters are invalid.
 */
function solvePlane<V>(maze: PlaneSubgraph<V>, start: V, end: V, algorithm: SolveAlgorithm) {
    switch (algorithm) {
        // case "leftHandRule":
        //     return leftHandRule(maze, start, end);
        // case "rightHandRule":
        //     return rightHandRule(maze, start, end);
        default:
            return solve(maze, start, end, algorithm);
    }
}


/**
 * Finds a path between two given vertices in a spanning tree using the given algorithm.
 * @param maze The maze.
 * @param start The start.
 * @param end The destination.
 * @param algorithm The solving algorithm.
 * @returns An array of vertices tracing out the solution, or `null` if the given parameters are invalid.
 */
function solve<V>(maze: Subgraph<V>, start: V, end: V, algorithm: SolveAlgorithm) {
    switch (algorithm) {
        case SolveAlgorithm.DeadendFilling:
            return deadendFilling(maze, start, end);
        // case "randomDFS":
        //     return randomDFS(maze, start, end);
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
function deadendFilling<V>(graph: Subgraph<V>, start: V, end: V) {
    if (!graph.hasVertex(start) || !graph.hasVertex(end)) return null;

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
            if (currentVertex === start || currentVertex === end) break;

            // Break the loop if not a deadend
            const neighbors = pathGraph.neighbors(currentVertex) as V[];
            if (neighbors.length !== 1) break;
            const neighbor = neighbors[0] as V;

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
        let neighbors = pathGraph.neighbors(path.at(-1) as V) as V[];

        // Disregard previous vertex
        if (path.length > 1) {
            removeItem(neighbors, path.at(-2));
        }

        // Walk forward
        path.push(neighbors[0] as V);
    }

    return path;
}
