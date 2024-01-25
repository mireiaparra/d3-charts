import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export const menuMap = () => {
  let id;
  let labelText;
  let options;
  const listeners = d3.dispatch("change");
  let menuType;

  const my = (selection) => {
    if (menuType === "select") {
      selection
        .selectAll("label")
        .data([null])
        .join("label")
        .attr("for", id)
        .text(labelText);
      selection
        .selectAll("select")
        .data([null])
        .join("select")
        .attr("id", id)
        .on("change", (event) => {
          listeners.call("change", null, event.target.value);
        })
        .selectAll("option")
        .data(options)
        .join("option")
        .attr("value", (d) => d.value)
        .text((d) => d.text);
    } else if (menuType === "radio") {
      let radioDivs = selection
        .selectAll("div.radio")
        .data(options)
        .join("div")
        .attr("class", "radio")
        .attr("id", (d) => `${id}-${d.value}`);

      radioDivs
        .append("label")
        .attr("for", (d) => d.value)
        .text((d) => d.value);

      radioDivs
        .append("input")
        .attr("type", "radio")
        .attr("id", (d) => d.value)
        .attr("name", id)
        .attr("value", (d) => d.value)
        .on("change", (event) => {
          listeners.call("change", null, event.target.value);
        });
    }
  };
  my.id = function (_) {
    return arguments.length ? ((id = _), my) : id;
  };

  my.labelText = function (_) {
    return arguments.length ? ((labelText = _), my) : labelText;
  };

  my.options = function (_) {
    return arguments.length ? ((options = _), my) : options;
  };

  my.on = function () {
    let value = listeners.on.apply(listeners, arguments);
    return value === listeners ? my : value;
  };

  my.menuType = function (_) {
    return arguments.length ? ((menuType = _), my) : menuType;
  };

  return my;
};
