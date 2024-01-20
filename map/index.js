import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import { countriesCodes } from "./countriesCodes";

const { csv, json } = d3;

const width = 960;
const height = 500;

const csvUrl = "/map/trials.csv";

export function generateMap() {
  const main = async () => {
    const data = await csv(csvUrl);

    const myData = new Map();

    data.forEach((d) => {
      const country = d["gadm.adm0"];

      // filtrar para encontrar los datos de cada país
      let data1500 = data.filter(
        (d) => d["gadm.adm0"] === country && d.century === "1500"
      );
      // filtrar los datos para obtener los que tengan un valor numérico en deaths
      const deaths1500 = data1500.reduce((acc, curr) => {
        if (curr.deaths !== "NA") {
          return acc + +curr.deaths;
        } else {
          return acc;
        }
      }, 0);

      let data1600 = data.filter(
        (d) => d["gadm.adm0"] === country && d.century === "1600"
      );
      const deaths1600 = data1600.reduce((acc, curr) => {
        if (curr.deaths !== "NA") {
          return acc + +curr.deaths;
        } else {
          return acc;
        }
      }, 0);

      let id = countriesCodes[country];

      const obj = {
        id: id,
        deaths1500: deaths1500,
        deaths1600: deaths1600,
      };
      myData.set(country, obj);
    });

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
    // .attr("width", width)
    // .attr("height", height)
    // .attr("class", "scatterplot-container");
    const europe = await json("map/europe.topojson");

let projection = d3.geoMercator()
      .translate([300, 750])
      .scale(450);

    const path = d3.geoPath()
      .projection(projection);


    svg
      .append("path")
      .datum(topojson.mesh(europe, europe.objects.europe))
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("d", path)


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
