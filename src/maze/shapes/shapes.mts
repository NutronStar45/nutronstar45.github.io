import { MazeShape, GenAlg, SolveAlg } from "../util.mjs";
import { SquareMazeGenParams, SquareMaze } from "./square.mjs";

export type Maze = SquareMaze;

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
     * Constructs a {@linkcode GenParams} from an object.
     * @param obj An object.
     * @throws {TypeError} Thrown if {@linkcode obj} doesn't have the required properties or they are invalid.
     */
    static fromObject(obj: object) {
        if (!("shape" in obj) || typeof obj.shape !== "number" || !(obj.shape in MazeShape)) {
            throw new TypeError("Property doesn't exist or isn't valid: shape");
        }
        if (!("alg" in obj) || typeof obj.alg !== "number" || !(obj.alg in GenAlg)) {
            throw new TypeError("Property doesn't exist or isn't valid: alg");
        }
        if (!("params" in obj) || typeof obj.params !== "object" || obj.params === null) {
            throw new TypeError("Property doesn't exist or isn't valid: params");
        }

        switch (obj.shape) {
            case MazeShape.Square: {
                const params = SquareMazeGenParams.fromObject(obj.params);
                return this.newSquare(obj.alg, params);
            }
            default:
                throw new Error("Property doesn't exist or isn't valid: shape");
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
     * Constructs a {@linkcode SolveParams} for a square maze.
     * @param maze The maze to be solved.
     * @param start The start.
     * @param end The destination.
     * @param alg The solving algorithm.
     * @throws {TypeError} Thrown if {@linkcode start} or {@linkcode end} isn't in the maze.
     */
    static newSquare(maze: SquareMaze, start: number, end: number, alg: SolveAlg) {
        if (!maze.hasVertex(start) || !maze.hasVertex(end)) {
            throw new TypeError("Vertices not in graph");
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
     * Constructs a {@linkcode SolveParams} from an object.
     * @param obj An object.
     * @throws {TypeError} Thrown if {@linkcode obj} doesn't have the required properties or they are invalid.
     */
    static fromObject(obj: object) {
        if (!("shape" in obj) || typeof obj.shape !== "number" || !(obj.shape in MazeShape)) {
            throw new TypeError("Property doesn't exist or isn't valid: shape");
        }
        if (!("maze" in obj) || typeof obj.maze !== "object" || obj.maze === null) {
            throw new TypeError("Property doesn't exist or isn't valid: maze");
        }
        if (!("start" in obj) || typeof obj.start !== "number") {
            throw new TypeError("Property doesn't exist or isn't valid: start");
        }
        if (!("end" in obj) || typeof obj.end !== "number") {
            throw new TypeError("Property doesn't exist or isn't valid: end");
        }
        if (!("alg" in obj) || typeof obj.alg !== "number" || !(obj.alg in SolveAlg)) {
            throw new TypeError("Property doesn't exist or isn't valid: alg");
        }

        switch (obj.shape) {
            case MazeShape.Square: {
                const maze = SquareMaze.fromObject(obj.maze);
                return this.newSquare(maze, obj.start, obj.end, obj.alg);
            }
            default:
                throw new TypeError("Property doesn't exist or isn't valid: shape");
        }
    }
}
