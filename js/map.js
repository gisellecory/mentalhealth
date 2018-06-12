// Jvascript for map

// Ensure correct ordering, i.e. create map after DOM content loaded
document.addEventListener("DOMContentLoaded", function(event) {
  init();
});

// Global Variables
var width_map;
var height_map;
var svg_map;
var g_map;
var projection;
var path;
var zoom;
var ccg_data;
var ccg_details;
var ccg_help;
var ccg_name = "";
var notgethelp = "";
var selection;
var selection_value;

// Create map
function init() {

  width_map = document.getElementById("vis").clientWidth;
  height_map = document.getElementById("vis").clientHeight;

  // Create the SVG container
  svg_map = d3.select("#vis")
    .append("svg")
    .attr("id", "svg_map")
    .attr("width", width_map)
    .attr("height", height_map);

  // Add a g element to our SVG container
  g_map = svg_map.append("g");

  // Create zoom function
  zoom = d3.zoom().on("zoom", function() {
    g_map.attr('transform', d3.event.transform);
  });
  svg_map.call(zoom);

  // Projects from spherical coordinates (degrees) to Cartesian (pixels)
  projection = d3.geoAlbers().rotate([0, 0]);

  // Create a path generator (turn data into lines)
  path = d3.geoPath().projection(projection);

  // Load data asynchronously, draw map once all the data loaded
  d3.queue()
    .defer(d3.json, 'data/boundaries16.topojson') // geographic data
    .defer(d3.csv, 'data/ccg.csv') // outcomes data for each CCG
    .await(function(error, boundaries16_data, _ccg_data) {
      ccg_data = _ccg_data; // make this available globally
      draw(boundaries16_data);

      // Get every CCG name
      var elements = [];
      for (var i = 0; i < ccg_data.length; i++) {
        elements.push(ccg_data[i].short_name);
      }

      selection = elements;

      var selector = d3.select("#drop_map")
        .append("select")
        .attr("id", "dropdown_map")
        .on("change", function(d) {
          selection = document.getElementById("dropdown_map");
          selection_value = selection.value;
          for (var i = 0; i < ccg_data.length; i++) {
            if (ccg_data[i].short_name === selection_value) {
            ccg_name = ccg_data[i].short_name;
            notgethelp = ccg_data[i].notgethelp * 100;
          }
          }
          populateCcgInfo(ccg_name, notgethelp, '#ccg_name', '#gethelp');

        });

      selector
        .selectAll("option")
        .data(elements)
        .enter()
        .append("option")
        .attr("value", function(d) {
          return d;
        })
        .text(function(d) {
          return d;
        })
    });
} // End of initalise function

// Draw our data onto the map
function draw(ccg_boundaries) {

  // Extract the "Feature Collection" from the topojson
  boundsFC = topojson.feature(ccg_boundaries, ccg_boundaries.objects.boundaries16_geo);

  // Set default values for the projection function to convert boundary coordinates to pixels
  projection.scale(1).translate([0, 0]);

  // Create and scale our boundary space
  var b = path.bounds(boundsFC);
  var s = 0.95 / Math.max((b[1][0] - b[0][0]) / width_map, (b[1][1] - b[0][1]) / height_map);
  var t = [(width_map - s * (b[1][0] + b[0][0])) / 2, (height_map - s * (b[1][1] + b[0][1])) / 2];
  projection.scale(s).translate(t);

  // Bind boundary data to anything with a class of ‘area’
  var areas = g_map.selectAll('.area').data(boundsFC.features);

  // Create and style areas
  areas
    .enter()
    .append('path')
    .attr('class', 'area')
    // .attr('fill', 'orange')
    .style('fill', function(d) {
      for (var i = 0; i < ccg_data.length; i++) {
        if (ccg_data[i].full_name.toUpperCase() === d.properties.ccg16nm.toUpperCase()) {
          return ccg_data[i].colour;
        }
      }
      // If we don't find a colour, return white
      return "#fffff";
    })
    .attr('id', function(d) {
      // Assign an ID to each CCG
      return d.properties.ccg16nm;
    })
    .attr('d', path)
    // Add click listener to each CCG
    .on('click', clicked);

// Legend

var colours = ["#ffffd4", "#fed98e", "#fe9929", "#d95f0e", "#993404"];
var legend_text = ["0 - 9%", "10% - 19%", "20 - 29%", "30 - 39%", "40% and above"];

var legend = svg_map.selectAll('.legend')
    .data(colours);

// add a ‘g’ element for each colour in the data,
var new_legend = legend
    .enter()
    .append('g')
    .attr('class', 'legend');

// append a ‘rect’ element to each group
new_legend.merge(legend)
    .append('rect')
    .attr('width', 20)
    .attr('height', 20)
    .attr('x', 0.1*width)
    .attr('y', function(d, i){ return 0.8*height - (i * 20); })
    .attr('fill', function(d){ return d })
    .attr('stroke', 'black')
    .attr('stroke-width', '0.5px')
    ;

// append a ‘text’ element to each group
new_legend.merge(legend)
    .append('text')
    .attr('class', 'legend_text')
    .attr('x', 0.15*width + 20)
    .attr('y', function(d, i){ return 0.8*height + 15- (i * 20); })
    .text(function(d,i){

      return legend_text[i];
});

} // End of draw function


// Output text given map area selection
function populateCcgInfo(name, stat, outputDetails, outputStat) {

  document.querySelector(outputDetails).innerHTML = '';
  document.querySelector(outputStat).innerHTML = '';

  ccg_details = document.createTextNode("Area: " + name);
  document.querySelector(outputDetails).appendChild(ccg_details);

  if (stat != 0) {
    ccg_help = document.createTextNode("Patient outcomes: " + stat + " per cent of patients said that, on reflection, they did not get the help that mattered to them at all times");

  } else {
    var ccg_help = document.createTextNode("No data is available for % of residents get help (change)");
  }

  document.querySelector(outputStat).appendChild(ccg_help);

} // End of populate function

// Display data on click
function clicked(d) {

  // Get the relevant CCG data and display it in our "info" div
  for (var i = 0; i < ccg_data.length; i++) {
    // d.properties.ccg16nm gives us the name of the clicked CCG
    if (ccg_data[i].full_name.toUpperCase() === d.properties.ccg16nm.toUpperCase()) {
      ccg_name = ccg_data[i].short_name;
      notgethelp = ccg_data[i].notgethelp * 100;
    }
  }

  populateCcgInfo(ccg_name, notgethelp, '#ccg_name', '#gethelp');

} // End of clicked function
