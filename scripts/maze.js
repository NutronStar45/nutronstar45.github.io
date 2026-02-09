/*
Squares are indexed left-to-right, top-to-bottom, starting from 0.
For example, a maze of width 5 and height 4 is indexed in the following manner:
 0  1  2  3  4
 5  6  7  8  9
10 11 12 13 14
15 16 17 18 19

Walls are split into horizontal and vertical ones
Horizontal walls are indexed by the square on their left
Vertical walls are indexed by the square on their top
*/


/**
 * A maze, represented with its width, height, and horizontal and vertical walls.
 * @typedef {{ width: number, height: number, hWalls: number[], vWalls: number[] }} Maze
 */


// The width of a square in the resulting SVG
const MAZE_SQUARE_WIDTH = 20;
// The radius of the rounded corners
const CORNER_RADIUS = 4;
// The precision of reported time during a process
const TIME_PRECISION = 0;
// The precision of final reported time
const FINAL_TIME_PRECISION = 2;


/**
 * Enables/Disables tasks (generation and solving).
 * @param {boolean} enabled Enable tasks if `true` and disable if `false`.
 */
function toggleTasks(enabled) {
    $("button#generate").prop("disabled", !enabled);
    $("button#solve").prop("disabled", !enabled);
}


/**
 * Returns the SVG template of a maze of given size.
 * @param {number} width The width of the maze.
 * @param {number} height The height of the maze.
 * @returns {jQuery} The jQuery object containing the SVG template.
 */
function mazeSVGTemplate(width, height) {
    return svgElement("svg")
        .attr({
            id: "maze-img",
            width: (width + 2) * MAZE_SQUARE_WIDTH,
            height: (height + 2) * MAZE_SQUARE_WIDTH,
            viewBox: `-${MAZE_SQUARE_WIDTH} -${MAZE_SQUARE_WIDTH} ${(width + 2) * MAZE_SQUARE_WIDTH} ${(height + 2) * MAZE_SQUARE_WIDTH}`
        })
        .append(svgElement("mask").attr("id", "mask")
            .append(svgElement("path").attr({
                d: `M${CORNER_RADIUS},0 `
                    + `h${width * MAZE_SQUARE_WIDTH - CORNER_RADIUS * 2} `
                    + `a${CORNER_RADIUS},${CORNER_RADIUS} 0 0,1 ${CORNER_RADIUS},${CORNER_RADIUS} `
                    + `v${height * MAZE_SQUARE_WIDTH - CORNER_RADIUS * 2} `
                    + `a${CORNER_RADIUS},${CORNER_RADIUS} 0 0,1 -${CORNER_RADIUS},${CORNER_RADIUS} `
                    + `h-${width * MAZE_SQUARE_WIDTH - CORNER_RADIUS * 2} `
                    + `a${CORNER_RADIUS},${CORNER_RADIUS} 0 0,1 -${CORNER_RADIUS},-${CORNER_RADIUS} `
                    + `v-${height * MAZE_SQUARE_WIDTH - CORNER_RADIUS * 2} `
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
        );
}


/**
 * Draws the walls and border of a maze.
 * @param {Maze} maze The maze.
 * @param {jQuery} $mazeSVG The SVG to draw onto. Expects a template.
 */
function drawMaze(maze, $mazeSVG) {
    const $gWalls = $mazeSVG.find("g#maze-walls");

    // Draw horizontal walls
    for (const wall of maze.hWalls) {
        $gWalls.append(svgElement("line").attr({
            x1: (wall % maze.width) * MAZE_SQUARE_WIDTH,
            y1: (Math.floor(wall / maze.width) + 1) * MAZE_SQUARE_WIDTH,
            x2: (wall % maze.width + 1) * MAZE_SQUARE_WIDTH,
            y2: (Math.floor(wall / maze.width) + 1) * MAZE_SQUARE_WIDTH,
        }));
    }

    // Draw vertical walls
    for (const wall of maze.vWalls) {
        $gWalls.append(svgElement("line").attr({
            x1: (wall % maze.width + 1) * MAZE_SQUARE_WIDTH,
            y1: Math.floor(wall / maze.width) * MAZE_SQUARE_WIDTH,
            x2: (wall % maze.width + 1) * MAZE_SQUARE_WIDTH,
            y2: (Math.floor(wall / maze.width) + 1) * MAZE_SQUARE_WIDTH,
        }));
    }

    // The border doesn't get cropped
    $mazeSVG.find("g#cropped")
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
 * Draws the solution.
 * @param {number} width The width of the maze.
 * @param {number} _height The height of the maze.
 * @param {number} squaresSolution The list of squares that traces out the solution, excluding the start and the end.
 * @param {number} squaresEndpoints The list containing the start and the end.
 * @param {jQuery} $mazeSVG The SVG to draw onto. Expects a template with a maze drawn onto it.
 */
function drawSolution(width, _height, squaresSolution, squaresEndpoints, $mazeSVG) {
    const $gSolution = $mazeSVG.find("g#maze-solution").empty();
    const $gEndpoints = $mazeSVG.find("g#maze-endpoints").empty();

    /**
     * Draws a square under an element.
     * @param {number} square The square to be drawn.
     * @param {jQuery} $parent The element to draw the square under.
     */
    function drawSquare(square, $parent) {
        const squareX = square % width;
        const squareY = Math.floor(square / width);

        $parent.append(svgElement("rect").attr({
            width: MAZE_SQUARE_WIDTH,
            height: MAZE_SQUARE_WIDTH,
            x: squareX * MAZE_SQUARE_WIDTH,
            y: squareY * MAZE_SQUARE_WIDTH,
        }));
    }

    // Draw solution
    for (const square of squaresSolution) {
        drawSquare(square, $gSolution);
    }

    // Draw endpoints
    for (const square of squaresEndpoints) {
        drawSquare(square, $gEndpoints);
    }
}


$(() => {
    $("div#subsec-generator-status").hide();
    $("div#subsec-solver-status").hide();
    $("div#subsec-download").hide();
    $("div#subsec-solution-visibility").hide();

    // Prevent tasks before worker is ready
    toggleTasks(false);
    // Web Worker to offload generation and solving
    const worker = new Worker("/scripts/maze_worker.js");

    let maze; // Internally stored maze with type `Maze`
    let $mazeSVG; // Maze SVG internally stored as a jQuery object
    let solutionVisible; // Whether `g#maze-solution` is visible or not
    let endpointsVisible; // Whether `g#maze-endpoints` is visible or not

    $("input#show-solution").on("change", function () {
        solutionVisible = this.checked;
        $("g#maze-solution").toggle(solutionVisible);
    });

    $("input#show-endpoints").on("change", function () {
        endpointsVisible = this.checked;
        $("g#maze-endpoints").toggle(endpointsVisible);
    });

    // Generate button pressed
    $("button#generate").on("click", function () {
        const $validationTargets = $("input#width, input#height");

        if (validate($validationTargets)) {
            // Show generator status
            // Hide solver status
            $("div#subsec-generator-status").show();
            $("div#subsec-solver-status").hide();

            // Reset maze drawing time
            $("span#draw-maze-time").text("0s");

            // Hide solution and endpoints toggle
            $("div#subsec-solution-visibility").hide();

            // Prevent additional tasks
            toggleTasks(false);

            // Fetch parameters from user input
            const width = +$("input#width").val();
            const height = +$("input#height").val();

            // Generate maze
            worker.postMessage({ msg: "generate", width, height });
        }
    });

    // Solve button pressed
    $("button#solve").on("click", function () {
        const $validationTargets = $("input#start-x, input#start-y, input#end-x, input#end-y");

        // Check if a maze has been generated
        if (maze === undefined) {
            alertError($(this), "mazeNotGenerated");
            return;
        }

        if (validate($validationTargets)) {
            // Show solver status
            $("div#subsec-solver-status").show();

            // Reset solution drawing time
            $("span#draw-solution-time").text("0s");

            // Prevent additional tasks
            toggleTasks(false);

            // Fetch parameters from user input
            const startX = +$("input#start-x").val();
            const startY = +$("input#start-y").val();
            const start = (startY - 1) * maze.width + (startX - 1);

            const endX = +$("input#end-x").val();
            const endY = +$("input#end-y").val();
            const end = (endY - 1) * maze.width + (endX - 1);

            // Calculate solution
            worker.postMessage({ msg: "solve", maze, start, end });
        }
    });

    // Download
    $("button#download").on("click", function () {
        const $standaloneSVG = $mazeSVG.clone();
        $standaloneSVG.attr("xmlns", "http://www.w3.org/2000/svg");

        // Style
        const bgColor = $(":root").css("--bg-color");
        const fgColor = $(":root").css("--fg-color");
        const solutionColor = $(":root").css("--solution-color");
        const endpointColor = $(":root").css("--endpoint-color");
        const wallThickness = $(":root").css("--wall-thickness");
        const css = ":root { "
                + `--bg-color: ${bgColor}; `
                + `--fg-color: ${fgColor}; `
                + `--solution-color: ${solutionColor}; `
                + `--endpoint-color: ${endpointColor}; `
                + `--wall-thickness: ${wallThickness}; `
            + "} svg { "
                + "background-color: var(--bg-color); "
            + "} g#maze-walls { "
                + "stroke-width: var(--wall-thickness); "
                + "stroke: var(--fg-color); "
                + "stroke-linecap: round; "
            + "} path#maze-border { "
                + "fill: none; "
                + "stroke-width: var(--wall-thickness); "
                + "stroke: var(--fg-color); "
            + "} g#maze-solution { "
                + "fill: var(--solution-color); "
            + "} g#maze-endpoints { "
                + "fill: var(--endpoint-color); "
            + "}";
        $standaloneSVG.prepend(svgElement("style").text(css));

        if (!solutionVisible) {
            $standaloneSVG.find("g#maze-solution").empty();
        }
        if (!endpointsVisible) {
            $standaloneSVG.find("g#maze-endpoints").empty();
        }

        downloadFile($standaloneSVG[0].outerHTML, "maze.svg");
    });

    // Message received from worker
    worker.addEventListener("message", e => {
        let startTime;
        switch (e.data.msg) {
            // Worker ready
            case "ready":
                toggleTasks(true);
                break;

            // Generation complete
            case "generateComplete":
                maze = e.data.maze;
                $("span#generate-time").text(`${(e.data.time / 1000).toFixed(FINAL_TIME_PRECISION)}s`);
                startTime = Date.now();

                // Initialize SVG
                $mazeSVG = mazeSVGTemplate(maze.width, maze.height);

                // Draw maze
                drawMaze(maze, $mazeSVG);
                $("div#maze-img-container").empty();
                $("div#maze-img-container").append($mazeSVG.clone());

                // Enable downloading
                $("div#subsec-download").show();

                // Remove "maze not yet generated" alert
                $("button#solve").next("span.alert-mazeNotGenerated").remove();

                // Limit solving parameters
                $("input#start-x").attr("max", maze.width);
                $("input#start-y").attr("max", maze.height);
                $("input#end-x").attr("max", maze.width);
                $("input#end-y").attr("max", maze.height);

                $("span#draw-maze-time").text(`${((Date.now() - startTime) / 1000).toFixed(FINAL_TIME_PRECISION)}s`);
                toggleTasks(true);

                break;

            // Generation progress report
            case "generateProgress":
                $("span#generate-progress").text(`${e.data.progress}%`);
                $("span#generate-time").text(`${(e.data.time / 1000).toFixed(TIME_PRECISION)}s`);
                break;

            // Solving complete
            case "solveComplete":
                $("span#solve-time").text(`${(e.data.time / 1000).toFixed(FINAL_TIME_PRECISION)}s`);
                startTime = Date.now();

                const hideSolutionAfterSolve = $("input#hide-solution-after-solve").is(":checked");

                // Draw solution
                drawSolution(maze.width, maze.height, e.data.squaresSolution, e.data.squaresEndpoints, $mazeSVG);
                $("div#maze-img-container").empty();
                $("div#maze-img-container").append($mazeSVG.clone());

                $("span#draw-solution-time").text(`${((Date.now() - startTime) / 1000).toFixed(FINAL_TIME_PRECISION)}s`);
                toggleTasks(true);

                solutionVisible = !hideSolutionAfterSolve;
                $("input#show-solution").prop("checked", solutionVisible);
                endpointsVisible = true;
                $("input#show-endpoints").prop("checked", endpointsVisible);

                $("g#maze-solution").toggle(solutionVisible);
                $("g#maze-endpoints").show();
                $("div#subsec-solution-visibility").show();

                break;

            // Solving progress report
            case "solveProgress":
                $("span#solve-progress").text(`${e.data.progress}%`);
                $("span#solve-time").text(`${(e.data.time / 1000).toFixed(TIME_PRECISION)}s`);
                break;

            // Unknown message
            default:
                console.error("Received unknown message from worker:", e);
        }
    });
});
