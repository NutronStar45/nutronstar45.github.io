// Array.prototype.random is defined in common.js
// Array.prototype.remove is defined in common.js
// Math.round is defined in common.js
// svgNS is defined in common.js


/**
 * @returns {number} Time passed since 0:00:00, January 1, 1970 in seconds
 */
function now() {
  return Date.now() / 1000;
}


/**
 * Write to `p#gen-status`
 * @param {string} text The text to write
 */
function writeStatus(text) {
  $("p#gen-status").html(text);
}


/**
 * Get the surrounding slots around a slot
 * @param {number} slot The target slot
 * @param {number[] | null} filter Slots won't be returned if it's not in this array
 * @param {number} width The width of the maze
 * @param {number} size The size of the maze
 * @returns {number[][]} The surrounding slots around `slot` in the format of `[[num, type], ...]` where `num` is the slot and `type` is the relation between `slot` and `num`, `0` is vertical and `1` is horizontal
 */
function getNeighbors(slot, filter, width, size) {
  let results = [];

  if (slot - width >= 0) results.push([slot - width, 0]); // Up
  if (slot + width < size) results.push([slot + width, 0]); // Down
  if (slot % width !== 0) results.push([slot - 1, 1]); // Left
  if ((slot + 1) % width !== 0) results.push([slot + 1, 1]); // Right

  if (filter) results = results.filter(item => filter.includes(item[0]));

  return results;
}


/**
 * Performs a certain action on a certain slot \
 * 0: Check connectivity \
 * 1: Check if the slot is connected to at least one neighbor
 * @param {number} slot The slot to perform the action
 * @param {number} action The action to perform
 * @param {number} width The width of the maze
 * @param {number} size The size of the maze
 * @param {number[]} hWalls The horizontal walls of the maze
 * @param {number[]} vWalls The vertical walls of the maze
 * @param {number[]} endpoints The start- and end-points of the maze
 * @returns {number | boolean} An integer or a boolean, depending on the action
 */
function slotAction(slot, action, width, size, hWalls, vWalls, endpoints) {
  let connectivity = 15;

  // Up
  if (hWalls.includes(slot - width) || slot - width < 0) connectivity -= 1;
  // Down
  if (hWalls.includes(slot) || slot + width >= size) connectivity -= 2;
  // Left
  if (vWalls.includes(slot - 1) || slot % width === 0) connectivity -= 4;
  // Right
  if (vWalls.includes(slot) || (slot + 1) % width === 0) connectivity -= 8;

  if (action === 0) {
    if (!endpoints.includes(slot)) return connectivity;
  }
  return connectivity > 0;
}


/**
 * Generates, solves and renders a maze
 * @param {boolean} solving If true, solve the maze
 */
function generate(solving) {
  // Uses Prim's Algorithm to generate a perfect maze
  // Left-to-right, top-to-bottom, 0-based numbering, like
  //  0  1  2  3  4
  //  5  6  7  8  9
  // 10 11 12 13 14
  // 15 16 17 18 19

  $("p#gen-status").empty();
  let gen_status = "";

  /*
   * Maze Structure
   */

  // Size
  let width = +$("input#width").val(), height = +$("input#height").val();

  // Starting time
  let startTime = now();

  let size = width * height;

  // Initialize walls
  let vWalls = []; // Vertical walls
  let hWalls = []; // Horizontal walls

  // Initialize slots status
  let slotsDefault = [];
  let slotsSearching = [];
  let slotsFinished = [];

  // Insert status
  for (let slot = 0; slot < size; slot++) {
    slotsDefault.push(slot);
  }

  // Insert vertical walls
  for (let vIndex = 0; vIndex < height; vIndex++) {
    for (let hIndex = 0; hIndex < width - 1; hIndex++) {
      vWalls.push(vIndex * width + hIndex);
    }
  }

  // Insert horizontal walls
  for (let vIndex = 0; vIndex < height - 1; vIndex++) {
    for (let hIndex = 0; hIndex < width; hIndex++) {
      hWalls.push(vIndex * width + hIndex);
    }
  }

  let slot = Math.floor(Math.random() * size);
  let neighbors = getNeighbors(slot, null, width, size);

  slotsDefault.remove(slot);
  slotsFinished.push(slot);

  for (let neighbor of neighbors) {
    slotsDefault.remove(neighbor[0]);
    slotsSearching.push(neighbor[0]);
  }

  while (slotsSearching.length > 0) {
    let slot = slotsSearching.random();
    let neighbors = getNeighbors(slot, slotsFinished, width, size);
    let randomNeighbor = neighbors.random();

    let wall = Math.min(slot, randomNeighbor[0]);

    if (randomNeighbor[1] === 0) hWalls.remove(wall);
    else vWalls.remove(wall);

    slotsSearching.remove(slot);
    slotsFinished.push(slot);

    neighbors = getNeighbors(slot, slotsDefault, width, size);
    for (let neighbor of neighbors) {
      slotsDefault.remove(neighbor[0]);
      slotsSearching.push(neighbor[0]);
    }
  }

  gen_status += `Maze structure generated at ${Math.round(
    now() - startTime,
    2
  )}s (took ${Math.round(now() - startTime, 2)}s)`;
  let lastTimestamp = now();

  /*
   * Walls Rendering
   */

  let svgWalls = svgNS("g").addClass("wall");

  for (let wall of vWalls) {
    svgWalls.append(
      svgNS("line").attr({
        x1: (wall % width) * 20 + 20,
        y1: Math.floor(wall / width) * 20,
        x2: (wall % width) * 20 + 20,
        y2: Math.floor(wall / width) * 20 + 20,
      })
    );
  }

  for (let wall of hWalls) {
    svgWalls.append(
      svgNS("line").attr({
        x1: (wall % width) * 20,
        y1: Math.floor(wall / width) * 20 + 20,
        x2: (wall % width) * 20 + 20,
        y2: Math.floor(wall / width) * 20 + 20,
      })
    );
  }

  gen_status += `<br>Walls rendering calculated at ${Math.round(
    now() - startTime,
    2
  )}s (took ${Math.round(now() - lastTimestamp, 2)}s)`;
  lastTimestamp = now();

  /*
   * Path Rendering
   */

  let svgPath = svgNS("g").addClass("path");
  let svgEndpoint = svgNS("g").addClass("endpoint");

  if (solving) {
    let startX = $("input#start-x").val(),
      startY = $("input#start-y").val(),
      endX = $("input#end-x").val(),
      endY = $("input#end-y").val();

    let start = (startY - 1) * width + (startX - 1),
      end = (endY - 1) * width + (endX - 1);

    let endpoints = [start, end];

    // Detect deadends
    for (let slot = 0; slot < size; slot++) {
      let connectivity = slotAction(
        slot,
        0,
        width,
        size,
        hWalls,
        vWalls,
        endpoints
      );
      let tempSlot = slot;
      while ([1, 2, 4, 8].includes(connectivity)) {
        if (connectivity === 1) {
          hWalls.push(tempSlot - width);
          connectivity = slotAction(
            tempSlot - width,
            0,
            width,
            size,
            hWalls,
            vWalls,
            endpoints
          );
          tempSlot -= width;
        }
        if (connectivity === 2) {
          hWalls.push(tempSlot);
          connectivity = slotAction(
            tempSlot + width,
            0,
            width,
            size,
            hWalls,
            vWalls,
            endpoints
          );
          tempSlot += width;
        }
        if (connectivity === 4) {
          vWalls.push(tempSlot - 1);
          connectivity = slotAction(
            tempSlot - 1,
            0,
            width,
            size,
            hWalls,
            vWalls,
            endpoints
          );
          tempSlot -= 1;
        }
        if (connectivity === 8) {
          vWalls.push(tempSlot);
          connectivity = slotAction(
            tempSlot + 1,
            0,
            width,
            size,
            hWalls,
            vWalls,
            endpoints
          );
          tempSlot += 1;
        }
      }
    }

    gen_status += `<br>Path generated at ${Math.round(
      now() - startTime,
      2
    )}s (took ${Math.round(now() - lastTimestamp, 2)}s)`;
    lastTimestamp = now();

    let slotsPath = [];
    let slotsEndpoint = [];

    // Categorizing
    for (let slot = 0; slot < size; slot++) {
      if (slotAction(slot, 1, width, size, hWalls, vWalls, endpoints)) {
        if (endpoints.includes(slot)) slotsEndpoint.push(slot);
        else slotsPath.push(slot);
      }
    }

    // Path rendering
    for (let slot of slotsPath) {
      let slotX = slot % width;
      let slotY = Math.floor(slot / width);

      svgPath.append(
        svgNS("rect").attr({
          width: 20,
          height: 20,
          x: slotX * 20,
          y: slotY * 20,
        })
      );
    }

    // Endpoint rendering
    for (let slot of slotsEndpoint) {
      let slotX = slot % width;
      let slotY = Math.floor(slot / width);

      svgEndpoint.append(
        svgNS("rect").attr({
          width: 20,
          height: 20,
          x: slotX * 20,
          y: slotY * 20,
        })
      );
    }

    gen_status += `<br>Path rendering calculated at ${Math.round(
      now() - startTime,
      2
    )}s (took ${Math.round(now() - lastTimestamp, 2)}s)`;
  }

  writeStatus(gen_status);

  /*
   * Render
   */

  let svg = svgNS("svg").attr({
    width: width * 20,
    height: height * 20,
  });

  if (solving) {
    svg.append(svgPath).append(svgEndpoint);
  }

  svg
    .append(
      svgNS("rect").attr({
        width: width * 20 + 2,
        height: height * 20 + 2,
        rx: 5,
        fill: "none",
        stroke: "black",
        "stroke-width": 2,
        x: -1,
        y: -1,
      })
    )
    .append(
      svgNS("rect").attr({
        width: width * 20 - 2,
        height: height * 20 - 2,
        rx: 3,
        fill: "none",
        stroke: "white",
        "stroke-width": 2,
        x: 1,
        y: 1,
      })
    )
    .append(svgWalls);

  $("div#maze-img").empty().append(svg);
  $("div#maze-img g.path").toggle(!$("#hide-path-after-render").is(":checked"));
  $("button#toggle-path")
    .toggle(solving)
    .text(
      $("#hide-path-after-render").is(":checked") ? "Show Path" : "Hide Path"
    );
}


$(() => {
  $("input#enable-solving").prop("clicked", false);
  $("div#solver-options").hide();
  $("button#toggle-path").hide();

  $("input#enable-solving").change(function () {
    $("div#solver-options").toggle();
    if (this.checked) $("button#gen-solve").text("Generate & Solve");
    else $("button#gen-solve").text("Generate");
  });

  $("button#toggle-path").click(function () {
    $(this).text($(this).text() === "Show Path" ? "Hide Path" : "Show Path");
    $("div#maze-img g.path").toggle();
  });

  $("button#gen-solve").click(() => {
    let solving = $("input#enable-solving").is(":checked"); // Is solving enabled

    let targets = ["input#width", "input#height"];
    if (solving) {
      targets.push(
        "input#start-x",
        "input#start-y",
        "input#end-x",
        "input#end-y"
      );
    }

    if (validate(targets)) generate(solving);
  });
});
