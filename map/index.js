import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import "./style.css";
const { csv, json } = d3;
import { menuMap } from "./menu.js";
import { MapGraphic } from "./map.js";

const width = window.innerWidth;
const height = window.innerHeight * 0.7;

const csvUrl = "/map/trials.csv";
const myData = new Map();

let currentZoom = 1;
let updateFunction = () => {};

export function generateMap() {
  d3.select(".menu-container").remove();
  d3.select(".graphic-container").remove();

  const menuContainer = d3
    .select("body")
    .append("div")
    .attr("class", "menu-container");

  const radioMenu = menuContainer.append("div");
  const selectMenu = menuContainer.append("div");

  const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);

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
  d3.select("#chart")
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
          acc.totalDeaths += +curr.deaths;
          acc.totalTried += +curr.tried;
          acc.details.push({
            lon: +curr.lon,
            lat: +curr.lat,
            deaths: +curr.deaths,
            tried: +curr.tried,
            city: curr.city,
          });
          return acc;
        },
        { totalDeaths: 0, totalTried: 0, details: [] }
      );

    });

    let allCoordinates = dataCenturies[defaultCentury].details
    .filter((d) => !isNaN(Number(d['deaths'])) && d['deaths'] !== 0)

    const color = d3
      .scaleSequential(
        d3.extent(Array.from(myData.values())),
        d3.interpolateBlues
      )
      .nice();

    const europe = await json("map/europe.topojson");

    const plot = MapGraphic()
      .translation([400, 1100])
      .scale(700)
      .dataMap(europe)
      .dataMapDetails(europe.objects.europe)
      .dataMarks(allCoordinates)
      .radius(5)
      .tooltipText('city');
      svg.call(plot);

    const updateData = ({ century = defaultCentury, type = defaultType }) => {
      let allCoordinates = dataCenturies[century].details
        .filter((d) => !isNaN(Number(d[type])) && d[type] !== 0)
      svg.call(plot.radius(5/currentZoom).dataMarks(allCoordinates));
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
