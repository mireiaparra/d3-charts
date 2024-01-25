import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
const { csv, json } = d3;
import { menuMap } from "./menu.js";
import { MapGraphic } from "./map.js";

const width = window.innerWidth;
const height = window.innerHeight * 0.7;

const csvUrl = "/map/trials.csv";
const myData = new Map();
let coods1500 = [];

export function generateMap() {
  d3.select(".menu-container").remove();
  d3.select(".graphic-container").remove();

  const menuContainer = d3
    .select("body")
    .append("div")
    .attr("class", "menu-container");

  const radioMenu = menuContainer.append("div");
  const selectMenu = menuContainer.append("div");

  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("class", "graphic-container")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("style", "max-width: 100%; height: auto;");

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
      let trialsDetails = dataCentury.reduce(
        (acc, curr) => {
          acc.totalDeaths += +curr.deaths;
          acc.totalTried += +curr.tried;
          acc.details.push({
            lon: +curr.lon,
            lat: +curr.lat,
            deaths: +curr.deaths,
            tried: +curr.tried,
          });
          return acc;
        },
        { totalDeaths: 0, totalTried: 0, details: [] }
      );

      dataCenturies[century] = trialsDetails;
    });

    let allCoordinates = dataCenturies[defaultCentury].details.map((d) => ({
      lon: +d.lon,
      lat: +d.lat,
    }));

    const color = d3
      .scaleSequential(
        d3.extent(Array.from(myData.values())),
        d3.interpolateBlues
      )
      .nice();

    const europe = await json("map/europe.topojson");

    const plot = MapGraphic()
      .translation([300, 900])
      .scale(600)
      .dataMap(europe)
      .dataMapDetails(europe.objects.europe)
      .dataMarks(allCoordinates)
      .radius(5);

    svg.call(plot);

    const updateData = ({ century = defaultCentury, type = defaultType }) => {
      let allCoordinates = dataCenturies[century].details
        .filter((d) => !isNaN(Number(d[type])))
        .map((d) => ({
          lon: +d.lon,
          lat: +d.lat,
        }));

      svg.call(plot.dataMarks(allCoordinates));
    };

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

    // Append tooltips.
    //     const format = d3.format(".1%");
    //     country.append("title").text(
    //       (d) => `${d.properties.name}
    // ${format(data.get(d.id)[0])} in 2008
    // ${format(data.get(d.id)[1])} in 2018`
    //     );

    // return Object.assign(svg.node(), {
    //   update(year) {
    //     country
    //       .transition()
    //       .duration(750)
    //       .attr("fill", (d) => color(data.get(d.id)[year]))
    //       .attr("transform", (d) => transform(d, year));
    //   },
    //   scales: { color },
    // });
  };
  main();
}
