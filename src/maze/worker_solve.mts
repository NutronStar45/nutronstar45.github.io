import { chooseRandom, removeItem } from "../util.mjs";
import { GraphError } from "../errors.mjs";
import { PROGRESS_REPORT_INTERVAL, type Subgraph, type PlaneSubgraph, SolveAlg } from "./util.mjs";
import { SolveParams } from "./shapes/shapes.mjs";


// Timestamp at the start of a step
let startTime: number;

addEventListener("message", e => {
    const params = SolveParams.fromObject(e.data);

    const solution = solvePlane(params);
    postMessage({ msg: "complete", solution, time: Date.now() - startTime });
});


/**
 * Specialized version of {@linkcode solve()} that can handle plane graphs.
 * @param params The solving parameters.
 * @returns An array of vertices tracing out the solution.
 * @throws {TypeError} Thrown if the given parameters are invalid.
 */
function solvePlane(params: SolveParams) {
    switch (params.alg) {
        case SolveAlg.LeftHandRule:
            return dfs(params.maze, params.start, params.end, dfsRules.leftHandRule);
        case SolveAlg.RightHandRule:
            return dfs(params.maze, params.start, params.end, dfsRules.rightHandRule);
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
function solve(params: SolveParams) {
    switch (params.alg) {
        case SolveAlg.DeadendFilling:
            return deadendFilling(params.maze, params.start, params.end);
        case SolveAlg.RandomDFS:
            return dfs(params.maze, params.start, params.end, dfsRules.random);
        case SolveAlg.RandomMouse:
            return randomMouse(params.maze, params.start, params.end);
        default:
            throw new TypeError("Invalid algorithm");
    }
}


/**
 * Finds the path between two vertices of a connected graph using deadend filling.
 * @param graph A connected graph.
 * @param start The start.
 * @param end The destination.
 * @returns An array of vertices tracing out the path.
 * @throws {TypeError} Thrown if the given parameters are invalid.
 */
function deadendFilling<V>(graph: Subgraph<V>, start: V, end: V) {
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
            if (currentVertex === start || currentVertex === end) break;

            // Break the loop if not a deadend
            const neighbors = pathGraph.neighbors(currentVertex);
            if (neighbors.length !== 1) break;
            const neighbor = neighbors[0]!;

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
        let neighbors = pathGraph.neighbors(path.at(-1)!);

        // Disregard previous vertex
        if (path.length > 1) {
            removeItem(neighbors, path.at(-2));
        }

        // Walk forward
        path.push(neighbors[0]!);
    }

    return path;
}


/** DFS rules used by {@linkcode dfs()}. */
const dfsRules = {
    random<V>(graph: Subgraph<V>, _previous: V | null, current: V, path: V[], visited: V[]): V {
        const neighbors = graph.neighbors(current);
        const nextNeighbors = neighbors.filter(val => val !== path.at(-1) && !visited.includes(val));
        if (nextNeighbors.length !== 0) {
            return chooseRandom(nextNeighbors)!;
        } else if (path.length > 0) {
            return path.at(-1)!;
        } else {
            throw new GraphError("All neighbors are already visited");
        }
    },

    leftHandRule<V>(graph: PlaneSubgraph<V>, previous: V | null, current: V, path: V[], visited: V[]): V {
        if (previous !== null) {
            return graph.leftTurn(previous, current);
        } else {
            return dfsRules.random(graph, previous, current, path, visited);
        }
    },

    rightHandRule<V>(graph: PlaneSubgraph<V>, previous: V | null, current: V, path: V[], visited: V[]): V {
        if (previous !== null) {
            return graph.rightTurn(previous, current);
        } else {
            return dfsRules.random(graph, previous, current, path, visited);
        }
    }
};


/**
 * Finds the path between two vertices of a connected graph using depth-first search.
 * @param graph A connected graph.
 * @param start The start.
 * @param end The destination.
 * @param rule A function returning the next vertex to traverse to. Its parameters are:
 * - `graph`, the current graph.
 * - `previous`, the previous vertex or `null` if there isn't one.
 * - `current`, the current vertex.
 * - `path`, the recorded path, excluding the current vertex.
 * - `visited`, an array of visited neighbors.
 * @returns An array of vertices tracing out the path.
 * @throws {TypeError} Thrown if the given parameters are invalid.
 */
function dfs<V, T extends Subgraph<V>>(graph: T, start: V, end: V,
        rule: (graph: T, previous: V | null, current: V, path: V[], visited: V[]) => V) {
    startTime = Date.now();
    postMessage({ msg: "progress", progress: "0%", time: 0 });

    // 0 to 100, rounded down
    let progress = 0;
    // Number of `PROGRESS_REPORT_INTERVAL`s elapsed, rounded down
    let reportUnitsElapsed = 0;

    // The previous vertex
    let previous: V | null = null;
    // The current vertex
    let current = start;
    // The recorded path, excluding the current vertex
    let path: V[] = [];
    // The vertices already visited at each step, including the last
    let visited: V[][] = [[]];
    // Number of unique vertices visited
    let numberVisited = 1;

    while (current !== end) {
        const next = rule(graph, previous ?? null, current, path, visited.at(-1)!);
        if (next !== path.at(-1)) {
            path.push(current);
            visited.push([]);
            numberVisited++;
        } else {
            path.pop();
            visited.pop();
            visited.at(-1)!.push(current);
        }
        previous = current;
        current = next;

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

    postMessage({ msg: "progress", progress: "100%", time: reportUnitsElapsed * PROGRESS_REPORT_INTERVAL });

    path.push(current);
    return path;
}


/**
 * Finds the path between two vertices of a connected graph by walking randomly.
 * @param graph A connected graph.
 * @param start The start.
 * @param end The destination.
 * @returns An array of vertices tracing out the path.
 * @throws {TypeError} Thrown if the given parameters are invalid.
 */
function randomMouse<V>(graph: Subgraph<V>, start: V, end: V) {
    startTime = Date.now();
    postMessage({ msg: "progress", progress: "", time: 0 });

    // Number of `PROGRESS_REPORT_INTERVAL`s elapsed, rounded down
    let reportUnitsElapsed = 0;

    // The current vertex
    let current = start;
    // The recorded path, excluding the current vertex
    let path: V[] = [];

    while (current !== end) {
        const next = chooseRandom(graph.neighbors(current));
        if (next === undefined) {
            throw new GraphError("Vertex doesn't have neighbors");
        } else if (next !== path.at(-1)) {
            path.push(current);
        } else {
            path.pop();
        }
        current = next;

        // Report progress
        const newReportUnitsElapsed = Math.floor((Date.now() - startTime) / PROGRESS_REPORT_INTERVAL);
        if (newReportUnitsElapsed > reportUnitsElapsed) {
            reportUnitsElapsed = newReportUnitsElapsed;
            postMessage({
                msg: "progress",
                progress: "",
                time: reportUnitsElapsed * PROGRESS_REPORT_INTERVAL
            });
        }
    }

    postMessage({ msg: "progress", progress: "100%", time: reportUnitsElapsed * PROGRESS_REPORT_INTERVAL });

    path.push(current);
    return path;
}
