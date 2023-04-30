const BAR_HEIGHT = 20;
const BAR_MARGIN = 4; // vertical spacing between
const LEFT_PADDING = 70;
const PADDING = 20;
const SVG_WIDTH = 400;

const barTotal = BAR_HEIGHT + BAR_MARGIN;
const players = [
  {name: 'javascript', score: 90},
  {name: 'java', score: 80},
  {name: 'css', score: 70},
  {name: 'html', score: 88},
  {name: 'c#', score: 75}
];
// Leave room for top PADDING, bottom PADDING, and x axis.
const svgHeight = PADDING * 3 + players.length * barTotal;
const usableHeight = svgHeight - PADDING * 3;
const usableWidth = SVG_WIDTH - LEFT_PADDING - PADDING;

// Get the highest score rounded up to the nearest multiple of 10.
const highScore = Math.ceil(d3.max(players, player => player.score) / 10) * 10;

// Create a linear scale that maps values from zero to the maximum score
// to values from zero to the width of the SVG.
const widthScale = d3
  .scaleLinear()
  .domain([0, highScore])
  .range([0, usableWidth]);

// Create an SVG element.
const svg = d3
  .select('body')
  .append('svg')
  .attr('width', SVG_WIDTH)
  .attr('height', svgHeight);

const tooltip = d3.select('body').append('div').classed('tooltip', true);

// Create a selection containing one SVG group for each data value
// that are translated in the y-direction so they are visually separated.
const barGroups = svg
  .selectAll('g')
  .data(players)
  .enter()
  .append('g')
  .classed('bar', true)
  .attr(
    'transform',
    (_, i) => `translate(${LEFT_PADDING}, ${PADDING + i * barTotal})`
  );

// Create a rect for each data value.
barGroups
  .append('rect')
  .attr('width', player => widthScale(player.score))
  .attr('height', BAR_HEIGHT)
  // Cannot use an arrow function because we need the value of "this".
  .on('mouseenter', function (player) {
    // Configure the tooltip.
    tooltip
      .text(player.score)
      .style('left', d3.event.pageX + 'px')
      .style('top', d3.event.pageY + 'px');
    // Show the tooltip.
    tooltip.transition().style('opacity', 1);
    // Fade the bar.
    d3.select(this).style('opacity', 0.5);
  })
  // Cannot use an arrow function because we need the value of "this".
  .on('mouseout', function () {
    // Hide the tooltip.
    tooltip.transition().style('opacity', 0);
    // Restore the bar opacity.
    d3.select(this).style('opacity', 1);
  });

// Create text for each data value that displays a player score.
barGroups
  .append('text')
  .text(player => player.score)
  .attr('x', player => widthScale(player.score) - 24) // at end of bar
  .attr('y', barTotal / 2 + 3); // centered vertically

const xAxisScale = d3
  .scaleLinear()
  .domain([0, highScore])
  .range([0, usableWidth]);
const xAxisMinor = d3
  .axisBottom(xAxisScale)
  .ticks(highScore) // show a tick at every 1
  .tickFormat('') // hides labels
  .tickSize(5); // length of each tick (default is 6)
const xAxisMajor = d3
  .axisBottom(xAxisScale)
  .ticks(highScore / 10) // show a tick at every multiple of 10
  // highStore is guaranteed to be a multiple of 10.
  .tickPadding(10) // space between end of tick and label; default is 3
  .tickSize(10);
//.tickSize(-usableHeight); // to draw across chart
const xAxisTransform = `translate(${LEFT_PADDING}, ${
  PADDING + players.length * barTotal
})`;
svg
  .append('g')
  .call(xAxisMinor)
  .classed('minor-x-axis', true)
  .attr('transform', xAxisTransform);
svg
  .append('g')
  .call(xAxisMajor)
  .classed('major-x-axis', true)
  .attr('transform', xAxisTransform);

// Generate tick values that will place the ticks
// at the vertical center of each of the bars.
const yTickValues = players.map((_, i) => i + 0.5);

const yAxisScale = d3
  .scaleLinear()
  .domain([players.length, 0]) // reversed order
  .range([usableHeight, 0]); // top to bottom
const yAxis = d3
  .axisLeft(yAxisScale)
  .ticks(players.length)
  .tickFormat((_, i) => {
    const player = players[i];
    return player ? player.name : '';
  })
  .tickValues(yTickValues);
svg
  .append('g')
  .call(yAxis)
  .classed('y-axis', true)
  .attr('transform', `translate(${LEFT_PADDING}, ${PADDING - BAR_MARGIN / 2})`);