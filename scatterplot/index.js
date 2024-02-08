import "./style.css";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { ScatterPlot } from "./scatterPlot.js";
import { menu } from "./menu.js";
const { csv } = d3;

const csvUrl = "/d3-charts/vgsales.csv";

const width = 900;
const height = 600;

const margin = { top: 50, right: 20, bottom: 140, left: 140 };

const xValue = (d) => d.Year;
const yValue = (d) => d.Global_Sales;


export function generateScatterPlot() {

  d3.select('.menu-container').remove();
  d3.select('.graphic-container').remove();
  d3.select('.tooltip').remove();
  d3.select('.reset-button').remove();
  d3.select('.chart-title').remove();

const menuContainer = d3
  .select("#app")
  .append("div")
  .attr("class", "menu-container");

const yMenu = menuContainer.append("div").attr("class", "menu");
const xMenu = menuContainer.append("div").attr("class", "menu");

const parseRow = (d) => {
  d.Rank = +d.Rank;
  d.Year = +d.Year;
  d.EU_Sales = +d.EU_Sales;
  d.Global_Sales = +d.Global_Sales;
  return d;
};

  d3.select("#chart")
    .append("h2")
    .attr("class", "chart-title")
    .text("Nintendo Games Sales");

const svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "graphic-container");

  let colorScheme;
  let isLightMode = document.body.classList.contains('light-mode');
  if (isLightMode) {
    colorScheme = d3.schemePastel1;
  } else {
    colorScheme = d3.schemeCategory10;
  }

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
    .tooltipTexts(['Name'])
    .radius(5)
    .colorScheme(colorScheme);

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
      .defaultOption(1)
  );

  window.addEventListener('themeChange', function(event) {
    if (event.detail.lightMode) {
      colorScheme = d3.schemePastel1;
    } else {
      colorScheme = d3.schemeCategory10;
    }
    updateChart();
  });
  
  function updateChart() {
    const plot = ScatterPlot()
    .width(width)
    .height(height)
    .data(data)
    .xValue(xValue)
    .yValue(yValue)
    .margin(margin)
    .tooltipTexts(['Name'])
    .radius(5)
    .colorScheme(colorScheme);
  
    svg.selectAll('*').remove();

  // Dibuja la gráfica actualizada
  svg.call(plot);

  // Actualiza los estilos de la gráfica
  svg.selectAll('circle')
    .style('fill', function(d, i) {
      return colorScheme[i % colorScheme.length];
    });
  }
};

main();

}
