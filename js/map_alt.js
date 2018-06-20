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
var area_data;
var area_name_text;
var area_stat;
var area_name = "";
var selection;
var selectionAreaValue;
var selectionDataValue;
var selectorMap;
var elements_map;

// set colour scale
var colours = colorbrewer.Blues[9]
var colour_scale = d3.scaleQuantile()
  .range(colours)

// Create map
function init() {

  width_map = document.getElementById("vis").clientWidth;
  height_map = document.getElementById("vis").clientHeight;

  // Create the SVG container
  svg_map = d3.select("#vis")
    .append("svg")
    .attr("id", "svg_map")
    .attr("width", "80vw") // width_map
    .attr("height", "90vh"); // height_map

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

  // Read in boundary data to eyeball in console
  // http://learnjsdata.com/read_data.html
  // d3.json("/data/Boundaries.topojson", function(data) {
  //   console.log(data);
  // });

  // Load data asynchronously, draw map once all the data loaded
  d3.queue()
    .defer(d3.json, 'data/Boundaries.topojson') // geographic data
    .defer(d3.csv, 'data/lad_data_nocol.csv') // outcomes data for each area
    .await(function(error, boundaries_data, _data) {
      area_data = _data; // to make this available globally
      draw(boundaries_data);

///// Drop down for areas

      // console.log(area_data);
      // Get every area name
      var elements_areas = [];
      // console.log(area_data.length);
      for (var i = 0; i < area_data.length; i++) {
        elements_areas.push(area_data[i].la_name);
      }
      // console.log(elements_areas);
      selection = elements_areas;

      var selectorAreas = d3.select("#drop_map_areas")
        .append("select")
        .attr("id", "dropdown_map_areas")
        .on("change", function(d) {
          selection = document.getElementById("dropdown_map_areas");
          // console.log(selection);
          selectionAreaValue = selection.value;
          for (var i = 0; i < area_data.length; i++) {
            if (area_data[i].la_name === selectionAreaValue) {
              area_name = area_data[i].la_name;
              area_stat_value = area_data[i].charity_count_local_rate;
            }
          }
          populateAreaInfo(area_name, area_stat_value, '#area_name', '#stat');
        });

      selectorAreas
        .selectAll("option")
        .data(elements_areas)
        .enter()
        .append("option")
        .attr("value", function(d) {
          return d;
        })
        .text(function(d) {
          return d;
        });


        //// Drop down for data series

        // Get every column value
        elements_map = Object.keys(area_data[0])
          .filter(function(d) {
            return (d != "oslaua" && d != "la_name");
          });
        // console.log(elements_map)
selectedDataseries_bar = elements_map[0];

selectorMap = d3.select("#drop_map_series")
  .append("select")
  .attr("id", "dropdown_map_series")
  .on("change", function(d) {
    selection = document.getElementById("dropdown_map_series");
    // console.log(selection);
    selectionDataValue = selection.value;
    // console.log(selectionDataValue)
});

selectorMap
  .selectAll("option")
  .data(elements_map)
  .enter()
  .append("option")
  .attr("value", function(d) {
    return d;
  })
  .text(function(d) {
    return d;
  });

    }); //end of await function, i.e. things that are done on load of the data

} // End of initalise function
///////////////////////

// Draw our data onto the map
function draw(boundaries) {

  colour_scale.domain(d3.extent(area_data, function(d) {
    return +d.charity_count_local_rate;
  }));
  // console.log(colour_scale.invertExtent(colours[1]));

  // Extract the "Feature Collection" from the topojson
  boundsFC = topojson.feature(boundaries, boundaries.objects.Local_Authority_Districts_December_2015_Super_Generalised_Clipped_Boundaries_in_Great_Britain);
  // console.log(boundsFC);
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
    .style('fill', function(d) {
      for (var i = 0; i < area_data.length; i++) {
        if (area_data[i].oslaua === d.properties.lad15cd) {
          return colour_scale(parseFloat(area_data[i].charity_count_local_rate));
        }
      }
      // If we don't find a colour, return white
      return "white";
    })
    .attr('id', function(d) {
      // Assign an ID to each area
      return d.properties.lad15cd;
    })
    .attr('d', path)
    // Add click listener to each area
    .on('click', clicked);

  // Legend
  var f = d3.format(".1f");
  // Get every area name
  var legend_text = [];
  for (var i = 0; i < colours.length; i++) {
    legend_text.push(f(colour_scale.invertExtent(colours[i])[0]) + " - " + f(colour_scale.invertExtent(colours[i])[1])); // + " %"

    // legend_text.push(colour_scale.invertExtent(colours[i]) + " %");
  };

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
    .attr('x', 0.1 * width_map)
    .attr('y', function(d, i) {
      return 0.8 * height_map - (i * 20);
    })
    .attr('fill', function(d) {
      return d
    })
    .attr('stroke', 'black')
    .attr('stroke-width', '0.5px');

  // append a ‘text’ element to each group
  new_legend.merge(legend)
    .append('text')
    .attr('class', 'legend_text')
    .attr('x', 0.15 * width_map + 20)
    .attr('y', function(d, i) {
      return 0.8 * height_map + 15 - (i * 20);
    })
    .text(function(d, i) {

      return legend_text[i];
    });

    chartTitleMap = document.getElementById("map_title");
    chartTitleMap.innerHTML = '';
    var chartTitleMapText = document.createTextNode("Data series: charity_count_local_rate");
    chartTitleMap.appendChild(chartTitleMapText);

} // End of draw function
//////////////////

// Output text given map area selection
function populateAreaInfo(name, stat, outputDetails, outputStat) {

  document.querySelector(outputDetails).innerHTML = '';
  document.querySelector(outputStat).innerHTML = '';

  area_name_text = document.createTextNode("Area: " + name);
  document.querySelector(outputDetails).appendChild(area_name_text);

  if (stat != 0) {
    area_stat = document.createTextNode("charity_count_local_rate: " + stat);
// ("Brexit: " + stat + " per cent of residents voted leave")
  } else {
    var area_stat = document.createTextNode("No data is available for % of residents get help (change)");
  }

  document.querySelector(outputStat).appendChild(area_stat);

} // End of populate function

// Display data on click
function clicked(d) {

  // Get the relevant data and display it in our "info" div
  for (var i = 0; i < area_data.length; i++) {
    // d.properties.lad15cd gives us the ID of the clicked area
    if (area_data[i].oslaua === d.properties.lad15cd) {
      area_name = area_data[i].la_name;
      area_stat_value = area_data[i].charity_count_local_rate;
    }
  }

  populateAreaInfo(area_name, area_stat_value, '#area_name', '#stat');

} // End of clicked function
