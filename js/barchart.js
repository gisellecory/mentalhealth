// Javascript for bar chart

// Global Variables
var x_scale;
var y_scale;
var data;
var xaxis;
var yaxis;
var svg;
var elements;
var selectedDisorder;

//  Width and height of element
var width = 0.8*(document.getElementById("timeseries").clientWidth);
var height = document.getElementById("timeseries").clientHeight;

// Margin
var margin = {
  top: 10,
  left: 50,
  right: 10,
  bottom: 40
};

// read in data and Draw the chart framework
d3.csv('data/timeseries.csv', createChart);

function createChart(_data){

  // need data to be global for redraw function
  data = _data

  // Get every column value
  elements = Object.keys(_data[0])
    .filter(function(d) {
      return (d != "year");
    });

  selectedDisorder = elements[0];

  createChartFrame(_data, drawBar)

}

// Draw the chart framework
function createChartFrame(_data, callback) {
  // Creating an SVG element by appending it into div
  svg = d3.select('#timeseries')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .attr('id', 'timeseries_svg')
    .append('g') // adding a group (which is the element we are drawing into)
    .attr('transform', 'translate(' + (margin.left) + ',' + (margin.top) + ')');

  // Take into account the margin in size of drawing canvas
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  // Output range ( range that values can take on screen) and input domain
  x_scale = d3.scaleLinear()
    .rangeRound([0, width])
    .domain(d3.extent(data, function(d) {
      return +d.year;
    }));

  y_scale = d3.scaleLinear()
    .rangeRound([height, 0]) // NB: SVG co-ords are flipped!
    .domain([0, d3.max(data, function(d) {
      return (+d[selectedDisorder] * 1.1);
    })]);

  // Add the x axis
  xaxis = d3.axisBottom(x_scale);

  svg.append('g')
    .attr('transform', 'translate(0, ' + (height) + margin.top + ')')
    .call(d3.axisBottom(x_scale));

  // Remove axis tick marks on x axis
  svg.selectAll(".tick").attr("visibility", "hidden");

  // Add text label for the x axis
  svg.append('text')
    .attr('transform', 'translate(' + (width / 2) + ' ,' +
      (height + margin.top + 30) + ')')
    .style("text-anchor", "middle")
    .text("Year");

  // Add the y axis
  yaxis = d3.axisLeft(y_scale);

  svg.append('g')
    .attr("class", "y axis")
    .call(d3.axisLeft(y_scale))
    .style("font", "10px");

  // Add text label for the y axis
  svg.append("text")
    .attr("transform", "rotate(-90)")
    // .style("font", "1.1rem")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Proportion of adults");

  // Add gridlines
  svg.append("g")
    .attr("class", "grid")
    .call(make_y_gridlines(y_scale)
      .tickSize(-width)
      .tickFormat("")
    )

  // Respond to change in dropdown menu selection
  var selector = d3.select("#drop_chart")
    .append("select")
    .attr("id", "dropdown_bar")
    .on("change", redraw);

  selector.selectAll("option")
    .data(elements)
    .enter()
    .append("option")
    .attr("value", function(d) {
      return d;
    })
    .text(function(d) {
      return d;
    })

callback()

} // End of createChartFrame

// gridlines in y axis function
function make_y_gridlines(y_scale) {
  return d3.axisLeft(y_scale)
    .ticks(10)
}

// Populate bar chart
function drawBar() {

  var bars = svg.selectAll("rect")
    .data(data);

  bars
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('width', width / 6)
    .attr('fill', '#fee391')
    .attr('x', function(d, i) {
      return 20 + (width / data.length) * i; // return 20 + (i*120) + 'px';
    })
    .attr('height', function(d) {
      return (height - y_scale(+d.Common_mental_disorders)); // + 'px'
    })
    .attr("y", function(d) {
      return y_scale(+d.Common_mental_disorders);
    });

  // Add data labels
  var labels = svg.selectAll('.label')
    .data(data);

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
      return (width / 12) + (i / 4) * +width + 'px';
    })
    .attr('y', function(d) {
      return height + 20;
    });

populateChartTitle(selectedDisorder);

} // End of drawBar

// Create chart titles
function populateChartTitle(input) {
chartTitle = document.getElementById("chart_title");
chartTitle.innerHTML = '';
var chartTitleText = document.createTextNode("Prevalence of " + input + " among adults in England, 1993 to 2014");
chartTitle.appendChild(chartTitleText);
}

// Redraw bar chart after selection from drop down
function redraw(e) {

  dropdownList = document.getElementById("dropdown_bar");
  selectedDisorder = dropdownList[dropdownList.selectedIndex]

  y_scale.domain([0, d3.max(data, function(d) {
    return (+d[selectedDisorder.value] * 1.1);
  })]);
  yaxis.scale(y_scale);
  svg.selectAll("rect")
    .transition()
    .attr('height', function(d) {
      return (height - y_scale(+d[selectedDisorder.value]));
    })
    .attr("x", function(d, i) {
      return 20 + (width / data.length) * i;
    })
    .attr("y", function(d) {
      return y_scale(+d[selectedDisorder.value]);
    })
    .ease(d3.easeCubicInOut)
    .duration(750)
    .select("title")
    .text(function(d) {
      return d[selectedDisorder.value];
    });

  d3.selectAll("g.y.axis")
    .transition()
    .call(yaxis);

    populateChartTitle(selectedDisorder.value);

} // End of redraw
