// Javascript for histogram

// Global Variables
var x_scale_hist;
var y_scale_hist;
var xaxis_hist;
var yaxis_hist;
var svg_hist;
var data_hist;
var elements_hist;
var selectedDisorder_hist;
var map;
var map0;
var map1;
var histogram_bars;
var histogram_data;
var histogram_data0;
var histogram_data1;
var numb_thresholds = 10;

//  Width and height of element
var width_hist = document.getElementById("histogram").clientWidth;
var height_hist = 500 // document.getElementById("histogram").clientHeight;

var padding = 50;

// Margin
var margin_hist = {
  top: 10,
  left: 50,
  right: 10,
  bottom: 40
};

// read in data and Draw the chart framework
d3.csv('data/lad_data_nocol.csv', createChart_hist);

function createChart_hist(_dataHist) {

  // need data to be global for redrawHist function
  data_hist = _dataHist

  // Get every column value
  elements_hist = Object.keys(_dataHist[0])
    .filter(function(d) {
      return (d != "oslaua" && d != "la_name" && d != "public_ core_spend_m_rank" && d != "perhead_charitable_spending_local_rank");
    });

  selectedDisorder_hist = elements_hist[0];

  // var keys_group = Object.keys(_dataHist[0])

  createChartFrame_hist(_dataHist, drawHist)

} ////////////// end of createChart_hist

// Draw the chart framework
function createChartFrame_hist(_dataHist, callback) {

  // Create basic data for histogram conversion
  map0 = _dataHist.map(function(i) {
    if (i.vote_outcome === "1") {
      return parseFloat(i.perhead_charitable_spending_local);
    } else {
      return 0;
    }
  });

  map1 = _dataHist.map(function(i) {
    if (i.vote_outcome === "2") {
      return parseFloat(i.perhead_charitable_spending_local);
    } else {
      return 0;
    }
  });

  // Creating an SVG element by appending it into div
  svg_hist = d3.select('#histogram')
    .append("svg")
    .attr('id', 'histogram_svg') // needed?
    .attr("width", width_hist)
    .attr("height", height_hist + padding)
  .append("g") // adding a group (which is the element we are drawing into)
  .attr('transform', 'translate(' + (20 + margin_hist.left) + ',' + (margin_hist.top) + ')');

  // x scale (0)
  x_scale_hist = d3.scaleLinear()
    .domain([0, d3.max([d3.max(map0), d3.max(map1)])]) // (Math.ceil(d3.max(map) / 10)) * 10
    .rangeRound([0, width_hist - padding]);

  // create histogram data (ie. summarised into buckets)
  histogram_data0 = d3.histogram()
    .domain(x_scale_hist.domain())
    .thresholds(numb_thresholds)
    (map0);

  histogram_data1 = d3.histogram()
    .domain(x_scale_hist.domain())
    .thresholds(numb_thresholds)
    (map1);

  // Make histogram bars
  histogram_bars0 = svg_hist.selectAll(".bar")
    .data(histogram_data0)
    .enter()
    .append("g")
    .attr('class', 'hist_bars0');

  histogram_bars0
    .exit()
    .transition()
    .duration(500)
    .remove();

  histogram_bars1 = svg_hist.selectAll(".bar")
    .data(histogram_data1)
    .enter()
    .append("g")
    .attr('class', 'hist_bars1');

  // Take into account the margin in size of drawing canvas
  width_hist = width_hist - margin_hist.left - margin_hist.right;
  height_hist = height_hist - margin_hist.top - margin_hist.bottom;

  // y scale
  y_scale_hist = d3.scaleLinear()
    // take the maximum value of the array (size of array = height of bar)
    .domain([0, ((Math.ceil((d3.max([
      d3.max((histogram_data0.map(function(d) {
        return d.length;
      }))),
      d3.max((histogram_data1.map(function(d) {
        return d.length;
      })))
    ])) / 10)) * 10)])
    .rangeRound([height_hist, 0]);

  // make the x axis
  xaxis_hist = d3.axisBottom()
    .scale(x_scale_hist);

  // Add the x axis
  svg_hist.append("g")
    .attr("class", "x axis hist")
    .attr('transform', 'translate(0, ' + (height_hist) + ')') //  + margin_hist.top
    .call(xaxis_hist);

  // // Remove axis tick marks on x axis
  // svg_hist.selectAll(".tick").attr("visibilitgro", "hidden");

  // Add text label for the x axis
  svg_hist.append('text')
    .attr("class", "xaxis hist text")
    .attr('transform', 'translate(' + (width_hist / 2) + ' ,' +
      (height_hist + margin_hist.top + 30) + ')')
    .style("text-anchor", "middle")
    .text("perhead_charitable_spending_local");

  // Make the y axis
  yaxis_hist = d3.axisLeft()
    .scale(y_scale_hist);

  // Add the y axis
  svg_hist.append('g')
    .attr("class", "y axis hist")
    .call(yaxis_hist)
    .style("font", "10px");

  // Add text label for the y axis
  svg_hist.append("text")
    .attr("transform", "rotate(-90)")
    // .style("font", "1.1rem")
    // horizontal placement
    .attr("y", 0 - margin_hist.left - 10)
    .attr("x", 0 - (height_hist / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Number of local authority districts");

  // // Add gridlines
  // svg_hist.append("g")
  //   .attr("class", "grid")
  //   .call(make_y_gridlines(y_scale_hist)
  //     .tickSize(-width_hist)
  //     .tickFormat("")
  //   )

  // Respond to change in dropdown menu selection
  var selector = d3.select("#drop_histo")
    .append("select")
    .attr("id", "dropdown_histo")
    .on("change", redrawHist);

  selector.selectAll("option")
    .data(elements_hist)
    .enter()
    .append("option")
    .attr("value", function(d) {
      return d;
    })
    .text(function(d) {
      return d;
    })

  callback()

} // End of createChartFrame_hist
//////////////

// // gridlines in y axis function
// function make_y_gridlines(y_scale_hist) {
//   return d3.axisLeft(y_scale_hist)
//     .ticks(10)
// }

// Populate histogram
function drawHist() {

  histogram_bars0.append("rect")
    .attr('x', function(d) {
      return x_scale_hist(d.x0);
    })
    // flip so its the right way up
    .attr('y', function(d) {
      return y_scale_hist(d.length);
    })
    .attr('width', function(d) {
      return x_scale_hist((d.x1 - d.x0) / 2);
    }) //
    .attr('height', function(d) {
      return height_hist - y_scale_hist(d.length);
    }) //
    .attr('fill', '#d29000')
    .attr('class', 'bar');

  histogram_bars1.append("rect")
    // .enter() // ??? new
    .attr('x', function(d) {
      return x_scale_hist(((d.x1 - d.x0) / 2) + d.x0);
    })
    // flip so its the right way up
    .attr('y', function(d) {
      return y_scale_hist(d.length);
    })
    .attr('width', function(d) {
      return x_scale_hist((d.x1 - d.x0) / 2);
    }) //
    .attr('height', function(d) {
      return height_hist - y_scale_hist(d.length);
    }) //
    .attr('fill', "#cd988b")
    .attr('class', 'bar');

  // Add data labels
  // histogram_bars.append("text")
  //   .attr('x', function(d) {
  //     return x_scale_hist(d.x0);
  //   })
  //   .attr('y', function(d) {
  //     return height_hist - y_scale_hist(d.length)
  //   })
  //   .attr('dy', '20px')
  //   // ensure numbers in middle of each bar
  //   .attr('dx', function(d) {
  //     return x_scale_hist(d.x1 - d.x0) / 2;
  //   })
  //   .attr('fill', 'black')
  //   .attr('text-anchor', 'middle')
  //   .text(function(d) {
  //     return d.length;
  //   });

  populateChartTitleHist(selectedDisorder_hist);

} // End of drawHist

// Create chart titles
function populateChartTitleHist(input) {
  chartTitle = document.getElementById("histo_title");
  chartTitle.innerHTML = '';
  var chartTitleText = document.createTextNode("Series: " + input);
  chartTitle.appendChild(chartTitleText);

  // summary statistics
  histSummaryDiv = document.getElementById("histo_summary");
  histSummaryDiv.innerHTML = '';

  var list = document.createElement('ul');
  var histSummaryHeading = document.createTextNode("Summary data: ");

  var listItem1 = document.createElement('li');
  var listText1 = document.createTextNode("Min: ");
  listItem1.appendChild(listText1);
  list.appendChild(listItem1);

  var listItem2 = document.createElement('li');
  var listText2 = document.createTextNode("Min of variable: ");
  listItem2.appendChild(listText2);
  list.appendChild(listItem2);

  var listItem3 = document.createElement('li');
  var listText3 = document.createTextNode("Max of variable: ");
  listItem3.appendChild(listText3);
  list.appendChild(listItem3);

  var listItem4 = document.createElement('li');
  var listText4 = document.createTextNode("Max size of bar: ");
  listItem4.appendChild(listText4);
  list.appendChild(listItem4);

  var listItem5 = document.createElement('li');
  var listText5 = document.createTextNode("???: ");
  listItem5.appendChild(listText5);
  list.appendChild(listItem5);

  histSummaryDiv.appendChild(histSummaryHeading);
  histSummaryDiv.appendChild(list);

}

// Redraw hist chart after selection from drop down
function redrawHist(e) {

  dropdownListHist = document.getElementById("dropdown_histo");

  selectedDisorder_hist = dropdownListHist[dropdownListHist.selectedIndex]

  // Create basic data for histogram conversion
  map0 = data_hist.map(function(i) {
    if (i.vote_outcome === "1") {
      // console.log(parseFloat(+i[selectedDisorder_hist.value]));
      return parseFloat(+i[selectedDisorder_hist.value]);
    } else {
      return 0;
    }
  });

  map1 = data_hist.map(function(i) {
    if (i.vote_outcome === "2") {
      return parseFloat(+i[selectedDisorder_hist.value]);
    } else {
      return 0;
    }
  });
  console.log("new maps created");

  // create histogram data (ie. summarised into buckets)
  histogram_data0 = d3.histogram()
    .domain(x_scale_hist.domain())
    .thresholds(numb_thresholds)
    (map0);

  histogram_data1 = d3.histogram()
    .domain(x_scale_hist.domain())
    .thresholds(numb_thresholds)
    (map1);
  console.log("new histo data created");

  x_scale_hist = d3.scaleLinear()
    .domain([0, d3.max([d3.max(map0), d3.max(map1)])])
    .rangeRound([0, width_hist - padding]);

  y_scale_hist = d3.scaleLinear()
    .domain([0, ((Math.ceil((d3.max([
      d3.max((histogram_data0.map(function(d) {
        return d.length;
      }))),
      d3.max((histogram_data1.map(function(d) {
        return d.length;
      })))
    ])) / 10)) * 10)])
    .rangeRound([height_hist, 0]);

  // Add the x axis
  xaxis_hist = d3.axisBottom()
    .scale(x_scale_hist);

  d3.selectAll("g.x.axis.hist")
    .transition()
    .call(xaxis_hist);

  // Add the y axis
  yaxis_hist = d3.axisLeft()
    .scale(y_scale_hist);

  d3.selectAll("g.y.axis.hist")
    .transition()
    .call(yaxis_hist);

  // Remake histogram bars




  // histogram_bars0 = svg_hist.selectAll(".bar")
  //   .data(histogram_data0)
  //   .enter()
  //   .append("g")
  //   .attr('class', 'hist_bars0');
  //
  // histogram_bars1 = svg_hist.selectAll(".bar")
  //   .data(histogram_data1)
  //   .enter()
  //   .append("g")
  //   .attr('class', 'hist_bars1');

  //////
  //
  // d3.selectAll(".hist_bars0")

  histogram_bars0 = svg_hist.selectAll(".bar")
    .data(histogram_data0)
    .enter()
    .append("g")
    .attr('class', 'hist_bars0')
    .transition()
    .duration(100);

  histogram_bars1 = svg_hist.selectAll(".bar")
    .data(histogram_data1)
    .enter()
    .append("g")
    .attr('class', 'hist_bars1');

  d3.selectAll(".bar")
    .transition()
    .duration(100)
    .attr('fill', 'red');


  //   .transition()
  //   // .duration(750)
  //   // .ease(d3.easeCubicInOut)
  //   .attr('x', function(d) {
  //     return x_scale_hist(d.x0);
  //   })
  //   // flip so its the right way up
  //   .attr('y', function(d) {
  //     return y_scale_hist(d.length);
  //   })
  //   .attr('width', function(d) {
  //     return x_scale_hist((d.x1 - d.x0) / 2);
  //   }) //
  //   .attr('height', function(d) {
  //     return height_hist - y_scale_hist(d.length);
  //   }) //
  //   .attr('fill', 'black') // orange #d29000
  //   .attr('class', 'hist_bars0');
  // ;
  //
  // histogram_bars1 = svg_hist.selectAll(".bar")
  //   .data(histogram_data1)
  //   .transition()
  //   // .duration(750)
  //   // .ease(d3.easeCubicInOut)
  //   .attr('x', function(d) {
  //     return x_scale_hist(((d.x1 - d.x0) / 2) + d.x0);
  //   })
  //   // flip so its the right way up
  //   .attr('y', function(d) {
  //     return y_scale_hist(d.length);
  //   })
  //   .attr('width', function(d) {
  //     return x_scale_hist((d.x1 - d.x0) / 2);
  //   }) //
  //   .attr('height', function(d) {
  //     return height_hist - y_scale_hist(d.length);
  //   }) //
  //   .attr('fill', "blue") // pink #cd988b
  //   .attr('class', 'hist_bars1');

  // .select("title")
  // .text(selectedDisorder_hist.value);

  svg_hist.selectAll(".xaxis.hist.text")
    .transition()
    .text(selectedDisorder_hist.value);

  populateChartTitleHist(selectedDisorder_hist.value);

} //////////// End of redrawHist
