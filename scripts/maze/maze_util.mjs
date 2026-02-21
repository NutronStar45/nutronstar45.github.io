import { SquareMazeGenParams, SquareMaze } from "./shapes/maze_square.mjs";
// Time between individual progress reports in milliseconds
export const PROGRESS_REPORT_INTERVAL = 1000;
/** The shape of a maze. */
export var MazeShape;
(function (MazeShape) {
    MazeShape[MazeShape["Square"] = 0] = "Square";
})(MazeShape || (MazeShape = {}));
/** A generation algorithm. */
export var GenAlg;
(function (GenAlg) {
    GenAlg[GenAlg["Prims"] = 0] = "Prims";
})(GenAlg || (GenAlg = {}));
/** A solving algorithm. */
export var SolveAlg;
(function (SolveAlg) {
    SolveAlg[SolveAlg["DeadendFilling"] = 0] = "DeadendFilling";
})(SolveAlg || (SolveAlg = {}));
/**
 * Converts a string into a {@linkcode GenAlg}.
 * @param str A string.
 * @returns A {@linkcode GenAlg}, or `null` if the string doesn't represent a valid algorithm.
 */
export function genAlgFromString(str) {
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
export function solveAlgFromString(str) {
    switch (str) {
        case "deadendFilling":
            return SolveAlg.DeadendFilling;
        default:
            return null;
    }
}
/** Parameters for maze generation. */
export class GenParams {
    shape;
    alg;
    params;
    constructor(shape, alg, params) {
        this.shape = shape;
        this.alg = alg;
        this.params = params;
    }
    /**
     * Constructs a {@linkcode GenParams} for a square maze.
     * @param params The parameters of the maze.
     */
    static newSquare(alg, params) {
        return new this(MazeShape.Square, alg, params);
    }
    /** Returns an object containing the parameters. */
    toObject() {
        return {
            shape: this.shape,
            alg: this.alg,
            params: this.params.toObject()
        };
    }
    /**
     * Constructs a {@linkcode GenParams} from an object. Returns `null` if the given object is invalid.
     * @param obj An object.
     */
    static fromObject(obj) {
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
                if (params === null)
                    return null;
                return this.newSquare(obj.alg, params);
            }
            default:
                return null;
        }
    }
}
/** Parameters for maze solving. */
export class SolveParams {
    shape;
    maze;
    start;
    end;
    alg;
    constructor(shape, maze, start, end, alg) {
        this.shape = shape;
        this.maze = maze;
        this.start = start;
        this.end = end;
        this.alg = alg;
    }
    /**
     * Constructs a {@linkcode SolveParams} for a square maze. Returns `null` if {@linkcode start} or {@linkcode end} isn't in the maze.
     * @param maze The maze to be solved.
     * @param start The start.
     * @param end The destination.
     * @param alg The solving algorithm.
     */
    static newSquare(maze, start, end, alg) {
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
        };
    }
    /**
     * Constructs a {@linkcode SolveParams} from an object. Returns `null` if the given object is invalid.
     * @param obj An object.
     */
    static fromObject(obj) {
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
                if (maze === null)
                    return null;
                return this.newSquare(maze, obj.start, obj.end, obj.alg);
            }
            default:
                return null;
        }
    }
}
