import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export const MapGraphic = () => {
  let dataMap;
  let dataMapDetails;
  let dataMarks;
  let translation;
  let scale;
  let radius;
  let tooltipText;

  const my = (selection) => {
    let projection = d3.geoMercator().translate(translation).scale(scale);

    const path = d3.geoPath().projection(projection);

    selection.select("path").remove();

    selection
      .selectAll("g.container")
      .append("path")
      .datum(topojson.mesh(dataMap, dataMapDetails))
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("d", path);

    selection.select("g.circle").remove();

    d3.selectAll("body > div.tooltip").remove();

    const tooltip = d3.select("body").append("div")
     .attr("class", "tooltip")
     .style("opacity", 0);

    selection
      .selectAll("g.container")
      .append("g")
      .attr("class", "circle")
      .selectAll("circle")
      .data(dataMarks)
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return projection([d.lon, d.lat])[0];
      })
      .attr("cy", function (d) {
        return projection([d.lon, d.lat])[1];
      })
      .attr("r", radius)
      .style("fill", "red")
      .on("mouseover", function (event, d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
          tooltip.html(d[tooltipText])
          .style("position", "absolute")
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function (d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  };

  my.dataMap = function (value) {
    if (!arguments.length) return dataMap;
    dataMap = value;
    return my;
  };

  my.dataMapDetails = function (value) {
    if (!arguments.length) return dataMapDetails;
    dataMapDetails = value;
    return my;
  };

  my.dataMarks = function (value) {
    return arguments.length ? ((dataMarks = value), my) : dataMarks;
  };

  my.translation = function (value) {
    if (!arguments.length) return translation;
    translation = value;
    return my;
  };

  my.scale = function (value) {
    if (!arguments.length) return scale;
    scale = value;
    return my;
  };

  my.radius = function (value) {
    if (!arguments.length) return radius;
    radius = value;
    return my;
  };

  my.tooltipText = function (value) {
    if (!arguments.length) return tooltipText;
    tooltipText = value;
    return my;
  }

  return my;
};
