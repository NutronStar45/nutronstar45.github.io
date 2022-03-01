$(function() {

  $('#maze-solver-options').hide();

  $('#maze-enable-solving').change(function() {
    $('#maze-solver-options').toggle();
  });

  $('#maze-gen-maze').click(function() {
    $(this).next().html(`
Width: ${+$('#maze-width').val()} <br>
Height: ${+$('#maze-height').val()} <br>
Start X: ${+$('#maze-start-x').val()} <br>
Start Y: ${+$('#maze-start-y').val()} <br>
End X: ${+$('#maze-end-x').val()} <br>
End Y: ${+$('#maze-end-y').val()}
    `);
  });

});
