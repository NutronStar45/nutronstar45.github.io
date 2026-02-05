/*
Defined in common.js:
    alertError
    svgElement

Squares are indexed left-to-right, top-to-bottom, starting from 0.
For example, a maze of width 5 and height 4 is indexed in the following manner:
 0  1  2  3  4
 5  6  7  8  9
10 11 12 13 14
15 16 17 18 19

Walls are split into horizontal and vertical onee
Horizontal walls are indexed by the square on their left
Vertical walls are indexed by the square on their top
*/


/**
 * A maze, represented with its width, height, and horizontal and vertical walls.
 * @typedef {{ width: number, height: number, hWalls: number[], vWalls: number[] }} Maze
 */


// The width of a square when rendered
const MAZE_SQUARE_WIDTH = 20;
// The radius of the rounded corners
const CORNER_RADIUS = 4;
// The precision of reported time
const TIME_PRECISION = 2;


/**
 * Returns timestamp in seconds.
 * @returns {number} Time passed since 0:00:00, January 1, 1970 (UTC) in seconds.
 */
function now() {
    return Date.now() / 1000;
}


/**
 * Appends text to `p#gen-status`.
 * @param {string} text The text to write.
 */
function writeStatusGen(text) {
    let result = $("p#gen-status").html();
    if (result !== "") result += "<br>";
    result += text;
    $("p#gen-status").html(result);
}


/**
 * Appends text to `p#solve-status`.
 * @param {string} text The text to write.
 */
function writeStatusSolve(text) {
    let result = $("p#solve-status").html();
    if (result !== "") result += "<br>";
    result += text;
    $("p#solve-status").html(result);
}


/**
 * Enables/Disables generation and solving.
 * @param {boolean} enabled Enables generation and solving if `true` and disable them if `false`.
 */
function toggleAction(enabled) {
    $("button#gen").prop("disabled", !enabled);
    $("button#solve").prop("disabled", !enabled);
}


/**
 * Renders the walls and border of a maze.
 * @param {Maze} maze The maze.
 */
function renderMaze(maze) {
    // Draw horizontal walls
    for (let wall of maze.hWalls) {
        $("g#maze-walls").append(svgElement("line").attr({
            x1: (wall % maze.width) * MAZE_SQUARE_WIDTH,
            y1: (Math.floor(wall / maze.width) + 1) * MAZE_SQUARE_WIDTH,
            x2: (wall % maze.width + 1) * MAZE_SQUARE_WIDTH,
            y2: (Math.floor(wall / maze.width) + 1) * MAZE_SQUARE_WIDTH,
        }));
    }

    // Draw vertical walls
    for (let wall of maze.vWalls) {
        $("g#maze-walls").append(svgElement("line").attr({
            x1: (wall % maze.width + 1) * MAZE_SQUARE_WIDTH,
            y1: Math.floor(wall / maze.width) * MAZE_SQUARE_WIDTH,
            x2: (wall % maze.width + 1) * MAZE_SQUARE_WIDTH,
            y2: (Math.floor(wall / maze.width) + 1) * MAZE_SQUARE_WIDTH,
        }));
    }

    // The border doesn't get cropped
    $("g#cropped")
        .after(svgElement("path").attr({
            id: "maze-border",
            d: `M${CORNER_RADIUS},0 `
                + `h${maze.width * MAZE_SQUARE_WIDTH - CORNER_RADIUS * 2} `
                + `a${CORNER_RADIUS},${CORNER_RADIUS} 0 0,1 ${CORNER_RADIUS},${CORNER_RADIUS} `
                + `v${maze.height * MAZE_SQUARE_WIDTH - CORNER_RADIUS * 2} `
                + `a${CORNER_RADIUS},${CORNER_RADIUS} 0 0,1 -${CORNER_RADIUS},${CORNER_RADIUS} `
                + `h-${maze.width * MAZE_SQUARE_WIDTH - CORNER_RADIUS * 2} `
                + `a${CORNER_RADIUS},${CORNER_RADIUS} 0 0,1 -${CORNER_RADIUS},-${CORNER_RADIUS} `
                + `v-${maze.height * MAZE_SQUARE_WIDTH - CORNER_RADIUS * 2} `
                + `a${CORNER_RADIUS},${CORNER_RADIUS} 0 0,1 ${CORNER_RADIUS},-${CORNER_RADIUS} `
                + "Z"
        }));
}


/**
 * Renders the solution.
 * @param {number} width The width of the maze.
 * @param {number} _height The height of the maze.
 * @param {number} squaresSolution The list of squares that traces out the solution, excluding the start and the end.
 * @param {number} squaresEndpoints The list containing the start and the end.
 */
function renderSolution(width, _height, squaresSolution, squaresEndpoints) {
    $("g#maze-solution").empty();
    $("g#maze-endpoints").empty();

    // Render solution
    for (let square of squaresSolution) {
        let squareX = square % width;
        let squareY = Math.floor(square / width);

        $("g#maze-solution").append(svgElement("rect").attr({
            width: MAZE_SQUARE_WIDTH,
            height: MAZE_SQUARE_WIDTH,
            x: squareX * MAZE_SQUARE_WIDTH,
            y: squareY * MAZE_SQUARE_WIDTH,
        }));
    }

    // Render endpoints
    for (let square of squaresEndpoints) {
        let squareX = square % width;
        let squareY = Math.floor(square / width);

        $("g#maze-endpoints").append(svgElement("rect").attr({
            width: MAZE_SQUARE_WIDTH,
            height: MAZE_SQUARE_WIDTH,
            x: squareX * MAZE_SQUARE_WIDTH,
            y: squareY * MAZE_SQUARE_WIDTH,
        }));
    }
}


$(() => {
    // Disable generation and solving until worker is ready
    toggleAction(false);
    // Web Worker to offload generation and solving
    const worker = new Worker("/scripts/maze_worker.js");

    /**
     * The generated maze.
     * @type {Maze}
     */
    let maze;
    let startTime;

    $("button#toggle-solution").hide();

    $("button#toggle-solution").on("click", function () {
        $("g#maze-solution").toggle($(this).text() === "Show Path");
        $(this).text($(this).text() === "Show Path" ? "Hide Path" : "Show Path");
    });

    // Generate button pressed
    $("button#gen").on("click", function () {
        let validationTargets = ["input#width", "input#height"];

        if (validate(validationTargets)) {
            $("p#gen-status").empty();
            $("div#maze-img-container").empty();
            $("button#toggle-solution").hide();
            toggleAction(false);

            let width = +$("input#width").val();
            let height = +$("input#height").val();

            startTime = now();
            // Generate maze
            worker.postMessage({ msg: "gen", width, height });
        }
    });

    // Solve button pressed
    $("button#solve").on("click", function () {
        let validationTargets = ["input#start-x", "input#start-y", "input#end-x", "input#end-y"];

        // Check if a maze has been generated
        if (maze === undefined) {
            alertError($(this), "mazeNotGenerated");
        }

        if (validate(validationTargets)) {
            $("p#solve-status").empty();
            toggleAction(false);

            let startX = +$("input#start-x").val();
            let startY = +$("input#start-y").val();
            let start = (startY - 1) * maze.width + (startX - 1);

            let endX = +$("input#end-x").val();
            let endY = +$("input#end-y").val();
            let end = (endY - 1) * maze.width + (endX - 1);

            startTime = now();
            // Calculate solution
            worker.postMessage({ msg: "solve", maze, start, end });
        }
    });

    worker.addEventListener("message", e => {
        switch (e.data.msg) {
            case "ready":
                toggleAction(true);
                break;
            case "gen":
                maze = e.data.maze;
                writeStatusGen(`Maze generation took ${(now() - startTime).toFixed(TIME_PRECISION)}s`);
                startTime = now();

                // Place template SVG
                $("div#maze-img-container").append(svgElement("svg")
                    .attr({
                        id: "maze-img",
                        width: (maze.width + 2) * MAZE_SQUARE_WIDTH,
                        height: (maze.height + 2) * MAZE_SQUARE_WIDTH,
                        viewBox: `-${MAZE_SQUARE_WIDTH} -${MAZE_SQUARE_WIDTH} ${(maze.width + 2) * MAZE_SQUARE_WIDTH} ${(maze.height + 2) * MAZE_SQUARE_WIDTH}`
                    })
                    .append(svgElement("mask").attr("id", "mask")
                        .append(svgElement("path").attr({
                            d: `M${CORNER_RADIUS},0 `
                                + `h${maze.width * MAZE_SQUARE_WIDTH - CORNER_RADIUS * 2} `
                                + `a${CORNER_RADIUS},${CORNER_RADIUS} 0 0,1 ${CORNER_RADIUS},${CORNER_RADIUS} `
                                + `v${maze.height * MAZE_SQUARE_WIDTH - CORNER_RADIUS * 2} `
                                + `a${CORNER_RADIUS},${CORNER_RADIUS} 0 0,1 -${CORNER_RADIUS},${CORNER_RADIUS} `
                                + `h-${maze.width * MAZE_SQUARE_WIDTH - CORNER_RADIUS * 2} `
                                + `a${CORNER_RADIUS},${CORNER_RADIUS} 0 0,1 -${CORNER_RADIUS},-${CORNER_RADIUS} `
                                + `v-${maze.height * MAZE_SQUARE_WIDTH - CORNER_RADIUS * 2} `
                                + `a${CORNER_RADIUS},${CORNER_RADIUS} 0 0,1 ${CORNER_RADIUS},-${CORNER_RADIUS} `
                                + "Z",
                            fill: "white"
                        }))
                    )
                    .append(svgElement("g").attr({
                        id: "cropped",
                        mask: "url(#mask)"
                    })
                        .append(svgElement("g").attr("id", "maze-solution"))
                        .append(svgElement("g").attr("id", "maze-endpoints"))
                        .append(svgElement("g").attr("id", "maze-walls"))
                    )
                );

                // Render maze
                renderMaze(maze);
                writeStatusGen(`Maze rendering took ${(now() - startTime).toFixed(TIME_PRECISION)}s`);
                toggleAction(true);
                break;
            case "solve":
                writeStatusSolve(`Solution calculation took ${(now() - startTime).toFixed(TIME_PRECISION)}s`);
                startTime = now();

                let hidePathAfterSolve = $("input#hide-path-after-solve").is(":checked");

                // Render solution
                renderSolution(maze.width, maze.height, e.data.squaresSolution, e.data.squaresEndpoints);
                writeStatusSolve(`Solution rendering took ${(now() - startTime).toFixed(TIME_PRECISION)}s`);
                toggleAction(true);

                $("g#maze-solution").toggle(!hidePathAfterSolve);
                $("button#toggle-solution")
                    .show()
                    .text(hidePathAfterSolve ? "Show Path" : "Hide Path");
                break;
            default:
                console.error("Received unknown message from worker:", e);
        }
    });
});
