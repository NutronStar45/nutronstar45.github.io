import $ from "jquery";
import { downloadFile, svgElement, validateInputs } from "../common.mjs";
import { isIntegerInRange } from "../util.mjs";
import { genAlgFromString, solveAlgFromString } from "./util.mjs";
import { GenParams, SolveParams } from "./shapes/shapes.mjs";
import { SquareMaze, SquareMazeGenParams } from "./shapes/square.mjs";
// The width of a square in the resulting SVG
const MAZE_SQUARE_WIDTH = 20;
// The radius of the rounded corners
const CORNER_RADIUS = 4;
// The width of the image's margin
const IMAGE_MARGIN = 20;
// The precision of reported time during a process
const TIME_PRECISION = 0;
// The precision of final reported time
const FINAL_TIME_PRECISION = 2;
/**
 * Returns the SVG template of a maze of given size.
 * @param width The width of the maze.
 * @param height The height of the maze.
 * @returns The JQuery object containing the SVG template.
 * @throws {TypeError} Thrown if the given parameters are invalid.
 */
function squareMazeSVGTemplate(width, height) {
    if (!Number.isInteger(width) || width <= 0) {
        throw new TypeError("Width must be a positive integer");
    }
    if (!Number.isInteger(height) || width <= 0) {
        throw new TypeError("Height must be a positive integer");
    }
    return svgElement("svg")
        .attr({
        id: "maze-img",
        width: width * MAZE_SQUARE_WIDTH + IMAGE_MARGIN * 2,
        height: height * MAZE_SQUARE_WIDTH + IMAGE_MARGIN * 2,
        viewBox: `-${IMAGE_MARGIN} -${IMAGE_MARGIN} ${width * MAZE_SQUARE_WIDTH + IMAGE_MARGIN * 2} ${height * MAZE_SQUARE_WIDTH + IMAGE_MARGIN * 2}`
    })
        .append(svgElement("mask").attr("id", "maze-mask").attr("maskUnits", "userSpaceOnUse")
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
    })))
        .append(svgElement("g").attr({
        id: "cropped",
        mask: "url(#maze-mask)"
    })
        .append(svgElement("g").attr("id", "maze-solution"))
        .append(svgElement("g").attr("id", "maze-endpoints"))
        .append(svgElement("g").attr("id", "maze-walls")));
}
/**
 * Draws the walls and border of a maze.
 * @param maze The maze.
 * @param $mazeSVG The SVG to draw onto. Expects a template.
 */
function drawSquareMaze(maze, $mazeSVG) {
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
 * Draws the solution. Does nothing if the given parameters aren't valid.
 * @param width The width of the maze.
 * @param height The height of the maze.
 * @param solution An array of squares tracing out the solution.
 * @param endpoints An array containing the start and the destination.
 * @param $mazeSVG The SVG to draw onto. Expects a template with a maze drawn onto it.
 */
function drawSquareMazeSolution(width, height, solution, endpoints, $mazeSVG) {
    if (!Number.isInteger(width) || width <= 0)
        return;
    if (!Number.isInteger(height) || height <= 0)
        return;
    if (solution.some(vertex => !isIntegerInRange(vertex, 0, width * height)))
        return;
    if (endpoints.some(vertex => !isIntegerInRange(vertex, 0, width * height)))
        return;
    const $gSolution = $mazeSVG.find("g#maze-solution").empty();
    const $gEndpoints = $mazeSVG.find("g#maze-endpoints").empty();
    /**
     * Draws a square under an element.
     * @param square The square to be drawn.
     * @param $parent The element to draw the square under.
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
    for (const square of solution) {
        drawSquare(square, $gSolution);
    }
    // Draw endpoints
    for (const square of endpoints) {
        drawSquare(square, $gEndpoints);
    }
}
$(() => {
    $("div#subsec-generator-status").hide();
    $("div#subsec-solver-status").hide();
    $("div#subsec-download").hide();
    $("div#subsec-solution-visibility").hide();
    $("button#gen-cancel").hide();
    $("button#solve").prop("disabled", true);
    $("button#solve-cancel").hide();
    let maze; // Internally stored maze
    let $mazeSVG; // Internally stored maze SVG
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
    // "Generate" pressed
    $("button#gen").on("click", function () {
        const $validationTargets = $("input#width, input#height");
        if (validateInputs($validationTargets)) {
            // Show generator and solver status
            $("div#subsec-generator-status").show();
            $("div#subsec-solver-status").hide();
            // Reset maze drawing status
            $("span#draw-maze-progress").text("0%");
            $("span#draw-maze-time").text("0s");
            // Hide solution and endpoints toggle
            $("div#subsec-solution-visibility").hide();
            // Prevent generation and solving
            $(this).prop("disabled", true);
            $("button#solve").prop("disabled", true);
            // Fetch parameters
            const width = Number($("input#width").val());
            const height = Number($("input#height").val());
            const alg = genAlgFromString($("select#gen-alg").val());
            const shapeParams = SquareMazeGenParams.tryNew(width, height);
            const params = GenParams.newSquare(alg, shapeParams);
            // Spawn worker
            const worker = new Worker("/dist/maze/worker_gen.mjs", { type: "module" });
            worker.postMessage(params.toObject());
            worker.addEventListener("message", e => {
                switch (e.data.msg) {
                    // Complete
                    case "complete":
                        worker.terminate();
                        maze = SquareMaze.fromObject(e.data.maze);
                        $("span#gen-time").text(`${(e.data.time / 1000).toFixed(FINAL_TIME_PRECISION)}s`);
                        const startTime = Date.now();
                        // Disable canceling
                        $("button#gen-cancel").hide();
                        $("button#gen-cancel").off("click", cancel);
                        // Initialize SVG
                        $mazeSVG = squareMazeSVGTemplate(maze.width, maze.height);
                        // Draw maze
                        drawSquareMaze(maze, $mazeSVG);
                        $("div#maze-img-container").empty();
                        $("div#maze-img-container").append($mazeSVG.clone());
                        // Report maze drawing status
                        $("span#draw-maze-progress").text("100%");
                        $("span#draw-maze-time").text(`${((Date.now() - startTime) / 1000).toFixed(FINAL_TIME_PRECISION)}s`);
                        // Enable downloading
                        $("div#subsec-download").show();
                        // Limit solving parameters
                        $("input#start-x").attr("max", maze.width);
                        $("input#start-y").attr("max", maze.height);
                        $("input#end-x").attr("max", maze.width);
                        $("input#end-y").attr("max", maze.height);
                        // Enable generation and solving
                        $("button#gen").prop("disabled", false);
                        $("button#solve").prop("disabled", false);
                        break;
                    // Progress report
                    case "progress":
                        $("span#gen-progress").text(e.data.progress);
                        $("span#gen-time").text(`${(e.data.time / 1000).toFixed(TIME_PRECISION)}s`);
                        break;
                    // Unknown message
                    default:
                        throw new Error(`Received unknown message from generation worker: ${e.data}`);
                }
            });
            // Handle canceling
            function cancel() {
                $(this).hide();
                // Hide generator status
                $("div#subsec-generator-status").hide();
                // Enable generation
                // Enable solving if maze is generated
                $("button#gen").prop("disabled", false);
                if (maze !== undefined) {
                    $("button#solve").prop("disabled", false);
                }
                worker.terminate();
            }
            // Enable canceling
            $("button#gen-cancel").on("click", cancel);
            $("button#gen-cancel").show();
        }
    });
    // "Solve" pressed
    $("button#solve").on("click", function () {
        const $validationTargets = $("input#start-x, input#start-y, input#end-x, input#end-y");
        if (validateInputs($validationTargets)) {
            // Show solver status
            $("div#subsec-solver-status").show();
            // Reset solution drawing status
            $("span#draw-solution-progress").text("0%");
            $("span#draw-solution-time").text("0s");
            // Prevent generation and solving
            $("button#gen").prop("disabled", true);
            $(this).prop("disabled", true);
            // Fetch parameters
            const startX = Number($("input#start-x").val());
            const startY = Number($("input#start-y").val());
            const start = (startY - 1) * maze.width + (startX - 1);
            const endX = Number($("input#end-x").val());
            const endY = Number($("input#end-y").val());
            const end = (endY - 1) * maze.width + (endX - 1);
            const alg = solveAlgFromString($("select#solve-alg").val());
            const params = SolveParams.newSquare(maze, start, end, alg);
            // Spawn worker
            const worker = new Worker("/dist/maze/worker_solve.mjs", { type: "module" });
            worker.postMessage(params.toObject());
            worker.addEventListener("message", e => {
                switch (e.data.msg) {
                    // Complete
                    case "complete":
                        worker.terminate();
                        $("span#solve-time").text(`${(e.data.time / 1000).toFixed(FINAL_TIME_PRECISION)}s`);
                        const startTime = Date.now();
                        // Disable canceling
                        $("button#solve-cancel").hide();
                        $("button#solve-cancel").off("click", cancel);
                        // Draw solution
                        drawSquareMazeSolution(maze.width, maze.height, e.data.solution, [start, end], $mazeSVG);
                        $("div#maze-img-container").empty();
                        $("div#maze-img-container").append($mazeSVG.clone());
                        // Report solution drawing status
                        $("span#draw-solution-progress").text("100%");
                        $("span#draw-solution-time").text(`${((Date.now() - startTime) / 1000).toFixed(FINAL_TIME_PRECISION)}s`);
                        // Toggle solution visibility
                        solutionVisible = !$("input#hide-solution-after-solve").is(":checked");
                        $("input#show-solution").prop("checked", solutionVisible);
                        $("g#maze-solution").toggle(solutionVisible);
                        // Toggle endpoints visibility
                        endpointsVisible = true;
                        $("input#show-endpoints").prop("checked", endpointsVisible);
                        $("g#maze-endpoints").show();
                        // Show visibility toggles
                        $("div#subsec-solution-visibility").show();
                        // Enable generation and solving
                        $("button#gen").prop("disabled", false);
                        $("button#solve").prop("disabled", false);
                        break;
                    // Progress report
                    case "progress":
                        $("span#solve-progress").text(e.data.progress);
                        $("span#solve-time").text(`${(e.data.time / 1000).toFixed(TIME_PRECISION)}s`);
                        break;
                    // Unknown message
                    default:
                        throw new Error(`Received unknown message from worker: ${e.data}`);
                        return;
                }
            });
            // Handle canceling
            function cancel() {
                $(this).hide();
                // Hide solver status
                $("div#subsec-solver-status").hide();
                // Enable generation and solving
                $("button#gen").prop("disabled", false);
                $("button#solve").prop("disabled", false);
                worker.terminate();
            }
            // Enable canceling
            $("button#solve-cancel").on("click", cancel);
            $("button#solve-cancel").show();
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
});
