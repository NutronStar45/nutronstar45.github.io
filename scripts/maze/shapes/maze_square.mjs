import { isIntegerInRange, isNumericArray, removeItem } from "../../common_util.mjs";
import {} from "../maze_util.mjs";
/** Directions on a square grid. */
var SquareDirection;
(function (SquareDirection) {
    SquareDirection[SquareDirection["LEFT"] = 0] = "LEFT";
    SquareDirection[SquareDirection["RIGHT"] = 1] = "RIGHT";
    SquareDirection[SquareDirection["TOP"] = 2] = "TOP";
    SquareDirection[SquareDirection["BOTTOM"] = 3] = "BOTTOM";
})(SquareDirection || (SquareDirection = {}));
export class SquareMazeGenParams {
    width;
    height;
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    /**
     * Constructs a {@linkcode SquareMazeGenParams}. Returns `null` if the given parameters are invalid.
     * @param width The width of the maze.
     * @param height The height of the maze.
     */
    static tryNew(width, height) {
        if (!Number.isInteger(width) || width <= 0) {
            return null;
        }
        if (!Number.isInteger(height) || width <= 0) {
            return null;
        }
        return new SquareMazeGenParams(width, height);
    }
    /** Returns an object containing the parameters. */
    toObject() {
        return { width: this.width, height: this.height };
    }
    /**
     * Constructs a {@linkcode SquareMazeGenParams} from an object. Returns `null` if the given object is invalid.
     * @param obj An object.
     */
    static fromObject(obj) {
        if (!("width" in obj) || typeof obj.width !== "number") {
            return null;
        }
        if (!("height" in obj) || typeof obj.height !== "number") {
            return null;
        }
        return this.tryNew(obj.width, obj.height);
    }
}
/**
 * A maze on a square grid, represented with its width, height, and horizontal and vertical walls.
 *
 * Squares are indexed left-to-right, top-to-bottom, starting from 0.
 *
 * Walls are split into horizontal and vertical ones.
 * Horizontal walls are indexed by the square on their left, and vertical walls are indexed by the square on their top.
 */
export class SquareMaze {
    width;
    height;
    hWalls_;
    vWalls_;
    constructor(width, height, hWalls_, vWalls_) {
        this.width = width;
        this.height = height;
        this.hWalls_ = hWalls_;
        this.vWalls_ = vWalls_;
    }
    /** A getter for horizontal walls. */
    get hWalls() {
        return this.hWalls_;
    }
    /** A getter for vertical walls. */
    get vWalls() {
        return this.vWalls_;
    }
    /**
     * Constructs a {@linkcode SquareMaze}. Returns `null` if the given parameters are invalid.
     * @param width The width of the maze.
     * @param height The height of the maze.
     * @param hWalls Horizontal walls.
     * @param vWalls Vertical walls.
     */
    static tryNew(width, height, hWalls, vWalls) {
        if (!Number.isInteger(width) || width <= 0) {
            return null;
        }
        if (!Number.isInteger(height) || width <= 0) {
            return null;
        }
        if (hWalls.some(wall => !isIntegerInRange(wall, 0, width * (height - 1)))) {
            return null;
        }
        if (vWalls.some(wall => !isIntegerInRange(wall, 0, width * height) || (wall + 1) % width === 0)) {
            return null;
        }
        return new SquareMaze(width, height, [...new Set(hWalls)], [...new Set(vWalls)]);
    }
    /** Returns an object that completely characterizes the maze. */
    toObject() {
        return {
            width: this.width,
            height: this.height,
            hWalls: this.hWalls,
            vWalls: this.vWalls
        };
    }
    /**
     * Constructs a {@linkcode SquareMaze} from an object. Returns `null` if the given object is invalid.
     * @param obj An object.
     */
    static fromObject(obj) {
        if (!("width" in obj) || typeof obj.width !== "number") {
            return null;
        }
        if (!("height" in obj) || typeof obj.height !== "number") {
            return null;
        }
        if (!("hWalls" in obj) || !isNumericArray(obj.hWalls)) {
            return null;
        }
        if (!("vWalls" in obj) || !isNumericArray(obj.vWalls)) {
            return null;
        }
        return this.tryNew(obj.width, obj.height, obj.hWalls, obj.vWalls);
    }
    /**
     * A completely connected square grid with the given size.
     * @param width The width.
     * @param height The height.
     * @returns The square grid, or `null` if the given parameters are invalid.
     */
    static supergraph(width, height) {
        return this.tryNew(width, height, [], []);
    }
    /**
     * Checks whether a given vertex exists in the grid of the given size. Returns `false` if the given size is invalid.
     * @param width The width of the grid.
     * @param height The height of the grid.
     * @param vertex The vertex.
     * @returns Whether a given vertex exists in the grid. `false` if the given size is invalid.
     */
    static sizeHasVertex(width, height, vertex) {
        return Number.isInteger(width) && width > 0
            && Number.isInteger(height) && height > 0
            && isIntegerInRange(vertex, 0, width * height);
    }
    /**
     * Returns the direction of {@linkcode vertex} relative to {@linkcode origin}, or `null` if:
     * - the given size is invalid,
     * - one of the given vertices isn't in the grid, or
     * - the given vertices aren't adjacent in the grid.
     * @param width The width of the grid.
     * @param origin The origin.
     * @param vertex A vertex.
     */
    static direction(width, height, origin, vertex) {
        if (!this.sizeHasVertex(width, height, origin)
            || !this.sizeHasVertex(width, height, vertex))
            return null;
        if (vertex - origin === -width) {
            return SquareDirection.TOP;
        }
        else if (vertex - origin === width) {
            return SquareDirection.BOTTOM;
        }
        else if (vertex - origin === -1) {
            return SquareDirection.LEFT;
        }
        else if (vertex - origin === 1) {
            return SquareDirection.RIGHT;
        }
        else {
            return null;
        }
    }
    /**
     * Returns the neighbors of a {@linkcode vertex} and their relative positions on a grid of the given size, or `null` if:
     * - the given size is invalid, or
     * - {@linkcode vertex} isn't in the grid.
     * @param width The width of the grid.
     * @param height The height of the grid.
     * @param vertex A vertex.
     */
    static gridNeighborsWithDirections(width, height, vertex) {
        if (!this.sizeHasVertex(width, height, vertex))
            return null;
        let neighborsWithDirections = [];
        // Left
        if (vertex % width !== 0) {
            neighborsWithDirections.push({ vertex: vertex - 1, direction: SquareDirection.LEFT });
        }
        // Right
        if ((vertex + 1) % width !== 0) {
            neighborsWithDirections.push({ vertex: vertex + 1, direction: SquareDirection.RIGHT });
        }
        // Top
        if (vertex >= width) {
            neighborsWithDirections.push({ vertex: vertex - width, direction: SquareDirection.TOP });
        }
        // Bottom
        if (vertex < width * (height - 1)) {
            neighborsWithDirections.push({ vertex: vertex + width, direction: SquareDirection.BOTTOM });
        }
        return neighborsWithDirections;
    }
    /**
     * Returns the neighbors of {@linkcode vertex} and their relative positions, or `null` if {@linkcode vertex} isn't in the graph.
     * @param vertex A vertex.
     */
    neighborsWithDirections(vertex) {
        if (!this.hasVertex(vertex))
            return null;
        let neighborsWithDirections = [];
        // Left
        if (vertex % this.width !== 0 && !this.vWalls.includes(vertex - 1)) {
            neighborsWithDirections.push({ vertex: vertex - 1, direction: SquareDirection.LEFT });
        }
        // Right
        if ((vertex + 1) % this.width !== 0 && !this.vWalls.includes(vertex)) {
            neighborsWithDirections.push({ vertex: vertex + 1, direction: SquareDirection.RIGHT });
        }
        // Top
        if (vertex >= this.width && !this.hWalls.includes(vertex - this.width)) {
            neighborsWithDirections.push({ vertex: vertex - this.width, direction: SquareDirection.TOP });
        }
        // Bottom
        if (vertex < this.width * (this.height - 1) && !this.hWalls.includes(vertex)) {
            neighborsWithDirections.push({ vertex: vertex + this.width, direction: SquareDirection.BOTTOM });
        }
        return neighborsWithDirections;
    }
    /**
     * Returns the neighbor of {@linkcode vertex} in the direction {@linkcode direction}, or `null` if:
     * - the given size is invalid,
     * - {@linkcode vertex} isn't in the grid, or
     * - the neighbor doesn't exist.
     * @param width The width of the grid.
     * @param height The height of the grid.
     * @param vertex A vertex.
     * @param direction A direction.
     */
    static inDirection(width, height, vertex, direction) {
        const gridNeighborsWithDirections = this.gridNeighborsWithDirections(width, height, vertex);
        if (gridNeighborsWithDirections === null)
            return null;
        // An array containing the neighbor in the given direction, if one exists
        // An empty array otherwise
        const neighbor = gridNeighborsWithDirections.filter(({ vertex: _ver, direction: dir }) => dir === direction);
        if (neighbor[0] === undefined)
            return null;
        return neighbor[0].vertex;
    }
    vertices() {
        return Array.from({ length: this.width * this.height }, (_v, i) => i);
    }
    hasVertex(vertex) {
        return SquareMaze.sizeHasVertex(this.width, this.height, vertex);
    }
    order() {
        return this.width * this.height;
    }
    hasEdge(vertex1, vertex2) {
        if (!this.hasVertex(vertex1) || !this.hasVertex(vertex2))
            return false;
        if (Math.abs(vertex1 - vertex2) === this.width) {
            return !this.hWalls.includes(Math.min(vertex1, vertex2));
        }
        else if (Math.abs(vertex1 - vertex2) === 1) {
            return !this.vWalls.includes(Math.min(vertex1, vertex2));
        }
        else {
            return false;
        }
    }
    neighbors(vertex) {
        const neighborsWithDirections = this.neighborsWithDirections(vertex);
        if (neighborsWithDirections !== null) {
            return neighborsWithDirections.map(({ vertex, direction: _dir }) => vertex);
        }
        else {
            return null;
        }
    }
    copy() {
        return SquareMaze.tryNew(this.width, this.height, this.hWalls, this.vWalls);
    }
    empty() {
        // Build horizontal walls
        this.hWalls_ = [];
        for (let vIndex = 0; vIndex < this.height - 1; vIndex++) {
            for (let hIndex = 0; hIndex < this.width; hIndex++) {
                this.hWalls_.push(vIndex * this.width + hIndex);
            }
        }
        // Build vertical walls
        this.vWalls_ = [];
        for (let vIndex = 0; vIndex < this.height; vIndex++) {
            for (let hIndex = 0; hIndex < this.width - 1; hIndex++) {
                this.vWalls_.push(vIndex * this.width + hIndex);
            }
        }
    }
    connect(vertex1, vertex2) {
        if (!this.hasVertex(vertex1) || !this.hasVertex(vertex2))
            return;
        if (Math.abs(vertex1 - vertex2) === this.width) {
            removeItem(this.hWalls_, Math.min(vertex1, vertex2));
        }
        else if (Math.abs(vertex1 - vertex2) === 1) {
            removeItem(this.vWalls_, Math.min(vertex1, vertex2));
        }
    }
    disconnect(vertex1, vertex2) {
        if (!this.hasVertex(vertex1) || !this.hasVertex(vertex2))
            return;
        if (Math.abs(vertex1 - vertex2) === this.width) {
            this.hWalls_.push(Math.min(vertex1, vertex2));
        }
        else if (Math.abs(vertex1 - vertex2) === 1) {
            this.vWalls_.push(Math.min(vertex1, vertex2));
        }
    }
    rightTurn(previous, current) {
        if (!this.hasEdge(previous, current))
            return null;
        const neighborsWithDirections = this.neighborsWithDirections(current);
        if (neighborsWithDirections === null)
            return null;
        let directionsPriority = [];
        switch (SquareMaze.direction(this.width, this.height, current, previous)) {
            case SquareDirection.LEFT:
                directionsPriority = [
                    SquareDirection.BOTTOM,
                    SquareDirection.RIGHT,
                    SquareDirection.TOP,
                    SquareDirection.LEFT
                ];
                break;
            case SquareDirection.RIGHT:
                directionsPriority = [
                    SquareDirection.TOP,
                    SquareDirection.LEFT,
                    SquareDirection.BOTTOM,
                    SquareDirection.RIGHT
                ];
                break;
            case SquareDirection.TOP:
                directionsPriority = [
                    SquareDirection.LEFT,
                    SquareDirection.BOTTOM,
                    SquareDirection.RIGHT,
                    SquareDirection.TOP
                ];
                break;
            case SquareDirection.BOTTOM:
                directionsPriority = [
                    SquareDirection.RIGHT,
                    SquareDirection.TOP,
                    SquareDirection.LEFT,
                    SquareDirection.BOTTOM
                ];
                break;
        }
        for (const direction of directionsPriority) {
            const neighbor = SquareMaze.inDirection(this.width, this.height, current, direction);
            if (neighbor !== null)
                return neighbor;
        }
        return null;
    }
    leftTurn(previous, current) {
        if (!this.hasEdge(previous, current))
            return null;
        const neighborsWithDirections = this.neighborsWithDirections(current);
        if (neighborsWithDirections === null)
            return null;
        let directionsPriority = [];
        switch (SquareMaze.direction(this.width, this.height, current, previous)) {
            case SquareDirection.LEFT:
                directionsPriority = [
                    SquareDirection.TOP,
                    SquareDirection.RIGHT,
                    SquareDirection.BOTTOM,
                    SquareDirection.LEFT
                ];
                break;
            case SquareDirection.RIGHT:
                directionsPriority = [
                    SquareDirection.BOTTOM,
                    SquareDirection.LEFT,
                    SquareDirection.TOP,
                    SquareDirection.RIGHT
                ];
                break;
            case SquareDirection.TOP:
                directionsPriority = [
                    SquareDirection.RIGHT,
                    SquareDirection.BOTTOM,
                    SquareDirection.LEFT,
                    SquareDirection.TOP
                ];
                break;
            case SquareDirection.BOTTOM:
                directionsPriority = [
                    SquareDirection.LEFT,
                    SquareDirection.TOP,
                    SquareDirection.RIGHT,
                    SquareDirection.BOTTOM
                ];
                break;
        }
        for (const direction of directionsPriority) {
            const neighbor = SquareMaze.inDirection(this.width, this.height, current, direction);
            if (neighbor !== null)
                return neighbor;
        }
        return null;
    }
}
;
