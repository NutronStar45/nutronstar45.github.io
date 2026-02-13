import { SquareMazeGenerateParams } from "./shapes/maze_square.mjs";

// Time between individual progress reports in milliseconds
export const PROGRESS_REPORT_INTERVAL = 1000;


/** The shape of a maze. */
export enum MazeShape {
    Square
}


/** A generation algorithm. */
export enum GenerateAlgorithm {
    Prims
}


/** A solving algorithm. */
export enum SolveAlgorithm {
    DeadendFilling
}


/**
 * Converts a string into a `GenerateAlgorithm`.
 * @param str A string.
 * @returns A `GenerateAlgorithm`, or `null` if the string doesn't represent a valid algorithm.
 */
export function generateAlgorithmFromString(str: string) {
    switch (str) {
        case "prims":
            return GenerateAlgorithm.Prims;
        default:
            return null;
    }
}


/**
 * Converts a string into a `SolveAlgorithm`.
 * @param str A string.
 * @returns A `SolveAlgorithm`, or `null` if the string doesn't represent a valid algorithm.
 */
export function solveAlgorithmFromString(str: string) {
    switch (str) {
        case "deadendFilling":
            return SolveAlgorithm.DeadendFilling;
        default:
            return null;
    }
}


/** Parameters for maze generation. */
export class GenerateParams {
    private constructor(
        readonly shape: MazeShape,
        readonly algorithm: GenerateAlgorithm,
        readonly params: SquareMazeGenerateParams
    ) {}

    /**
     * Constructs a `GenerateParams` for a square maze.
     * @param params The parameters of the maze.
     */
    static newSquare(algorithm: GenerateAlgorithm, params: SquareMazeGenerateParams) {
        return new GenerateParams(MazeShape.Square, algorithm, params);
    }

    /** Returns an object containing the options. */
    toObject() {
        return {
            shape: this.shape,
            algorithm: this.algorithm,
            params: this.params.toObject()
        }
    }

    /**
     * Constructs a `GenerateParams` from an object, or `null` if the given object is invalid.
     * @param obj An object.
     * @returns The constructed `GenerateParams`, or `null` if the given object is invalid.
     */
    static fromObject(obj: object) {
        if (!("shape" in obj) || typeof obj.shape !== "number" || !(obj.shape in MazeShape)) {
            return null;
        }
        if (!("algorithm" in obj) || typeof obj.algorithm !== "number" || !(obj.algorithm in GenerateAlgorithm)) {
            return null;
        }
        if (!("params" in obj) || typeof obj.params !== "object" || obj.params === null) {
            return null;
        }

        switch (obj.shape) {
            case MazeShape.Square: {
                const params = SquareMazeGenerateParams.fromObject(obj.params);
                if (params === null) return null;
                return this.newSquare(obj.algorithm, params);
            }
            default:
                return null;
        }
    }
}


/**
 * A subgraph of a fixed simple graph.
 * @template V The type of the vertices.
 */
export interface Subgraph<V> {
    /**
     * Returns the vertices.
     */
    vertices(): V[];

    /**
     * Checks whether a given vertex exists in the graph.
     * @param vertex The vertex.
     * @returns Whether a given vertex exists in the graph.
     */
    hasVertex(vertex: V): boolean;

    /**
     * Returns the number of vertices.
     */
    order(): number;

    /**
     * Returns whether two vertices are adjacent, i.e. are joined by an edge.
     * @param vertex1 One of the endpoints.
     * @param vertex2 One of the endpoints.
     * @returns Whether `vertex1` and `vertex2` are adjacent or not.
     */
    hasEdge(vertex1: V, vertex2: V): boolean;

    /**
     * Returns the neighbors of a given vertex, or `null` if `vertex` isn't in the graph.
     * @param vertex A vertex.
     */
    neighbors(vertex: V): V[] | null;

    /**
     * Returns a copy that preserves references to vertices.
     */
    copy(): this;

    /**
     * Removes all edges.
     */
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
     * Returns the vertex that would be reached if one start from `previous`, goes to `current`, then takes the path immediately to the right.
     * @param previous The previous vertex.
     * @param current The current vertex.
     * @returns The next vertex, or `null` if:
     * - one of the given vertices isn't in the graph, or
     * - the edge from `previous` to `current` isn't in the graph.
     */
    rightTurn(previous: V, current: V): V | null;

    /**
     * Returns the vertex that would be reached if one start from `previous`, goes to `current`, then takes the path immediately to the left.
     * @param previous The previous vertex.
     * @param current The current vertex.
     * @returns The next vertex, or `null` if:
     * - one of the given vertices isn't in the graph, or
     * - the edge from `previous` to `current` isn't in the graph.
     */
    leftTurn(previous: V, current: V): V | null;
}
