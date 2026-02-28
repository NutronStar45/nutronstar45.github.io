import { isIntegerInRange, isNumericArray, removeItem } from "../../util.mjs";
import { GraphError } from "../../errors.mjs";
import { TurnDirection, type PlaneSubgraph } from "../util.mjs";


/** Directions on a square grid. */
enum SquareDirection {
    Left,
    Right,
    Top,
    Bottom
}


export class SquareMazeGenParams {
    private constructor(
        readonly width: number,
        readonly height: number
    ) {}

    /**
     * Constructs a {@linkcode SquareMazeGenParams}.
     * @param width The width of the maze.
     * @param height The height of the maze.
     * @throws {TypeError} Thrown if the given parameters are invalid.
     */
    static tryNew(width: number, height: number) {
        if (!Number.isInteger(width) || width <= 0) {
            throw new TypeError("Width must be a positive integer");
        }
        if (!Number.isInteger(height) || width <= 0) {
            throw new TypeError("Height must be a positive integer");
        }
        return new SquareMazeGenParams(width, height);
    }

    /** Returns an object containing the parameters. */
    toObject() {
        return { width: this.width, height: this.height };
    }

    /**
     * Constructs a {@linkcode SquareMazeGenParams} from an object.
     * @param obj An object.
     * @throws {TypeError} Thrown if {@linkcode obj} doesn't have the required properties or they are invalid.
     */
    static fromObject(obj: object) {
        if (!("width" in obj) || typeof obj.width !== "number") {
            throw new TypeError("Property doesn't exist or isn't valid: width");
        }
        if (!("height" in obj) || typeof obj.height !== "number") {
            throw new TypeError("Property doesn't exist or isn't valid: height");
        }
        return this.tryNew(obj.width, obj.height);
    }
}


const directionPriority = {
    [TurnDirection.Left]: {
        [SquareDirection.Left]: [
            SquareDirection.Top,
            SquareDirection.Right,
            SquareDirection.Bottom,
            SquareDirection.Left
        ],
        [SquareDirection.Right]: [
            SquareDirection.Bottom,
            SquareDirection.Left,
            SquareDirection.Top,
            SquareDirection.Right
        ],
        [SquareDirection.Top]: [
            SquareDirection.Right,
            SquareDirection.Bottom,
            SquareDirection.Left,
            SquareDirection.Top
        ],
        [SquareDirection.Bottom]: [
            SquareDirection.Left,
            SquareDirection.Top,
            SquareDirection.Right,
            SquareDirection.Bottom
        ]
    },
    [TurnDirection.Right]: {
        [SquareDirection.Left]: [
            SquareDirection.Bottom,
            SquareDirection.Right,
            SquareDirection.Top,
            SquareDirection.Left
        ],
        [SquareDirection.Right]: [
            SquareDirection.Top,
            SquareDirection.Left,
            SquareDirection.Bottom,
            SquareDirection.Right
        ],
        [SquareDirection.Top]: [
            SquareDirection.Left,
            SquareDirection.Bottom,
            SquareDirection.Right,
            SquareDirection.Top
        ],
        [SquareDirection.Bottom]: [
            SquareDirection.Right,
            SquareDirection.Top,
            SquareDirection.Left,
            SquareDirection.Bottom
        ]
    }
};


/**
 * A maze on a square grid, represented with its width, height, and horizontal and vertical walls.
 * 
 * Squares are indexed left-to-right, top-to-bottom, starting from 0.
 * 
 * Walls are split into horizontal and vertical ones.
 * Horizontal walls are indexed by the square on their left, and vertical walls are indexed by the square on their top.
 */
export class SquareMaze implements PlaneSubgraph<number> {
    private constructor(
        readonly width: number,
        readonly height: number,
        private hWalls_: number[],
        private vWalls_: number[]
    ) {}

    /** A getter for horizontal walls. */
    get hWalls() {
        return this.hWalls_;
    }

    /** A getter for vertical walls. */
    get vWalls() {
        return this.vWalls_;
    }

    /**
     * Constructs a {@linkcode SquareMaze}.
     * @param width The width of the maze.
     * @param height The height of the maze.
     * @param hWalls Horizontal walls.
     * @param vWalls Vertical walls.
     * @throws {TypeError} Thrown if the given parameters are invalid.
     */
    static tryNew(width: number, height: number, hWalls: number[], vWalls: number[]) {
        if (!Number.isInteger(width) || width <= 0) {
            throw new TypeError("Width must be a positive integer");
        }
        if (!Number.isInteger(height) || width <= 0) {
            throw new TypeError("Height must be a positive integer");
        }
        if (hWalls.some(wall => !isIntegerInRange(wall, 0, width * (height - 1)))) {
            throw new TypeError("Horizontal walls must be inside the maze");
        }
        if (vWalls.some(wall => !isIntegerInRange(wall, 0, width * height) || (wall + 1) % width === 0)) {
            throw new TypeError("Vertical walls must be inside the maze");
        }
        return new this(width, height, [...new Set(hWalls)], [...new Set(vWalls)]);
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
     * Constructs a {@linkcode SquareMaze} from an object.
     * @param obj An object.
     * @throws {TypeError} Thrown if {@linkcode obj} doesn't have the required properties or they are invalid.
     */
    static fromObject(obj: object) {
        if (!("width" in obj) || typeof obj.width !== "number") {
            throw new TypeError("Property doesn't exist or isn't valid: width");
        }
        if (!("height" in obj) || typeof obj.height !== "number") {
            throw new TypeError("Property doesn't exist or isn't valid: height");
        }
        if (!("hWalls" in obj) || !isNumericArray(obj.hWalls)) {
            throw new TypeError("Property doesn't exist or isn't valid: hWalls");
        }
        if (!("vWalls" in obj) || !isNumericArray(obj.vWalls)) {
            throw new TypeError("Property doesn't exist or isn't valid: vWalls");
        }
        return this.tryNew(obj.width, obj.height, obj.hWalls, obj.vWalls);
    }

    /**
     * A completely connected square grid with the given size.
     * @param width The width.
     * @param height The height.
     * @returns The square grid.
     * @throws {TypeError} Thrown if the given parameters are invalid.
     */
    static supergraph(width: number, height: number) {
        return this.tryNew(width, height, [], []);
    }

    /**
     * Checks whether a given vertex exists in the grid of the given size.
     * @param width The width of the grid.
     * @param height The height of the grid.
     * @param vertex The vertex.
     * @returns Whether the given vertex exists in the grid.
     * @throws {TypeError} Thrown if the given size is invalid.
     */
    static sizeHasVertex(width: number, height: number, vertex: number) {
        if (!Number.isInteger(width) || width <= 0) {
            throw new TypeError("Width must be a positive integer");
        }
        if (!Number.isInteger(height) || height <= 0) {
            throw new TypeError("Height must be a positive integer");
        }
        return isIntegerInRange(vertex, 0, width * height);
    }

    /**
     * Returns the direction of {@linkcode vertex} relative to {@linkcode origin}.
     * @param width The width of the grid.
     * @param origin The origin.
     * @param vertex A vertex.
     * @throws {TypeError} Thrown if the given size is invalid.
     * @throws {GraphError} Thrown if one of the given vertices isn't in the grid
     * or the given vertices aren't adjacent in the grid.
     */
    static direction(width: number, height: number, origin: number, vertex: number) {
        if (!this.sizeHasVertex(width, height, origin)
                || !this.sizeHasVertex(width, height, vertex)) {
            throw new GraphError("Vertex not in grid");
        }

        if (vertex - origin === -width) {
            return SquareDirection.Top;
        } else if (vertex - origin === width) {
            return SquareDirection.Bottom;
        } else if (vertex - origin === -1) {
            return SquareDirection.Left;
        } else if (vertex - origin === 1) {
            return SquareDirection.Right;
        } else {
            throw new GraphError("Vertices not adjacent");
        }
    }

    /**
     * Returns the neighbors of a {@linkcode vertex} and their relative positions on a grid of the given size.
     * @param width The width of the grid.
     * @param height The height of the grid.
     * @param vertex A vertex.
     * @throws {TypeError} Thrown if the given size is invalid.
     * @throws {GraphError} Thrown if the given vertex isn't in the grid.
     */
    static gridNeighborsWithDirections(width: number, height: number, vertex: number) {
        if (!this.sizeHasVertex(width, height, vertex)) {
            throw new GraphError("Vertex not in grid");
        }
        let neighborsWithDirections: { vertex: number, direction: SquareDirection }[] = [];

        // Left
        if (vertex % width !== 0) {
            neighborsWithDirections.push({ vertex: vertex - 1, direction: SquareDirection.Left });
        }
        // Right
        if ((vertex + 1) % width !== 0) {
            neighborsWithDirections.push({ vertex: vertex + 1, direction: SquareDirection.Right });
        }
        // Top
        if (vertex >= width) {
            neighborsWithDirections.push({ vertex: vertex - width, direction: SquareDirection.Top });
        }
        // Bottom
        if (vertex < width * (height - 1)) {
            neighborsWithDirections.push({ vertex: vertex + width, direction: SquareDirection.Bottom });
        }

        return neighborsWithDirections;
    }

    /**
     * Returns the neighbors of {@linkcode vertex} and their relative positions.
     * @param vertex A vertex.
     * @throws {TypeError} Thrown if the given vertex isn't in the graph.
     */
    neighborsWithDirections(vertex: number) {
        if (!this.hasVertex(vertex)) {
            throw new TypeError("Vertex not in graph");
        }
        let neighborsWithDirections: { vertex: number, direction: SquareDirection }[] = [];

        // Left
        if (vertex % this.width !== 0 && !this.vWalls.includes(vertex - 1)) {
            neighborsWithDirections.push({ vertex: vertex - 1, direction: SquareDirection.Left });
        }
        // Right
        if ((vertex + 1) % this.width !== 0 && !this.vWalls.includes(vertex)) {
            neighborsWithDirections.push({ vertex: vertex + 1, direction: SquareDirection.Right });
        }
        // Top
        if (vertex >= this.width && !this.hWalls.includes(vertex - this.width)) {
            neighborsWithDirections.push({ vertex: vertex - this.width, direction: SquareDirection.Top });
        }
        // Bottom
        if (vertex < this.width * (this.height - 1) && !this.hWalls.includes(vertex)) {
            neighborsWithDirections.push({ vertex: vertex + this.width, direction: SquareDirection.Bottom });
        }

        return neighborsWithDirections;
    }

    /**
     * Returns the neighbor of {@linkcode vertex} in the direction {@linkcode direction}.
     * @param width The width of the grid.
     * @param height The height of the grid.
     * @param vertex A vertex.
     * @param direction A direction.
     * @throws {TypeError} Thrown if the given size is invalid.
     * @throws {GraphError} Thrown if the given vertex isn't in the grid or the neighbor doesn't exist.
     */
    static inDirection(width: number, height: number, vertex: number, direction: SquareDirection) {
        const gridNeighborsWithDirections = this.gridNeighborsWithDirections(width, height, vertex);

        // An array containing the neighbor in the given direction, if one exists
        // An empty array otherwise
        const neighbor = gridNeighborsWithDirections.filter(({ vertex: _ver, direction: dir }) => dir === direction);
        if (neighbor[0] === undefined) {
            throw new GraphError("Neighbor doesn't exist in specified direction");
        }

        return neighbor[0].vertex;
    }

    vertices() {
        return Array.from({ length: this.width * this.height }, (_v, i) => i);
    }

    hasVertex(vertex: number) {
        return SquareMaze.sizeHasVertex(this.width, this.height, vertex);
    }

    order() {
        return this.width * this.height;
    }

    hasEdge(vertex1: number, vertex2: number) {
        if (!this.hasVertex(vertex1) || !this.hasVertex(vertex2)) return false;

        if (Math.abs(vertex1 - vertex2) === this.width) {
            return !this.hWalls.includes(Math.min(vertex1, vertex2));
        } else if (Math.abs(vertex1 - vertex2) === 1) {
            return !this.vWalls.includes(Math.min(vertex1, vertex2));
        } else {
            return false;
        }
    }

    neighbors(vertex: number) {
        const neighborsWithDirections = this.neighborsWithDirections(vertex);
        return neighborsWithDirections.map(({ vertex, direction: _dir }) => vertex);
    }

    copy() {
        return SquareMaze.tryNew(this.width, this.height, this.hWalls, this.vWalls) as this;
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

    connect(vertex1: number, vertex2: number) {
        if (!this.hasVertex(vertex1) || !this.hasVertex(vertex2)) return;

        if (Math.abs(vertex1 - vertex2) === this.width) {
            removeItem(this.hWalls_, Math.min(vertex1, vertex2));
        } else if (Math.abs(vertex1 - vertex2) === 1) {
            removeItem(this.vWalls_, Math.min(vertex1, vertex2));
        }
    }

    disconnect(vertex1: number, vertex2: number) {
        if (!this.hasVertex(vertex1) || !this.hasVertex(vertex2)) return;

        if (Math.abs(vertex1 - vertex2) === this.width) {
            this.hWalls_.push(Math.min(vertex1, vertex2));
        } else if (Math.abs(vertex1 - vertex2) === 1) {
            this.vWalls_.push(Math.min(vertex1, vertex2));
        }
    }

    /**
     * Returns the vertex that would be reached if one start from {@linkcode previous}, goes to {@linkcode current}, then takes the path immediately to the left/right.
     * @param previous The previous vertex.
     * @param current The current vertex.
     * @param direction The direction to turn to.
     * @returns The next vertex.
     * @throws {TypeError} Thrown if {@linkcode previous} or {@linkcode current} is not in the graph.
     * @throws {GraphError} Thrown if {@linkcode previous} and {@linkcode current} aren't adjacent.
     */
    turn(previous: number, current: number, direction: TurnDirection) {
        if (!this.hasEdge(previous, current)) {
            throw new GraphError("Vertices not adjacent");
        }

        let priority = directionPriority[direction][SquareMaze.direction(this.width, this.height, current, previous)];

        const neighborsWithDirections = this.neighborsWithDirections(current);

        for (const direction of priority) {
            const neighbor = neighborsWithDirections
                .filter(({ vertex: _ver, direction: dir }) => dir === direction)
                .map(({ vertex: ver, direction: _dir }) => ver)[0];
            if (neighbor !== undefined) {
                return neighbor;
            }
        }

        throw new GraphError("Vertex doesn't have neighbors");
    }

    leftTurn(previous: number, current: number) {
        return this.turn(previous, current, TurnDirection.Left);
    }

    rightTurn(previous: number, current: number) {
        return this.turn(previous, current, TurnDirection.Right);
    }
}
