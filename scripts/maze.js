$(function() {

  $('#maze-width').change(function() {
    console.log('Maze width has been changed to ' + $(this).val())
  });

  $('#maze-height').change(function() {
    console.log('Maze height has been changed to ' + $(this).val())
  });

  $('#maze-enable-solving').change(function() {
    console.log('Maze solving has been changed to ' + $(this).is(':checked'))
  });

});
