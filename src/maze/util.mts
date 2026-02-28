// `GraphError` is used by JSDoc inside `PlaneSubgraph`
import { type GraphError } from "../errors.mjs";

// Time between individual progress reports in milliseconds
export const PROGRESS_REPORT_INTERVAL = 1000;


/** The shape of a maze. */
export enum MazeShape {
    Square
}


/** A direction to turn to on a plane. */
export enum TurnDirection {
    Left,
    Right
}


/** A generation algorithm. */
export enum GenAlg {
    Prims
}


/** A solving algorithm. */
export enum SolveAlg {
    DeadendFilling,
    LeftHandRule,
    RightHandRule,
    RandomDFS,
    RandomMouse
}


/**
 * Converts a string into a {@linkcode GenAlg}.
 * @param str A string.
 * @returns The corresponding {@linkcode GenAlg}.
 * @throws {TypeError} Thrown if the string doesn't represent a valid algorithm.
 */
export function genAlgFromString(str: string) {
    switch (str) {
        case "prims":
            return GenAlg.Prims;
        default:
            throw new TypeError("Invalid algorithm");
    }
}


/**
 * Converts a string into a {@linkcode SolveAlg}.
 * @param str A string.
 * @returns The corresponding {@linkcode SolveAlg}.
 * @throws {TypeError} Thrown if the string doesn't represent a valid algorithm.
 */
export function solveAlgFromString(str: string) {
    switch (str) {
        case "deadendFilling":
            return SolveAlg.DeadendFilling;
        case "leftHandRule":
            return SolveAlg.LeftHandRule;
        case "rightHandRule":
            return SolveAlg.RightHandRule;
        case "randomDFS":
            return SolveAlg.RandomDFS;
        case "randomMouse":
            return SolveAlg.RandomMouse;
        default:
            throw new TypeError("Invalid algorithm");
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
     * Returns the neighbors of a given vertex.
     * @param vertex A vertex.
     * @throws {TypeError} Thrown if {@linkcode vertex} isn't in the graph.
     */
    neighbors(vertex: V): V[];

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
     * Returns the vertex that would be reached if one start from {@linkcode previous}, goes to {@linkcode current}, then takes the path immediately to the left.
     * @param previous The previous vertex.
     * @param current The current vertex.
     * @returns The next vertex.
     * @throws {TypeError} Thrown if one of the given vertices is not in the graph.
     * @throws {GraphError} Thrown if the given vertices aren't adjacent.
     */
    leftTurn(previous: V, current: V): V;

    /**
     * Returns the vertex that would be reached if one start from {@linkcode previous}, goes to {@linkcode current}, then takes the path immediately to the right.
     * @param previous The previous vertex.
     * @param current The current vertex.
     * @returns The next vertex.
     * @throws {TypeError} Thrown if one of the given vertices is not in the graph.
     * @throws {GraphError} Thrown if the given vertices aren't adjacent.
     */
    rightTurn(previous: V, current: V): V;
}
