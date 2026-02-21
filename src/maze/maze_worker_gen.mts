import { chooseRandom, removeItem } from "../common_util.mjs";
import { PROGRESS_REPORT_INTERVAL, type Subgraph, MazeShape, GenAlg, GenParams } from "./maze_util.mjs";
import { SquareMaze } from "./shapes/maze_square.mjs";


// Timestamp at the start of generation
let startTime: number;

addEventListener("message", e => {
    const params = GenParams.fromObject(e.data);
    if (params === null) {
        console.error("Generation worker received invalid message: ", e.data);
        return;
    }

    const maze = gen(params);
    if (maze !== null) {
        postMessage({ msg: "complete", maze: maze.toObject(), time: Date.now() - startTime });
        return;
    }

    console.error("Generation worker received invalid message: ", e.data);
});


/**
 * Generates a spanning tree of a square grid using the given algorithm.
 * @param params The generation parameters.
 * @returns The generated maze, or `null` if the given parameters are invalid.
 */
function gen(params: GenParams) {
    const shapeParams = params.params;

    // Complete graph
    let graph;
    switch (params.shape) {
        case MazeShape.Square:
            graph = SquareMaze.supergraph(shapeParams.width, shapeParams.height);
    }
    if (graph === null) return null;

    switch (params.alg) {
        case GenAlg.Prims:
            return prims(graph);
    }
}


/**
 * Uses Prim's algorithm to generate a spanning tree of a connected graph.
 * @param graph A connected graph.
 * @returns The generated spanning tree.
 */
function prims<V, T extends Subgraph<V>>(graph: T) {
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
    const startingNeighbors = graph.neighbors(startingVertex) as V[];

    removeItem(verticesDefault, startingVertex);
    verticesFinished.push(startingVertex);

    for (const neighbor of startingNeighbors) {
        removeItem(verticesDefault, neighbor);
        verticesSearching.push(neighbor);
    }

    // Handle the special case that `startingVertex` is isolated
    if (verticesSearching.length === 0) {
        postMessage({ msg: "progress", progress: "100%", time: 0 });
    }

    // Repeat until all vertices are finished
    while (verticesSearching.length > 0) {
        // Choose a searching vertex as the "extension"
        // Choose a finished potential neighbor as the "base"
        // The finished portion will be extended to the extension from the base
        const extension = chooseRandom(verticesSearching);
        const potentialNeighborsFinished = (graph.neighbors(extension) as V[])
            .filter(ver => verticesFinished.includes(ver));
        const base = chooseRandom(potentialNeighborsFinished);

        // Connect `base` and `extension`
        resultGraph.connect(base, extension);

        // Mark the extension as finished
        removeItem(verticesSearching, extension);
        verticesFinished.push(extension);

        // Mark the extension's default potential neighbors as searching
        const defaultNeighbors = (graph.neighbors(extension) as V[])
            .filter(ver => verticesDefault.includes(ver));
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
