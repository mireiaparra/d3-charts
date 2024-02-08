import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import "./style.css";
const { csv, json } = d3;
import { menuMap } from "./menu.js";
import { MapGraphic } from "./map.js";
import config from "../vite.config.js";

const width = window.innerWidth;
const height = window.innerHeight * 0.65;

const csvUrl = `${config.base}/trials.csv`;

let currentZoom = 1;
let updateFunction = () => {};

export function generateMap() {
  d3.select(".menu-container").remove();
  d3.select(".graphic-container").remove();
  d3.select(".chart-title").remove();

  const menuContainer = d3
    .select("body")
    .append("div")
    .attr("class", "menu-container");

  const radioMenu = menuContainer.append("div").attr("class", "radio-menu");
  const selectMenu = menuContainer.append("div").attr("class", "select-menu");

  const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);
  
  d3.select("#chart")
  .append("h2")
  .attr("class", "chart-title")
  .text("Trials for Witchcraft in Europe (1400-1900)");

  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("class", "graphic-container")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("style", "max-width: 100%; height: auto;")
    .call(zoom);

  const g = svg.append("g").attr("class", "container");

  function zoomed(event) {
    if (event.transform.k !== currentZoom) {
      currentZoom = event.transform.k ;
      updateFunction({});
    }
    const {transform} = event;
    g.attr("transform", transform);
  }
  
  svg.call(d3.drag().filter((e) => !e.button).on("drag", dragged));
  
  function dragged(event) {
    const currentTransform = d3.zoomTransform(svg.node());
    const newX = currentTransform.x + event.dx;
    const newY = currentTransform.y + event.dy;
    svg.call(zoom.transform, d3.zoomIdentity.translate(newX, newY).scale(currentTransform.k));
  }

  d3.select("button.reset-button").remove();
  d3.select(".menu-container")
  .append("button")
  .attr("class", "reset-button")
  .text("Reset position")
  .on("click", () => {
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
  });

  const main = async () => {
    const data = await csv(csvUrl);
    const dataWithCoords = data.filter(
      (d) =>
        ((!isNaN(Number(d.deaths)) && +d.deaths !== 0) ||
          (!isNaN(Number(d.tried)) && +d.tried !== 0)) &&
        !isNaN(Number(d.lon)) &&
        !isNaN(Number(d.lat)) &&
        +d.lon >= -90 &&
        +d.lon <= 90 &&
        +d.lat >= -180 &&
        +d.lat <= 180
    );
    let defaultCentury = "1400";
    let defaultType = "deaths";
    let centuriesToSearch = ["1400", "1500", "1600", "1700", "1800", "1900"];
    let dataCenturies = {};

    centuriesToSearch.forEach((century) => {
      let dataCentury = dataWithCoords.filter((d) => d.century === century);
      if (dataCentury.length === 0) {
        centuriesToSearch = centuriesToSearch.filter((c) => c !== century);
        return;
      }
      dataCenturies[century] = dataCentury.reduce(
        (acc, curr) => {
          acc.totalDeaths += + isNaN(curr.deaths) ? 0 : +curr.deaths;
          acc.totalTried += + isNaN(curr.tried) ? 0 : +curr.tried;

          const detailIndex = acc.details.findIndex(
            (d) => d.city === curr.city
          )

          if (detailIndex > -1) {
            const detail = acc.details[detailIndex];
            detail.deaths += + isNaN(curr.deaths) ? 0 : +curr.deaths;
            detail.tried += + isNaN(curr.tried) ? 0 : +curr.tried  ;
            acc.details[detailIndex] = detail;
          } else {
            acc.details.push({
              lon: +curr.lon,
              lat: +curr.lat,
              deaths: + isNaN(curr.deaths) ? 0 : +curr.deaths,
              tried: + isNaN(curr.tried) ? 0 : +curr.tried,
              city: curr.city,
            });
          }           
          return acc;
        },
        { totalDeaths: 0, totalTried: 0, details: [] }
      );

    });

    let allCoordinates = dataCenturies[defaultCentury].details
    .filter((d) => !isNaN(Number(d[defaultType])) && d[defaultType] !== 0)
    const europe = await json(`${config.base}/europe.topojson`);

    const plot = MapGraphic()
      .translation([window.innerWidth / 2 - 100, 960])
      .scale(530)
      .dataMap(europe)
      .dataMapDetails(europe.objects.europe)
      .dataMarks(allCoordinates)
      .radius(5)
      .tooltipTexts(['city', defaultType])
      .propertyColor(defaultType);
      svg.call(plot);
    const updateData = ({ century = defaultCentury, type = defaultType }) => {
      let allCoordinates = dataCenturies[century].details
        .filter((d) => !isNaN(Number(d[type])) && d[type] !== 0)
      svg.call(
        plot.radius(5/currentZoom)
        .dataMarks(allCoordinates)
        .propertyColor(type)
        .tooltipTexts(['city', type])
        );
    };

    updateFunction = updateData;

    radioMenu.call(
      menuMap()
        .id("century-menu")
        .labelText("Century")
        .menuType("radio")
        .options(centuriesToSearch.map((c) => ({ value: c, text: c })))
        .on("change", (value) => {
          defaultCentury = value;
          updateData({ century: value });
        })
    );

    selectMenu.call(
      menuMap()
        .id("color-menu")
        .labelText("Data")
        .menuType("select")
        .options([
          { value: "deaths", text: "Deaths" },
          { value: "tried", text: "Tried" },
        ])
        .on("change", (value) => {
          defaultType = value;
          updateData({ type: value });
        })
    );
  };
  main();
}
