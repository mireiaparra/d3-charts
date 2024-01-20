import "./style.css";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { ScatterPlot } from "./scatterPlot.js";
import { menu } from "./menu.js";
const { csv } = d3;

const csvUrl = "/scatterplot/vgsales.csv";

const width = 800;
const height = 500;

const margin = { top: 20, right: 20, bottom: 20, left: 60 };

const xValue = (d) => d.Year;
const yValue = (d) => d.Global_Sales;


export function generateScatterPlot() {

  d3.select('.menu-container').remove();
  d3.select('.scatterplot-container').remove();

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
  .attr("height", height)
  .attr("class", "scatterplot-container");

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

  
  const options = [
    { value: "Year", text: "Year", type: "number" },
    { value: "Global_Sales", text: "Global Sales" , type: "number"},
    { value: "EU_Sales", text: "EU Sales", type: "number" },
    { value: "Rank", text: "Rank", type: "number" },
    { value: "Genre", text: "Genre", type: "string" },
  ];

  const getType = (column) => {
    const option = options.find((d) => d.value === column);
    return option.type;
  }

  xMenu.call(
    menu()
      .id("x-menu")
      .labelText("X:")
      .options(options)
      .on("change", (column) => {
        svg.call(plot
          .xValue((d) => d[column])
          .xType(getType(column))
          );
      })
  );
  yMenu.call(
    menu()
      .id("y-menu")
      .labelText("Y:")
      .options(options)
      .on("change", (column) => {
        svg.call(plot
          .yValue((d) => d[column])
          .yType(getType(column)));
      })
  );
};

main();

}
