import { SquareMazeGenParams, SquareMaze } from "./shapes/maze_square.mjs";

// Time between individual progress reports in milliseconds
export const PROGRESS_REPORT_INTERVAL = 1000;


/** The shape of a maze. */
export enum MazeShape {
    Square
}


/** A generation algorithm. */
export enum GenAlg {
    Prims
}


/** A solving algorithm. */
export enum SolveAlg {
    DeadendFilling
}


/**
 * Converts a string into a {@linkcode GenAlg}.
 * @param str A string.
 * @returns A {@linkcode GenAlg}, or `null` if the string doesn't represent a valid algorithm.
 */
export function genAlgFromString(str: string) {
    switch (str) {
        case "prims":
            return GenAlg.Prims;
        default:
            return null;
    }
}


/**
 * Converts a string into a {@linkcode SolveAlg}.
 * @param str A string.
 * @returns A {@linkcode SolveAlg}, or `null` if the string doesn't represent a valid algorithm.
 */
export function solveAlgFromString(str: string) {
    switch (str) {
        case "deadendFilling":
            return SolveAlg.DeadendFilling;
        default:
            return null;
    }
}


/**
 * A subgraph of a fixed simple graph.
 * @template V The type of the vertices.
 */
export interface Subgraph<V> {
    /** Returns the vertices. */
    vertices(): V[];

    /**
     * Checks whether a given vertex exists in the graph.
     * @param vertex The vertex.
     * @returns Whether a given vertex exists in the graph.
     */
    hasVertex(vertex: V): boolean;

    /** Returns the number of vertices. */
    order(): number;

    /**
     * Returns whether two vertices are adjacent, i.e. are joined by an edge.
     * @param vertex1 One of the endpoints.
     * @param vertex2 One of the endpoints.
     * @returns Whether {@linkcode vertex1} and {@linkcode vertex2} are adjacent or not.
     */
    hasEdge(vertex1: V, vertex2: V): boolean;

    /**
     * Returns the neighbors of a given vertex, or `null` if {@linkcode vertex} isn't in the graph.
     * @param vertex A vertex.
     */
    neighbors(vertex: V): V[] | null;

    /** Returns a copy that preserves references to vertices. */
    copy(): this;

    /** Removes all edges. */
    empty(): void;

    /**
     * Adds an edge connecting two endpoints, if one doesn't already exist. Doesn't do anything if the edge isn't in the supergraph.
     * @param vertex1 One of the endpoints.
     * @param vertex2 One of the endpoints.
     */
    connect(vertex1: V, vertex2: V): void;

    /**
     * Removes an edge connecting two endpoints, if one exists. Doesn't do anything if the edge isn't in the supergraph.
     * @param vertex1 One of the endpoints.
     * @param vertex2 One of the endpoints.
     */
    disconnect(vertex1: V, vertex2: V): void;
}


/**
 * A subgraph of a fixed simple graph on a plane.
 * @template V The type of the vertices.
 */
export interface PlaneSubgraph<V> extends Subgraph<V> {
    /**
     * Returns the vertex that would be reached if one start from {@linkcode previous}, goes to {@linkcode current}, then takes the path immediately to the right.
     * @param previous The previous vertex.
     * @param current The current vertex.
     * @returns The next vertex, or `null` if:
     * - one of the given vertices isn't in the graph, or
     * - the edge from {@linkcode previous} to {@linkcode current} isn't in the graph.
     */
    rightTurn(previous: V, current: V): V | null;

    /**
     * Returns the vertex that would be reached if one start from {@linkcode previous}, goes to {@linkcode current}, then takes the path immediately to the left.
     * @param previous The previous vertex.
     * @param current The current vertex.
     * @returns The next vertex, or `null` if:
     * - one of the given vertices isn't in the graph, or
     * - the edge from {@linkcode previous} to {@linkcode current} isn't in the graph.
     */
    leftTurn(previous: V, current: V): V | null;
}


type Maze = SquareMaze;


/** Parameters for maze generation. */
export class GenParams {
    private constructor(
        readonly shape: MazeShape,
        readonly alg: GenAlg,
        readonly params: SquareMazeGenParams
    ) {}

    /**
     * Constructs a {@linkcode GenParams} for a square maze.
     * @param params The parameters of the maze.
     */
    static newSquare(alg: GenAlg, params: SquareMazeGenParams) {
        return new this(MazeShape.Square, alg, params);
    }

    /** Returns an object containing the parameters. */
    toObject() {
        return {
            shape: this.shape,
            alg: this.alg,
            params: this.params.toObject()
        }
    }

    /**
     * Constructs a {@linkcode GenParams} from an object. Returns `null` if the given object is invalid.
     * @param obj An object.
     */
    static fromObject(obj: object) {
        if (!("shape" in obj) || typeof obj.shape !== "number" || !(obj.shape in MazeShape)) {
            return null;
        }
        if (!("alg" in obj) || typeof obj.alg !== "number" || !(obj.alg in GenAlg)) {
            return null;
        }
        if (!("params" in obj) || typeof obj.params !== "object" || obj.params === null) {
            return null;
        }

        switch (obj.shape) {
            case MazeShape.Square: {
                const params = SquareMazeGenParams.fromObject(obj.params);
                if (params === null) return null;
                return this.newSquare(obj.alg, params);
            }
            default:
                return null;
        }
    }
}


/** Parameters for maze solving. */
export class SolveParams {
    private constructor(
        readonly shape: MazeShape,
        readonly maze: Maze,
        readonly start: number,
        readonly end: number,
        readonly alg: SolveAlg,
    ) {}

    /**
     * Constructs a {@linkcode SolveParams} for a square maze. Returns `null` if {@linkcode start} or {@linkcode end} isn't in the maze.
     * @param maze The maze to be solved.
     * @param start The start.
     * @param end The destination.
     * @param alg The solving algorithm.
     */
    static newSquare(maze: SquareMaze, start: number, end: number, alg: SolveAlg) {
        if (!maze.hasVertex(start) || !maze.hasVertex(end)) {
            return null;
        }
        return new this(MazeShape.Square, maze, start, end, alg);
    }

    /** Returns an object containing the parameters. */
    toObject() {
        return {
            shape: this.shape,
            maze: this.maze.toObject(),
            start: this.start,
            end: this.end,
            alg: this.alg
        }
    }

    /**
     * Constructs a {@linkcode SolveParams} from an object. Returns `null` if the given object is invalid.
     * @param obj An object.
     */
    static fromObject(obj: object) {
        if (!("shape" in obj) || typeof obj.shape !== "number" || !(obj.shape in MazeShape)) {
            return null;
        }
        if (!("maze" in obj) || typeof obj.maze !== "object" || obj.maze === null) {
            return null;
        }
        if (!("start" in obj) || typeof obj.start !== "number") {
            return null;
        }
        if (!("end" in obj) || typeof obj.end !== "number") {
            return null;
        }
        if (!("alg" in obj) || typeof obj.alg !== "number" || !(obj.alg in SolveAlg)) {
            return null;
        }

        switch (obj.shape) {
            case MazeShape.Square: {
                const maze = SquareMaze.fromObject(obj.maze);
                if (maze === null) return null;
                return this.newSquare(maze, obj.start, obj.end, obj.alg);
            }
            default:
                return null;
        }
    }
}
