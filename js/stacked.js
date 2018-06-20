// Jvascript for stacked bar chart

var svg_stacked = d3.select("#svg_stacked"),
  margin_stack = {
    top: 10,
    left: 70, // shifts whole thing left or right (including axis label)
    right: 10,
    bottom: 40
  },
  width_stack = +svg_stacked.attr("width") - margin_stack.left - margin_stack.right,
  height_stack = +svg_stacked.attr("height") - margin_stack.top - margin_stack.bottom,
  g = svg_stacked.append("g").attr("transform", "translate(" + 70 + "," + margin_stack.top + ")");

var x = d3.scaleBand()
  .rangeRound([0, width_stack])
  .paddingInner(0.02)
  // gap between y-axis and data series
  .align(0.01);

var y = d3.scaleLinear()
  .rangeRound([height_stack, 0]);

var z = d3.scaleOrdinal()
  .range(["#e51293", "#cd988b", "#abac00", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

d3.csv("data/lad_data_nocol_stacked.csv", function(d, i, columns) {
  for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
  d.total = t;
  return d;
}, function(error, data) {
  if (error) throw error;

  var keys = data.columns.slice(1);

  data.sort(function(a, b) {
    return b.total - a.total;
  });
  x.domain(data.map(function(d) {
    return d.la_name;
  }));
  y.domain([0, d3.max(data, function(d) {
    return d.total;
  })]).nice();
  z.domain(keys);

  g.append("g")
    .selectAll("g")
    .data(d3.stack().keys(keys)(data))
    .enter().append("g")
    .attr("fill", function(d) {
      return z(d.key);
    })
    .selectAll("rect")
    .data(function(d) {
      return d;
    })
    .enter().append("rect")
    .attr("x", function(d) {
      return x(d.data.la_name);
    })
    .attr("y", function(d) {
      return y(d[1]);
    })
    .attr("height", function(d) {
      return y(d[0]) - y(d[1]);
    })
    .attr("width", x.bandwidth());

  // X axis
  g.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height_stack + ")")
    .call(d3.axisBottom(x))
    // axis tick marks on x axis
    .selectAll(".tick").attr("visibility", "hidden");

svg_stacked.append('text')
    .attr('transform', 'translate(' + ((width_stack/2) + margin_stack.left + margin_stack.right) + ' ,' +
      (height_stack + margin_stack.top + 25) + ')')
    .style("text-anchor", "middle")
    .text("Local Authority Districts");

  // Y axis
  g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -70) // 0 - margin_stack.left - 10
    .attr("x", 0 - (height_stack / 2))
    .attr("dy", "1em")
    // .attr("x", 2)
    // .attr("y", y(y.ticks().pop()) + 0.5)
    // .attr("dy", "0.32em")
    .attr("fill", "#000")
    .attr("font-family", 'Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text", "Times New Roman", serif')
    .attr("font-size", "18px")
    .attr("text-anchor", "middle")
    .text("Amount (£)");

  // Legend
  var legend = g.append("g")
    // .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
    .attr("transform", function(d, i) {
      return "translate(0," + i * 20 + ")";
    });

  legend.append("rect")
    .attr("x", width_stack - 19)
    .attr("width", 19)
    .attr("height", 19)
    .attr("fill", z);

  legend.append("text")
    .attr("x", width_stack - 24)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .text(function(d) {
      return d;
    });
});
