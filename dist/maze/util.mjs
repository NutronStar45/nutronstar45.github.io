// `GraphError` is used by JSDoc inside `PlaneSubgraph`
import {} from "../errors.mjs";
// Time between individual progress reports in milliseconds
export const PROGRESS_REPORT_INTERVAL = 1000;
/** The shape of a maze. */
export var MazeShape;
(function (MazeShape) {
    MazeShape[MazeShape["Square"] = 0] = "Square";
})(MazeShape || (MazeShape = {}));
/** A direction to turn to on a plane. */
export var TurnDirection;
(function (TurnDirection) {
    TurnDirection[TurnDirection["Left"] = 0] = "Left";
    TurnDirection[TurnDirection["Right"] = 1] = "Right";
})(TurnDirection || (TurnDirection = {}));
/** A generation algorithm. */
export var GenAlg;
(function (GenAlg) {
    GenAlg[GenAlg["Prims"] = 0] = "Prims";
})(GenAlg || (GenAlg = {}));
/** A solving algorithm. */
export var SolveAlg;
(function (SolveAlg) {
    SolveAlg[SolveAlg["DeadendFilling"] = 0] = "DeadendFilling";
    SolveAlg[SolveAlg["LeftHandRule"] = 1] = "LeftHandRule";
    SolveAlg[SolveAlg["RightHandRule"] = 2] = "RightHandRule";
    SolveAlg[SolveAlg["RandomDFS"] = 3] = "RandomDFS";
    SolveAlg[SolveAlg["RandomMouse"] = 4] = "RandomMouse";
})(SolveAlg || (SolveAlg = {}));
/**
 * Converts a string into a {@linkcode GenAlg}.
 * @param str A string.
 * @returns The corresponding {@linkcode GenAlg}.
 * @throws {TypeError} Thrown if the string doesn't represent a valid algorithm.
 */
export function genAlgFromString(str) {
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
export function solveAlgFromString(str) {
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
