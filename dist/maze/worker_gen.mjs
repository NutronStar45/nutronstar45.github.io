import { chooseRandom, removeItem } from "../util.mjs";
import { GraphError } from "../errors.mjs";
import { PROGRESS_REPORT_INTERVAL, MazeShape, GenAlg } from "./util.mjs";
import { GenParams } from "./shapes/shapes.mjs";
import { SquareMaze } from "./shapes/square.mjs";
// Timestamp at the start of generation
let startTime;
addEventListener("message", e => {
    const params = GenParams.fromObject(e.data);
    const maze = gen(params);
    postMessage({ msg: "complete", maze: maze.toObject(), time: Date.now() - startTime });
    return;
});
/**
 * Generates a spanning tree of a square grid using the given algorithm.
 * @param params The generation parameters.
 * @returns The generated maze.
 * @throws {TypeError} Thrown if the given parameters are invalid.
 */
function gen(params) {
    const shapeParams = params.params;
    // Complete graph
    let graph;
    switch (params.shape) {
        case MazeShape.Square:
            graph = SquareMaze.supergraph(shapeParams.width, shapeParams.height);
            break;
        default:
            throw new TypeError("Invalid shape");
    }
    switch (params.alg) {
        case GenAlg.Prims:
            return prims(graph);
        default:
            throw new TypeError("Invalid algorithm");
    }
}
/**
 * Uses Prim's algorithm to generate a spanning tree of a connected graph.
 * @param graph A connected graph.
 * @returns The generated spanning tree.
 */
function prims(graph) {
    startTime = Date.now();
    postMessage({ msg: "progress", progress: "0%", time: 0 });
    // 0 to 100, rounded down
    let progress = 0;
    // Number of `PROGRESS_REPORT_INTERVAL`s elapsed, rounded down
    let reportUnitsElapsed = 0;
    // Initialize the result
    // From here on, neighbors in `graph` will be called "potential neighbors" and are "potentially adjacent"
    // Neighbors in `resultGraph` will be called "neighbors" and are "adjacent"
    let resultGraph = graph.copy();
    resultGraph.empty();
    // All vertices have one of three states: default, searching, finished
    let verticesDefault = graph.vertices();
    let verticesSearching = [];
    let verticesFinished = [];
    // Mark a vertex as finished and its potential neighbors as searching
    const startingVertex = chooseRandom(verticesDefault);
    const startingNeighbors = graph.neighbors(startingVertex);
    removeItem(verticesDefault, startingVertex);
    verticesFinished.push(startingVertex);
    for (const neighbor of startingNeighbors) {
        removeItem(verticesDefault, neighbor);
        verticesSearching.push(neighbor);
    }
    // Repeat until all vertices are finished
    while (verticesSearching.length > 0) {
        // Choose a searching vertex as the "extension"
        // Choose a finished potential neighbor as the "base"
        const extension = chooseRandom(verticesSearching);
        const extensionNeighbors = graph.neighbors(extension);
        const potentialNeighborsFinished = extensionNeighbors.filter(ver => verticesFinished.includes(ver));
        const base = chooseRandom(potentialNeighborsFinished);
        if (base === undefined) {
            throw new GraphError("Found a searching vertex without a finished neighbor");
        }
        // Extend the finished portion to the extension
        resultGraph.connect(base, extension);
        removeItem(verticesSearching, extension);
        verticesFinished.push(extension);
        // Mark the extension's default potential neighbors as searching
        const defaultNeighbors = extensionNeighbors.filter(ver => verticesDefault.includes(ver));
        for (const neighbor of defaultNeighbors) {
            removeItem(verticesDefault, neighbor);
            verticesSearching.push(neighbor);
        }
        // Report progress
        const newProgress = Math.floor(verticesFinished.length / graph.order() * 100);
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
    return resultGraph;
}
