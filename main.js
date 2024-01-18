import "./style.css";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { ScatterPlot } from "./scatterPlot.js";
import { menu } from "./menu.js";
const { csv } = d3;

const csvUrl = "./vgsales.csv";

const width = 900;
const height = 500;

const margin = { top: 20, right: 20, bottom: 20, left: 20 };

const xValue = (d) => d.Year;
const yValue = (d) => d.Global_Sales;

const menuContainer = d3
  .select("body")
  .append("div")
  .attr("class", "menu-container");

const xMenu = menuContainer.append("div");
const yMenu = menuContainer.append("div");

const parseRow = (d) => {
  d.Rank = +d.Rank;
  d.Year = +d.Year;
  d.EU_Sales = +d.EU_Sales;
  d.Global_Sales = +d.Global_Sales;
  return d;
};

const svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const main = async () => {
  let data = await csv(csvUrl, parseRow);
  data = data.filter((d) => d.Publisher === "Nintendo" && Number(d.Year));

  const plot = ScatterPlot()
    .width(width)
    .height(height)
    .data(data)
    .xValue(xValue)
    .yValue(yValue)
    .margin(margin)
    .radius(5);

  svg.call(plot);

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

  svg
    .selectAll("circle")
    .data(marks)
    .join("circle")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 5);

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));
  // .call((g) => g.select(".domain").remove())
  // .call((g) =>
  // g
  // .append("text")
  // .attr("x", width - margin.right)
  // .attr("y", -4)
  // .attr("fill", "currentColor")
  // .attr("font-weight", "bold")
  // .attr("text-anchor", "end")
  // .text(data.x)
  // );

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));
  // .call((g) => g.select(".domain").remove())
  // .call((g) =>
  // g
  // .append("text")
  // .attr("x", 4)
  // .attr("y", margin.top)
  // .attr("fill", "currentColor")
  // .attr("font-weight", "bold")
  // .attr("text-anchor", "start")
  // .text(data.y)
  // );

  const options = [
    { value: "Year", text: "Year" },
    { value: "Global_Sales", text: "Global Sales" },
    { value: "EU_Sales", text: "EU Sales" },
    { value: "Rank", text: "Rank" },
  ];

  xMenu.call(
    menu()
      .id("x-menu")
      .labelText("X:")
      .options(options)
      .on("change", (column) => {
        svg.call(plot.xValue((d) => d[column]));
      })
  );
  yMenu.call(
    menu()
      .id("y-menu")
      .labelText("Y:")
      .options(options)
      .on("change", (column) => {
        svg.call(plot.yValue((d) => d[column]));
      })
  );
};

main();
