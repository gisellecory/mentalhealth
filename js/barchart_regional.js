// Javascript for grouped bar chart

var svg_group = d3.select("#svg_bargroup"),
    margin_group = {top: 20, right: 20, bottom: 50, left: 70},
    width_group = +svg_group.attr("width") - margin_group.left - margin_group.right,
    height_group = +svg_group.attr("height") - margin_group.top - margin_group.bottom,
    g_group = svg_group.append("g").attr("transform", "translate(" + margin_group.left + "," + margin_group.top + ")");

// Create scales
var x0_group = d3.scaleBand()
    .rangeRound([0, width_group])
    .paddingInner(0.1);

var x1_group = d3.scaleBand()
    .padding(0.05);

var y_group = d3.scaleLinear()
    .rangeRound([height_group, 0]);

// Fill colours
var z_group = d3.scaleOrdinal()
    .range(["#abac00", "#d29000", "#cd988b", "#f52f3d"]);

// Read in data
d3.csv("data/regional.csv", function(d, i, columns) {
  for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
  // console.log(columns);
  return d;
}, function(error, data) {
  if (error) throw error;

// sort data
  data.sort(function(a, b) {
    return b.remain - a.remain;
  });

  var keys_group = data.columns.slice(1);
 // console.log(keys_group)
  x0_group.domain(data.map(function(d) {
    // console.log(d.region);
    return d.region; }));
  x1_group.domain(keys_group).rangeRound([0, x0_group.bandwidth()]);
  y_group.domain([0, d3.max(data, function(d) {
// console.log(d3.max(keys_group, function(key) { return d[key]; }));
    return d3.max(keys_group, function(key) { return d[key]; }); })]).nice();

  g_group.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + x0_group(d.region) + ",0)"; })
    .selectAll("rect")
    .data(function(d) { return keys_group.map(function(key) { return {key: key, value: d[key]}; }); })
    .enter().append("rect")
      .attr("x", function(d) { return x1_group(d.key); })
      .attr("y", function(d) { return y_group(d.value); })
      .attr("width", x1_group.bandwidth())
      .attr("height", function(d) { return height_group - y_group(d.value); })
      .attr("fill", function(d) { return z_group(d.key); });

// X axis
  g_group.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height_group + ")")
      .call(d3.axisBottom(x0_group));

  svg_group.append('text')
      .attr('transform', 'translate(' + ((width_group/2) + margin_group.left + margin_group.right) + ' ,' +
        (height_group + margin_group.top + 45) + ')')
      .style("text-anchor", "middle")
      .text("Region");

// Y axis
  g_group.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y_group).ticks(null, "s"))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0 - (height_group / 2))
      .attr("y", y_group(y_group.ticks().pop()) - 60)
      .attr("dy", "1em")
      .attr("fill", "#000")
      // .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-family", 'Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text", "Times New Roman", serif')
      .text("Amount (£)");

  var legend_group = g_group.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys_group.slice()) // .reverse()
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend_group.append("rect")
      .attr("x", width_group - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z_group);

  legend_group.append("text")
      .attr("x", width_group - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });
});
