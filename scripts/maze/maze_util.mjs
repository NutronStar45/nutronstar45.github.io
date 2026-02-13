import { SquareMazeGenerateParams } from "./shapes/maze_square.mjs";
// Time between individual progress reports in milliseconds
export const PROGRESS_REPORT_INTERVAL = 1000;
/** The shape of a maze. */
export var MazeShape;
(function (MazeShape) {
    MazeShape[MazeShape["Square"] = 0] = "Square";
})(MazeShape || (MazeShape = {}));
/** A generation algorithm. */
export var GenerateAlgorithm;
(function (GenerateAlgorithm) {
    GenerateAlgorithm[GenerateAlgorithm["Prims"] = 0] = "Prims";
})(GenerateAlgorithm || (GenerateAlgorithm = {}));
/** A solving algorithm. */
export var SolveAlgorithm;
(function (SolveAlgorithm) {
    SolveAlgorithm[SolveAlgorithm["DeadendFilling"] = 0] = "DeadendFilling";
})(SolveAlgorithm || (SolveAlgorithm = {}));
/**
 * Converts a string into a `GenerateAlgorithm`.
 * @param str A string.
 * @returns A `GenerateAlgorithm`, or `null` if the string doesn't represent a valid algorithm.
 */
export function generateAlgorithmFromString(str) {
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
export function solveAlgorithmFromString(str) {
    switch (str) {
        case "deadendFilling":
            return SolveAlgorithm.DeadendFilling;
        default:
            return null;
    }
}
/** Parameters for maze generation. */
export class GenerateParams {
    shape;
    algorithm;
    params;
    constructor(shape, algorithm, params) {
        this.shape = shape;
        this.algorithm = algorithm;
        this.params = params;
    }
    /**
     * Constructs a `GenerateParams` for a square maze.
     * @param params The parameters of the maze.
     */
    static newSquare(algorithm, params) {
        return new GenerateParams(MazeShape.Square, algorithm, params);
    }
    /** Returns an object containing the options. */
    toObject() {
        return {
            shape: this.shape,
            algorithm: this.algorithm,
            params: this.params.toObject()
        };
    }
    /**
     * Constructs a `GenerateParams` from an object, or `null` if the given object is invalid.
     * @param obj An object.
     * @returns The constructed `GenerateParams`, or `null` if the given object is invalid.
     */
    static fromObject(obj) {
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
                if (params === null)
                    return null;
                return this.newSquare(obj.algorithm, params);
            }
            default:
                return null;
        }
    }
}
