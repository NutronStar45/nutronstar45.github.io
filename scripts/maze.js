function generate(solving) {
  let targets = [
    '#maze-width',
    '#maze-height'
  ];
  if (solving) {
    targets.push(
      '#maze-start-x',
      '#maze-start-y',
      '#maze-end-x',
      '#maze-end-y'
    );
  }

  if (!validate(targets)) return;

  // Generation code here
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
