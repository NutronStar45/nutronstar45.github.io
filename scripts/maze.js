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
 * Appends HTML to `p#gen-status`.
 * @param {string} html The HTML to write.
 */
function appendStatusGen(html) {
    let resultHTML = $("p#gen-status").html();
    if (resultHTML !== "") resultHTML += "<br>";
    resultHTML += html;
    $("p#gen-status").html(resultHTML);
}


/**
 * Appends HTML to `p#solve-status`.
 * @param {string} html The HTML to write.
 */
function appendStatusSolve(html) {
    let resultHTML = $("p#solve-status").html();
    if (resultHTML !== "") resultHTML += "<br>";
    resultHTML += html;
    $("p#solve-status").html(resultHTML);
}


/**
 * Overwrites `span#gen-progress` with text.
 * @param {string} text The text to write.
 */
function writeProgressGen(text) {
    $("span#gen-progress").text(text);
}


/**
 * Overwrites `span#solve-progress` with text.
 * @param {string} text The text to write.
 */
function writeProgressSolve(text) {
    $("span#solve-progress").text(text);
}


/**
 * Enables/Disables tasks (generation and solving).
 * @param {boolean} enabled Enable tasks if `true` and disable if `false`.
 */
function toggleTasks(enabled) {
    $("button#gen").prop("disabled", !enabled);
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

    // Draw solution
    for (const square of squaresSolution) {
        const squareX = square % width;
        const squareY = Math.floor(square / width);

        $gSolution.append(svgElement("rect").attr({
            width: MAZE_SQUARE_WIDTH,
            height: MAZE_SQUARE_WIDTH,
            x: squareX * MAZE_SQUARE_WIDTH,
            y: squareY * MAZE_SQUARE_WIDTH,
        }));
    }

    // Draw endpoints
    for (const square of squaresEndpoints) {
        const squareX = square % width;
        const squareY = Math.floor(square / width);

        $gEndpoints.append(svgElement("rect").attr({
            width: MAZE_SQUARE_WIDTH,
            height: MAZE_SQUARE_WIDTH,
            x: squareX * MAZE_SQUARE_WIDTH,
            y: squareY * MAZE_SQUARE_WIDTH,
        }));
    }
}


$(() => {
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

    let startTime; // Timestamp at the start of a step

    $("input#show-solution").on("change", function () {
        solutionVisible = this.checked;
        $("g#maze-solution").toggle(solutionVisible);
    });

    $("input#show-endpoints").on("change", function () {
        endpointsVisible = this.checked;
        $("g#maze-endpoints").toggle(endpointsVisible);
    });

    // Generate button pressed
    $("button#gen").on("click", function () {
        const $validationTargets = $("input#width, input#height");

        if (validate($validationTargets)) {
            // Clear generation and solving status
            // Clear solving progress
            $("p#gen-status").empty();
            $("p#solve-status").empty();
            $("span#solve-progress").empty();

            // Hide solution and endpoints toggle
            $("div#subsec-solution-visibility").hide();

            // Prevent additional tasks
            toggleTasks(false);

            // Fetch parameters from user input
            const width = +$("input#width").val();
            const height = +$("input#height").val();

            startTime = now();
            // Generate maze
            worker.postMessage({ msg: "gen", width, height });
            writeProgressGen("0%");
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
            // Clear solving status
            $("p#solve-status").empty();

            // Prevent additional tasks
            toggleTasks(false);

            // Fetch parameters from user input
            const startX = +$("input#start-x").val();
            const startY = +$("input#start-y").val();
            const start = (startY - 1) * maze.width + (startX - 1);

            const endX = +$("input#end-x").val();
            const endY = +$("input#end-y").val();
            const end = (endY - 1) * maze.width + (endX - 1);

            startTime = now();
            // Calculate solution
            worker.postMessage({ msg: "solve", maze, start, end });
            writeProgressSolve("0%");
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
        switch (e.data.msg) {
            // Worker ready
            case "ready":
                toggleTasks(true);
                break;

            // Generation complete
            case "gen":
                writeProgressGen("100%");
                maze = e.data.maze;
                appendStatusGen(`Maze generation took ${(now() - startTime).toFixed(TIME_PRECISION)}s`);
                startTime = now();

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

                appendStatusGen(`Maze rendering took ${(now() - startTime).toFixed(TIME_PRECISION)}s`);
                toggleTasks(true);

                break;

            // Generation progress report
            case "genProgress":
                writeProgressGen(`${e.data.progress}%`);
                break;

            // Solving complete
            case "solve":
                writeProgressSolve("100%");
                appendStatusSolve(`Solution calculation took ${(now() - startTime).toFixed(TIME_PRECISION)}s`);
                startTime = now();

                const hideSolutionAfterSolve = $("input#hide-solution-after-solve").is(":checked");

                // Draw solution
                drawSolution(maze.width, maze.height, e.data.squaresSolution, e.data.squaresEndpoints, $mazeSVG);
                $("div#maze-img-container").empty();
                $("div#maze-img-container").append($mazeSVG.clone());

                appendStatusSolve(`Solution rendering took ${(now() - startTime).toFixed(TIME_PRECISION)}s`);
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
                writeProgressSolve(`${e.data.progress}%`);
                break;

            // Unknown message
            default:
                console.error("Received unknown message from worker:", e);
        }
    });
});
