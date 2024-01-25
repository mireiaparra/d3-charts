import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import { countriesCodes } from "./countriesCodes";

const { csv, json } = d3;

const width = window.innerWidth;
const height = window.innerHeight * 0.7;

const csvUrl = "/map/trials.csv";
const myData = new Map();
let coods1500 = [];

export function generateMap() {
  const main = async () => {
    const data = await csv(csvUrl);
    const dataWithCoords = data.filter(
      (d) =>
        !isNaN(Number(d.deaths)) && +d.deaths !== 0 &&
        !isNaN(Number(d.lon)) &&
        !isNaN(Number(d.lat)) &&
        +d.lon >= -90 &&
        +d.lon <= 90 &&
        +d.lat >= -180 &&
        +d.lat <= 180
    );
    let data1500 = dataWithCoords.filter((d) => d.century === "1400");

    let deathsDetails1500 = data1500.reduce(
      (acc, curr) => {
          acc.totalDeaths += +curr.deaths;
          acc.details.push({
            lon: +curr.lon,
            lat: +curr.lat,
            deaths: +curr.deaths,
          });
        return acc;
      },
      { totalDeaths: 0, details: [] }
    );

    let data1600 = dataWithCoords.filter(
      (d) => d.century === "1600"
    );

    let deathsDetails1600 = data1600.reduce(
      (acc, curr) => {
          acc.totalDeaths += +curr.deaths;
          acc.details.push({
            lon: curr.lon,
            lat: curr.lat,
            deaths: curr.deaths,
          });
        return acc;
      },
      { totalDeaths: 0, details: [] }
    );


    const obj = {
      deaths1500: deathsDetails1500,
      deaths1600: deathsDetails1600,
    };

    let allCoordinates = deathsDetails1500.details.map((d) => ({
      lon: +d.lon,
      lat: +d.lat,
    }));
    // .concat(
    //   deathsDetails1600.details.map((d) => ({ lon: d.lon, lat: d.lat }))
    // );
    // myData.set(country, obj);
    coods1500 = allCoordinates;

    const color = d3
      .scaleSequential(
        d3.extent(Array.from(myData.values())),
        d3.interpolateBlues
      )
      .nice();

    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("style", "max-width: 100%; height: auto;");
    // .attr("class", "scatterplot-container");
    const europe = await json("map/europe.topojson");

    let projection = d3.geoMercator().translate([300, 900]).scale(600);

    const path = d3.geoPath().projection(projection);

    svg
      .append("path")
      .datum(topojson.mesh(europe, europe.objects.europe))
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("d", path);

    svg
      .append("g")
      .selectAll("circle")
      .data(coods1500)
      .enter()
      .append("circle")
      // .attr(
      //   "transform",
      //   ({ lon, lat }) => `translate(${projection([lon, lat]).join(",")})`
      // )
      .attr("cx", function (d) {
        return projection([d.lon, d.lat])[0];
      })
      .attr("cy", function (d) {
        return projection([d.lon, d.lat])[1];
      })
      .attr("r", 3)
      .style("fill", "red");

    // function transform(d) {
    //   console.log(myData.get(d.properties.NAME));
    //   const [x, y] = path.centroid(d);
    //   return `
    //   translate(${x},${y})
    //   scale(${Math.sqrt(myData.get(d.properties.NAME)["deaths1500"])})
    //     translate(${-x},${-y})
    //   `;
    // }

    // Append a path for each country
    // svg
    //   .append("g")
    //   .attr("stroke", "#000")
    //   .selectAll("path")
    //   .data(
    //     topojson
    //       .feature(europe, europe.objects.europe)
    //       .features.filter((d) =>
    //       myData.has(d.properties.NAME))
    //   )
    //   .join("path")
    //   // .attr("vector-effect", "non-scaling-stroke")
    //   .attr("d", d3.geoPath())
    //   // .attr("fill", (d) => color(myData.get(d.id)[0]))
    //   .attr("transform", (d) => transform(d, 0));

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
