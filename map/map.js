import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export const MapGraphic = () => {
  let dataMap;
  let dataMapDetails;
  let dataMarks;
  let translation;
  let scale;
  let radius;

  const my = (selection) => {
    let projection = d3.geoMercator().translate(translation).scale(scale);

    const path = d3.geoPath().projection(projection);

    selection.select("path").remove();

    selection
      .append("path")
      .datum(topojson.mesh(dataMap, dataMapDetails))
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("d", path);

    selection.select("g").remove();

    selection
      .append("g")
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
      .style("fill", "red");
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
    console.log;
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

  return my;
};
