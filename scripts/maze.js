function generate(solving) {
  if (solving) {
    $(this).next().html(`
Width: ${+$('#maze-width').val()} <br>
Height: ${+$('#maze-height').val()} <br>
Start X: ${+$('#maze-start-x').val()} <br>
Start Y: ${+$('#maze-start-y').val()} <br>
End X: ${+$('#maze-end-x').val()} <br>
End Y: ${+$('#maze-end-y').val()}
    `);
  } else {
    $(this).next().html(`
Width: ${+$('#maze-width').val()} <br>
Height: ${+$('#maze-height').val()}
    `);
  }
}


$(function() {

  $('#maze-solver-options').hide();

  $('#maze-enable-solving').change(function() {
    $('#maze-solver-options').toggle();
    if ($(this).is(':checked')) {
      $('#maze-gen-solve').text('Generate & Solve');
    } else {
      $('#maze-gen-solve').text('Generate');
    }
  });

  $('#maze-gen-solve').click(function() {
    generate($('#maze-enable-solving').is(':checked'));
  });

});
