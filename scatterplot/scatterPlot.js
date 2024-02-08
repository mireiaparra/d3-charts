import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const ScatterPlot = () => {
  let width;
  let height;
  let data;
  let xValue;
  let yValue;
  let xType;
  let yType;
  let margin;
  let radius;
  let tooltipTexts;
  let colorScheme;

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  const my = (selection) => {
    const x =
      xType === "string"
        ? d3
            .scalePoint()
            .domain(data.map(xValue))
            .range([margin.left, width - margin.right])
        : d3
            .scaleLinear()
            .domain(d3.extent(data, xValue))
            .range([margin.left, width - margin.right]);
    const y =
      yType === "string"
        ? d3
            .scalePoint()
            .domain(data.map(yValue))
            .range([height - margin.bottom, margin.top])
        : d3
            .scaleLinear()
            .domain(d3.extent(data, yValue))
            .range([height - margin.bottom, margin.top]);


    const colorScale = d3
      .scaleOrdinal()
      .domain(d3.range(data.length))
      .range(colorScheme);

    const t = d3.transition().duration(1000);
    const tCircles = d3.transition().duration(2000);

    const positionCircles = (circles) => {
      circles.attr("cx", (d) => x(xValue(d))).attr("cy", (d) => y(yValue(d)));
    };
    const initializeRadius = (circles) => {
      circles.attr("r", 0);
    };

    const growRadius = (enter) => {
      enter.transition(tCircles).attr("r", radius);
    };

    d3.select("body > div.tooltip").remove();

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    selection
      .selectAll("circle")
      .data(data)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("fill", (d, i) => colorScale(i))
            .call(positionCircles)
            .call(initializeRadius)
            .call(growRadius),
        (update) =>
          update.call((update) =>
            update
              .transition(t)
              .delay((d, i) => i * 1)
              .call(positionCircles)
          ),
        (exit) => exit.remove()
      )
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(100).style("opacity", 0.9);
        tooltip
          .html(
            tooltipTexts
              .map((key) => `${capitalizeFirstLetter(key)}: ${d[key]}`)
              .join("\n")
          )
          .style("position", "absolute")
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function (d) {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    selection
      .selectAll(".y-axis")
      .data([null])
      .join("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .transition(t)
      .call(d3.axisLeft(y));

    selection
      .selectAll(".x-axis")
      .data([null])
      .join("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .transition(t)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");
  };

  my.width = function (param) {
    return arguments.length ? ((width = +param), my) : width;
  };

  my.height = function (param) {
    return arguments.length ? ((height = +param), my) : height;
  };

  my.data = function (param) {
    return arguments.length ? ((data = param), my) : data;
  };

  my.xValue = function (param) {
    return arguments.length ? ((xValue = param), my) : xValue;
  };

  my.yValue = function (param) {
    return arguments.length ? ((yValue = param), my) : yValue;
  };

  my.xType = function (param) {
    return arguments.length ? ((xType = param), my) : xType;
  };

  my.yType = function (param) {
    return arguments.length ? ((yType = param), my) : yType;
  };

  my.margin = function (param) {
    return arguments.length ? ((margin = param), my) : margin;
  };

  my.radius = function (param) {
    return arguments.length ? ((radius = param), my) : radius;
  };

  my.tooltipTexts = function (param) {
    return arguments.length ? ((tooltipTexts = param), my) : tooltipTexts;
  };

  my.colorScheme = function (param) {
    return arguments.length ? ((colorScheme = param), my) : colorScheme;
  }

  return my;
};

export { ScatterPlot };
