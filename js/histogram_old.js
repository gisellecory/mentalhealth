// Populate bar chart
function drawHist() {

  // Add data labels

  labels
    .enter()


} // End of drawHist

// Redraw bar chart after selection from drop down
function redrawHist(e) {

  dropdownListHist = document.getElementById("dropdown_histo");
  selectedDisorder_hist = dropdownListHist[dropdownListHist.selectedIndex]

  y_scale_hist.domain([0, d3.max(data_hist, function(d) {
    return (+d[selectedDisorder_hist.value] * 1.1);
  })]);
  yaxis_hist.scale(y_scale_hist);
  svg_hist.selectAll("rect")
    .transition()
    .attr('height', function(d) {
      return (height_hist - y_scale_hist(+d[selectedDisorder_hist.value]));
    })
    .attr("x", function(d, i) {
      return 20 + (width_hist / data_hist.length) * i;
    })
    .attr("y", function(d) {
      return y_scale_hist(+d[selectedDisorder_hist.value]);
    })
    .ease(d3.easeCubicInOut)
    .duration(750)
    .select("title")
    .text(function(d) {
      return d[selectedDisorder_hist.value];
    });

  d3.selectAll("g.y.axis")
    .transition()
    .call(yaxis_hist);

  populateChartTitleHist(selectedDisorder_hist.value);

} // End of redrawHist
