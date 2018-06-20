// Javascript for bar chart

// Global Variables
var x_scale_bar;
var y_scale_bar;
var data_bar;
var xaxis_bar;
var yaxis_bar;
var svg_bar;
var elements_bar;
var selectedDataseries_bar;
var bars;

//  Width and height of element
var width_bar = (document.getElementById("barchart").clientWidth);
var height_bar = document.getElementById("barchart").clientHeight;

// Margin
var margin_bar = {
  top: 10,
  left: 50,
  right: 10,
  bottom: 40
};

// read in data and Draw the chart framework
d3.csv('data/lad_data_nocol.csv', createChart_bar);

function createChart_bar(_dataBar) {

  // need data to be global for redrawBar function
  data_bar = _dataBar

  data_bar.sort(function(a, b) {
    return b.charity_count_local - a.charity_count_local;
  });

  // Get every column value
  elements_bar = Object.keys(_dataBar[0])
    .filter(function(d) {
      return (d != "oslaua" && d != "la_name");
    });

  selectedDataseries_bar = elements_bar[0];

  createChartFrame_bar(_dataBar, drawBar)

}

// Draw the chart framework
function createChartFrame_bar(_dataBar, callback) {
  // Creating an SVG element by appending it into div
  svg_bar = d3.select('#barchart')
    .append('svg')
    .attr('height', height_bar)
    .attr('width', width_bar)
    .attr('id', 'chart_svg')
    .append('g') // adding a group (which is the element we are drawing into)
    .attr('transform', 'translate(' + (margin_bar.left) + ',' + (margin_bar.top) + ')');

  // Take into account the margin in size of drawing canvas
  width_bar = width_bar - margin_bar.left - margin_bar.right;
  height_bar = height_bar - margin_bar.top - margin_bar.bottom;

  // Output range ( range that values can take on screen) and input domain
  x_scale_bar = d3.scaleLinear()
    .rangeRound([0, width_bar])
    .domain(d3.extent(data_bar, function(d) {
      return +d.Pct_Leave;
    }));

  y_scale_bar = d3.scaleLinear()
    .rangeRound([height_bar, 0]) // NB: SVG co-ords are flipped!
    .domain([0, d3.max(data_bar, function(d) {
      return (+d[selectedDataseries_bar] * 1.1);
    })]);

  // Add the x axis
  xaxis_bar = d3.axisBottom(x_scale_bar);

  svg_bar.append('g')
    .attr('transform', 'translate(0, ' + (height_bar) + margin_bar.top + ')')
    .call(d3.axisBottom(x_scale_bar));

  // Remove axis tick marks on x axis
  svg_bar.selectAll(".tick").attr("visibility", "hidden");

  // Add text label for the x axis
  svg_bar.append('text')
    .attr('transform', 'translate(' + (width_bar / 2) + ' ,' +
      (height_bar + margin_bar.top + 30) + ')')
    .style("text-anchor", "middle")
    .text("Local Authority Districts");

  // Add the y axis
  yaxis_bar = d3.axisLeft(y_scale_bar);

  svg_bar.append('g')
    .attr("class", "y axis")
    .call(d3.axisLeft(y_scale_bar))
    .style("font", "10px");

  // Add text label for the y axis
  svg_bar.append("text")
    .attr("transform", "rotate(-90)")
    // .style("font", "1.1rem")
    .attr("y", 0 - margin_bar.left)
    .attr("x", 0 - (height_bar / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Proportion of adults");

  // Add gridlines
  svg_bar.append("g")
    .attr("class", "grid")
    .call(make_y_gridlines_bar(y_scale_bar)
      .tickSize(-width_bar)
      .tickFormat("")
    )

  // Respond to change in dropdown menu selection
  var selector = d3.select("#drop_chart")
    .append("select")
    .attr("id", "dropdown_bar")
    .on("change", redrawBar);

  selector.selectAll("option")
    .data(elements_bar)
    .enter()
    .append("option")
    .attr("value", function(d) {
      return d;
    })
    .text(function(d) {
      return d;
    })

  callback()

} // End of createChartFrame_bar

// gridlines in y axis function
function make_y_gridlines_bar(y_scale_bar) {
  return d3.axisLeft(y_scale_bar)
    .ticks(10)
}

// Populate bar chart
function drawBar() {

  bars = svg_bar.selectAll("rect")
    .data(data_bar);

  bars
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('width', width_bar / data_bar.length)
    .attr('fill', '#d29000')
    .attr('x', function(d, i) {
      return 20 + (width_bar / data_bar.length) * i;
    })
    .attr('height', function(d) {
      return (height_bar - y_scale_bar(+d.charity_count_local));
    })
    .attr("y", function(d) {
      return y_scale_bar(+d.charity_count_local);
    });

  // Add data labels
  var labels = svg_bar.selectAll('.label')
    .data(data_bar);

  labels
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('opacity', 1)
    .attr('fill', 'black')
    .text(function(d) {
      return d.year;
    })
    .attr('x', function(d, i) {
      return (width_bar / 12) + (i / 4) * +width_bar + 'px';
    })
    .attr('y', function(d) {
      return height_bar + 20;
    });

  populateChartTitleBar(selectedDataseries_bar);

} // End of drawBar

// Create chart titles
function populateChartTitleBar(input) {
  chartTitle = document.getElementById("chart_title");
  chartTitle.innerHTML = '';
  var chartTitleText = document.createTextNode("Series: " + input);
  chartTitle.appendChild(chartTitleText);
}

// Redraw bar chart after selection from drop down
function redrawBar(e) {

  dropdownListBar = document.getElementById("dropdown_bar");
  selectedDataseries_bar = dropdownListBar[dropdownListBar.selectedIndex]
  var selectedDataseries_bar_name = selectedDataseries_bar.value

  y_scale_bar.domain([0, d3.max(data_bar, function(d) {
    return (+d[selectedDataseries_bar.value] * 1.1);
  })]);

  yaxis_bar.scale(y_scale_bar);

data_bar.sort(function(a, b) {
  return b[selectedDataseries_bar_name] - a[selectedDataseries_bar_name];
});

bars = svg_bar.selectAll("rect")
    .data(data_bar)
    .transition()
    .attr('height', function(d) {
      return (height_bar - y_scale_bar(+d[selectedDataseries_bar.value]));
    })
    .attr("x", function(d, i) {
      return 20 + (width_bar / data_bar.length) * i;
    })
    .attr("y", function(d) {
      return y_scale_bar(+d[selectedDataseries_bar.value]);
    })
    .ease(d3.easeCubicInOut)
    .duration(750)
    .select("title")
    .text(function(d) {
      return d[selectedDataseries_bar.value];
    });

  d3.selectAll("g.y.axis")
    .transition()
    .call(yaxis_bar);

  populateChartTitleBar(selectedDataseries_bar.value);

} // End of redrawBar
