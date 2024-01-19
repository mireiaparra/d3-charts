import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const ScatterPlot = () => {
  let width;
  let height;
  let data;
  let xValue;
  let yValue;
  let margin;
  let radius;

  const my = (selection) => {
    const x = d3
    .scaleLinear()
    .domain(d3.extent(data, xValue))
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(data, yValue))
    .range([height - margin.bottom, margin.top]);

  const marks = data.map((d) => ({
    x: x(xValue(d)),
    y: y(yValue(d)),
  }));

  const t = d3.transition().duration(1000);

  const positionCircles = (circles) => {
    circles.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
  };

  const initializeRadius = (circles) => {
    circles.attr('r', 0);
  };
  
  const growRadius = (enter) => {
    enter.transition(t).attr('r', radius);
  };

  const circles = selection
  .selectAll('circle')
  .data(marks)
  .join(
    (enter) =>
      enter
        .append('circle')
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
  );

  selection
  .selectAll('.y-axis')
  .data([null])
  .join('g')
  .attr('class', 'y-axis')
  .attr('transform', `translate(${margin.left},0)`)
  .transition(t)
  .call(d3.axisLeft(y));

selection
  .selectAll('.x-axis')
  .data([null])
  .join('g')
  .attr('class', 'x-axis')
  .attr(
    'transform',
    `translate(0,${height - margin.bottom})`
  )
  .transition(t)
  .call(d3.axisBottom(x));


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

  my.margin = function (param) {
    return arguments.length ? ((margin = param), my) : margin;
  };

  my.radius = function (param) {
    return arguments.length ? ((radius = param), my) : radius;
  };

  return my;
  
};

export { ScatterPlot };
