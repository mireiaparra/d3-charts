 const ScatterPlot = () => { 
    let width;
    let height;
    let data;
    let xValue;
    let yValue;
    let margin;
    let radius;

    const my = () => {};
    
    my.width = function (param) {
        return arguments.length ? (width = +param, my) : width;
    }

    my.height = function (param) {
        return arguments.length ? (height = +param, my) : height;
    }

    my.data = function (param) {
        return arguments.length ? (data = param, my) : data;
    }

    my.xValue = function (param) {
        console.log("param", param);
        return arguments.length ? (xValue = param, my) : xValue;
    }

    my.yValue = function (param) {
        return arguments.length ? (yValue = param, my) : yValue;
    }

    my.margin = function (param) {
        return arguments.length ? (margin = param, my) : margin;
    }

    my.radius = function (param) {
        return arguments.length ? (radius = param, my) : radius;
    }
    return my;

}

export { ScatterPlot };
    