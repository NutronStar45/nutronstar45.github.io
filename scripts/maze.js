/**
 * Choose a pseudo-random item from the array.
 * @returns A pseudo-random item from the array.
 */
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
}

/**
 * Removes the first occurrence of `value` in an array.
 * @param {*} value The target value.
 */
Array.prototype.remove = function(value) {
  this.splice(this.indexOf(value), 1);
};

let round = Math.round;
/**
 * Rounds a number to a specific precision.
 * @param {number} x The number to be rounded.
 * @param {number} precision Number of decimal places.
 * @returns The rounded value.
 */
Math.round = function(x, precision = 0) {
  return round(x * Math.pow(10, precision)) / Math.pow(10, precision);
}



/**
 * Get the time passed since the UNIX Epoch.
 * @returns Seconds passed since Jan 1 1970.
 */
function now() {
  return Date.now() / 1000;
}

/**
 * Write to p#gen-status
 * @param {string} text The text to write.
 */
function writeStatus(text) {
  $('#gen-status').append(text);
}

/**
 * Get the surrounding slots around a slot.
 * @param {number} slot The target slot.
 * @param {number[] | null} filter Slots won't be returned if it's not in this array.
 * @param {number} width The width of the maze.
 * @param {number} size The size of the maze.
 * @returns The surrounding slots around `slot` in the format of `[[num, type], ...]` where `num` is the neighboring slot and `type` is the relationship between `slot` and `num`, `0` is vertical and `1` is horizontal.
 */
function getNeighbors(slot, filter, width, size) {
  let results = [];

  if (slot - width >= 0)       results.push([slot - width, 0]); // Up
  if (slot + width < size)     results.push([slot + width, 0]); // Down
  if (slot % width != 0)       results.push([slot - 1,     1]); // Left
  if ((slot + 1) % width != 0) results.push([slot + 1,     1]); // Right

  if (filter) {
    results = results.filter(item => filter.includes(item[0]));
  }

  return results;
}

/**
 * Performs a certain action on a certain slot. \
 * Action 0: CHECK CONNECTIVITY \
 * Action 1: IS PATH
 * @param {number} slot The slot to perform the action.
 * @param {number} action The action to perform, 0 is CHECK CONNECTIVITY, 1 is IS PATH.
 * @param {number} width The width of the maze.
 * @param {number} size The size of the maze.
 * @param {number[]} hWalls The horizontal walls of the maze.
 * @param {number[]} vWalls The vertical walls of the maze.
 * @param {number[]} endpoints The start- and end-points of the maze.
 * @returns The bitwise connectivity if the action was 0, or IS PATH if it was 1.
 */
function slotAction(slot, action, width, size, hWalls, vWalls, endpoints) {
  let connected = 15;

  // Up
  if (hWalls.includes(slot - width) || slot - width < 0)         connected -= 1;
  // Down
  if (hWalls.includes(slot)         || slot + width >= size)     connected -= 2;
  // Left
  if (vWalls.includes(slot - 1)     || slot % width === 0)       connected -= 4;
  // Right
  if (vWalls.includes(slot)         || (slot + 1) % width === 0) connected -= 8;

  if (action === 0)
    if (!endpoints.includes(slot))
      return connected
  else
    return connected > 0;
}



/**
 * Generates, solves and renders a maze
 * @param {boolean} solving Whether to solve the generated maze or not.
 */
function generate(solving) {
  // Left-to-right, top-to-bottom, 0-based numbering, like
  //  0  1  2  3  4
  //  5  6  7  8  9
  // 10 11 12 13 14
  // 15 16 17 18 19

  $('#gen-status').empty();



  /*
   * Maze Structure
   */

  // Size
  let width  = +$('#width').val(),
      height = +$('#height').val();

  // Starting time
  let startTime = now();

  let size = width * height;

  // Initialize walls
  let vWalls = []; // Vertical walls
  let hWalls = []; // Horizontal walls

  // Initialize slots status
  let slotsDefault   = [];
  let slotsSearching = [];
  let slotsFinished  = [];

  // Insert status
  for (let slot = 0; slot < size.length; slot++) {
    slotsDefault.push(slot);
  }

  // Insert vertical walls
  for (let vIndex = 0; vIndex < height.length; vIndex++) {
    for (let hIndex = 0; hIndex < width.length - 1; hIndex++) {
      vWalls.push(vIndex * width + hIndex);
    }
  }

  // Insert horizontal walls
  for (let vIndex = 0; vIndex < height.length - 1; vIndex++) {
    for (let hIndex = 0; hIndex < width.length; hIndex++) {
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
    else                         vWalls.remove(wall);

    slotsSearching.remove(slot);
    slotsFinished.push(slot);

    neighbors = getNeighbors(slot, slotsDefault, width, size);
    for (let neighbor of neighbors) {
      slotsDefault.remove(neighbor[0]);
      slotsSearching.push(neighbor[0]);
    }
  }

  writeStatus(`Maze structure generated at ${
    Math.round(now() - startTime, 2)
  }s (took ${
    Math.round(now() - startTime, 2)
  }s)`);
  let lastTimestamp = now();



  /*
   * Walls Rendering
   */

  let svgWalls = '<g class="wall">';

  for (let wall of vWalls) {
    svgWalls += `<line x1="${wall % width * 20 + 20}" y1="${Math.floor(wall / width) * 20}" x2="${wall % width * 20 + 20}" y2="${Math.floor(wall / width) * 20 + 20}"/>`;
  }

  for (let wall of hWalls) {
    svgWalls += `<line x1="${wall % width * 20}" y1="${Math.floor(wall / width) * 20 + 20}" x2="${wall % width * 20 + 20}" y2="${Math.floor(wall / width) * 20 + 20}"/>`;
  }

  svgWalls += '</g>';

  writeStatus(`<br>Walls rendering calculated at ${
    Math.round(now() - startTime, 2)
  }s (took ${
    Math.round(now() - lastTimestamp, 2)
  }s)`);
  lastTimestamp = now();



  /*
   * Path Rendering
   */

  if (solving) {
    let startX = $('#start-x').val(),
        startY = $('#start-y').val(),
        endX   = $('#end-x').val(),
        endY   = $('#end-y').val();

    let start = (startY - 1) * width + (startX - 1),
        end   = (endY   - 1) * width + (endX   - 1);

    let endpoints = [start, end];

    // Detect deadends
    for (let slot = 0; slot < size; slot++) {
      let connected = slotAction(slot, 0, width, size, hWalls, vWalls, endpoints);
      let tempSlot = slot;
      while ([1, 2, 4, 8].includes(connected)) {
        if (connected === 1) {
          hWalls.push(tempSlot - width);
          connected = slotAction(tempSlot - width, 0, width, size, hWalls, vWalls, endpoints);
          tempSlot -= width;
        } if (connected === 2) {
          hWalls.push(tempSlot);
          connected = slotAction(tempSlot + width, 0, width, size, hWalls, vWalls, endpoints);
          tempSlot += width;
        } if (connected === 4) {
          vWalls.push(tempSlot - 1);
          connected = slotAction(tempSlot - 1, 0, width, size, hWalls, vWalls, endpoints);
          tempSlot -= 1;
        } if (connected === 8) {
          vWalls.push(tempSlot);
          connected = slotAction(tempSlot + 1, 0, width, size, hWalls, vWalls, endpoints);
          tempSlot += 1;
        }
      }
    }

    writeStatus(`<br>Path generated at ${
      Math.round(now() - startTime, 2)
    }s (took ${
      Math.round(now() - lastTimestamp, 2)
    }s)`);
    lastTimestamp = now();



    let slotsPath = [];
    let slotsEndpoint = [];

    // Categorizing
    for (let slot = 0; slot < size; slot++) {
      if (slotAction(slot, 1, width, size, hWalls, vWalls, endpoints)) {
        if (endpoints.includes(slot)) slotsEndpoint.push(slot);
        else                          slotsPath.push(slot);
      }
    }

    let svgPath = '<g class="path">';

    // Path rendering
    for (let slot of slotsPath) {
      let slotX = slot % width;
      let slotY = Math.floor(slot / width);

      svgPath += `<rect width="20" height="20" x="${slotX * 20}" y="${slotY * 20}"/>`;
    }

    svgPath += '</g><g class="endpoint">';

    // Endpoint rendering
    for (let slot of slotsEndpoint) {
      let slotX = slot % width;
      let slotY = Math.floor(slot / width);

      svgPath += `<rect width="20" height="20" x="${slotX * 20}" y="${slotY * 20}"/>`;
    }

    svgPath += '</g>';

    writeStatus(`<br>Path rendering calculated at ${
      Math.round(now() - startTime, 2)
    }s (took ${
      Math.round(now() - lastTimestamp, 2)
    }s)`);
  }



  /*
   * Render
   */

  let svg = $(`<svg width="${width * 20}" height="${height * 20}></svg>`);

  if (solving) {
    svg.append(svgPath)
  }

  svg
    .append($(`<rect />`).attr({
      width: width * 20 + 2,
      height: height * 20 + 2,
      rx: 5,
      fill: 'none',
      stroke: 'black',
      'stroke-width': 2,
      x: -1,
      y: -1
    }))
    .append($(`<rect />`).attr({
      width: width * 20 - 2,
      height: height * 20 - 2,
      rx: 3,
      fill: 'none',
      stroke: 'white',
      'stroke-width': 2,
      x: 1,
      y: 1
    }))
    .append(svgWalls);

  console.log(svg);

  $('#maze-img').empty().append(svg);
}



$(() => {

  $('#solver-options').hide();

  $('#enable-solving').change(function() {
    $('#solver-options').toggle();
    if ($(this).is(':checked')) $('#gen-solve').text('Generate & Solve');
    else                        $('#gen-solve').text('Generate');
  });

  $('#gen-solve').click(() => {
    let solving = $('#enable-solving').is(':checked'); // Is solving enabled

    let targets = [
      '#width',
      '#height'
    ];
    if (solving) {
      targets.push(
        '#start-x',
        '#start-y',
        '#end-x',
        '#end-y'
      );
    }

    if (validate(targets)) generate(solving);
  });

});
