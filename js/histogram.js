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
var histogram_bars;
var histogram_data;
var numb_thresholds = 10;

//  Width and height of element
var width_hist = (document.getElementById("histogram").clientWidth);
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
      return (d != "oslaua" && d != "la_name");
    });

  selectedDisorder_hist = elements_hist[0];

  createChartFrame_hist(_dataHist, drawHist)

} ////////////// end of createChart_hist

// Draw the chart framework
function createChartFrame_hist(_dataHist, callback) {

  map = _dataHist.map(function(i) {
    return parseFloat(i.charity_count_local);
  })

  // Creating an SVG element by appending it into div
  svg_hist = d3.select('#histogram')
    .append("svg")
    .attr('id', 'histogram_svg') // needed?
    .attr("width", width_hist)
    .attr("height", height_hist + padding)
    .append("g") // adding a group (which is the element we are drawing into)
    .attr('transform', 'translate(' + (20 + margin_hist.left) + ',' + (margin_hist.top) + ')');;

  // create histogram data (ie. summarised into buckets)
  histogram_data = d3.histogram()
    .thresholds(numb_thresholds)
    (map);

  // Make histogram bars
  histogram_bars = svg_hist.selectAll(".bar")
    .data(histogram_data)
    .enter()
    .append("g")

  // Take into account the margin in size of drawing canvas
  width_hist = width_hist - margin_hist.left - margin_hist.right;
  height_hist = height_hist - margin_hist.top - margin_hist.bottom;

  // x scale
  // console.log(d3.max(map))
  // console.log(width_hist)
  x_scale_hist = d3.scaleLinear()
    // max of the variable
    // .domain([0, d3.extent(map)])
    // _dataHist, function(d) {
    // return +d.charity_count_local;
    // })
    .domain([0, d3.max(map)]) // (Math.ceil(d3.max(map) / 10)) * 10
    .rangeRound([0, width_hist - padding]);

  // console.log(histogram_data.map(function(d) { return d.length; }))
  //
  // console.log((Math.ceil((d3.max(histogram_data.map(function(d) { return d.length; })))/10)) * 10)

  // y scale
  y_scale_hist = d3.scaleLinear()
    // take the maximum value of the array (size of array = height of bar)
    .domain([0, ((Math.ceil((d3.max(histogram_data.map(function(d) {
      return d.length;
    }))) / 10)) * 10)])
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
    .attr('transform', 'translate(' + (width_hist / 2) + ' ,' +
      (height_hist + margin_hist.top + 30) + ')')
    .style("text-anchor", "middle")
    .text("Buckets (input data)");

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
    // .attr("id", "dropdown_histo")
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

  histogram_bars.append("rect")
    // .enter() // ??? new
    .attr('x', function(d) {
      return x_scale_hist(d.x0);
    })
    // flip so its the right way up
    .attr('y', function(d) {
      return y_scale_hist(d.length);
    })
    .attr('width', function(d) {
      // console.log(x_scale_hist(d.x1 - d.x0));
      return x_scale_hist(d.x1 - d.x0);
    }) //
    .attr('height', function(d) {
      // console.log(height_hist - y_scale_hist(d.length))
      return height_hist - y_scale_hist(d.length);
    }) //
    .attr('fill', '#abac00')
    .attr('class', 'bar')

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
  console.log("the selected data series is " + selectedDisorder_hist.value);

  map = data_hist.map(function(d) {
    return parseFloat(+d[selectedDisorder_hist.value]);
  })
  // console.log(map)

  // create histogram data (ie. summarised into buckets)
  histogram_data = d3.histogram()
    .thresholds(numb_thresholds)
    (map);

    // Make histogram bars
    histogram_bars = svg_hist.selectAll(".bar")
      .data(histogram_data)
      .enter()
      .append("g")

  console.log("the histogram data array is ");
  console.log(histogram_data);

  console.log("the largest array (and therefore the y-axis limit) is " + d3.max(histogram_data.map(function(d) {
    return d.length;
  })))

  console.log("the largest value (and therefore the x axis limit) is " + d3.max(map));

  x_scale_hist = d3.scaleLinear()
    // .domain([0, d3.max(map)])
    // .domain([0, d3.max(data_hist, function(d) {
    //   return (+d[selectedDisorder_hist.value] * 1.1);
    // })])
    // .domain([0, d3.max(data_hist.map(function(i) {
    //   return parseFloat(i.selectedDisorder_hist.value);
    // }))])
    .domain([0, d3.max(map)]) // (Math.ceil(d3.max(map) / 10)) * 10 // d3.min(map)
    .rangeRound([0, width_hist - padding]);

  y_scale_hist = d3.scaleLinear()
    // .domain([0, ((Math.ceil((d3.max(histogram_data.map(function(d) {
    //   return d.length;
    // }))) / 10)) * 10)])
    .domain([0, d3.max(histogram_data.map(function(d) {
      return d.length;
    }))])
    .rangeRound([height_hist, 0]);

    xaxis_hist = d3.axisBottom()
      .scale(x_scale_hist);

      // Add the x axis
      d3.selectAll("g.x.axis.hist")
        .transition()
        .call(xaxis_hist);

  yaxis_hist = d3.axisLeft()
    .scale(y_scale_hist);

    // Add the y axis
    d3.selectAll("g.y.axis.hist")
      .transition()
      .call(yaxis_hist);


  svg_hist.selectAll(".bar")
    .transition()
    .attr('height', function(d) {
      console.log("Height is " + (height_hist - y_scale_hist(d.length)))
      return height_hist - y_scale_hist(d.length)
      // (height_hist - y_scale_hist(+d[selectedDisorder_hist.value]))
      ;
    })
    .attr('width', function(d) {
      console.log(d.x1)
      console.log(d.x0)
      console.log(d.x1 - d.x0)
      console.log("Width is " + x_scale_hist(d.x1 - d.x0));
      return x_scale_hist(d.x1 - d.x0);
    }) //
    .attr("x", function(d, i) {
      return x_scale_hist(d.x0);
      // 20 + (width_hist / d.length) * i;
    })
    .attr("y", function(d) {
      return y_scale_hist(d.length);
      // y_scale_hist(+d[selectedDisorder_hist.value]);
    })
    .ease(d3.easeCubicInOut)
    .duration(750)
    .select("title") // ???
    .text(function(d) {
      return d[selectedDisorder_hist.value];
    });

  populateChartTitleHist(selectedDisorder_hist.value);

} //////////// End of redrawHist
