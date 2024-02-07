import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export const menu = () => {
  let id;
  let labelText;
  let options;
  const listeners = d3.dispatch('change');
  let defaultOption = 0;

  const my = (selection) => {
    selection
      .selectAll('label')
      .data([null])
      .join('label')
      .attr('for', id)
      .text(labelText);

    selection
      .selectAll('select')
      .data([null])
      .join('select')
      .attr('id', id)
      .on('change', (event) => {
        listeners.call('change', null, event.target.value);
      })
      .selectAll('option')
      .data(options)
      .join('option')
      .attr('value', (d) => d.value)
      .text((d) => d.text)
      .property('selected', (d, i) => i === defaultOption); 
  };

  my.id = function (_) {
    return arguments.length ? ((id = _), my) : id;
  };

  my.labelText = function (_) {
    return arguments.length
      ? ((labelText = _), my)
      : labelText;
  };

  my.options = function (_) {
    return arguments.length ? ((options = _), my) : options;
  };

  my.on = function () {
    let value = listeners.on.apply(listeners, arguments);
    return value === listeners ? my : value;
  };

  my.defaultOption = function (_) {
    return arguments.length ? ((defaultOption = _), my) : defaultOption;
  }

  return my;
};
