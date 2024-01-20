import { generateScatterPlot } from './scatterplot/index';
import { generateMap } from './map';

// Definir las funciones que se ejecutarán para cada ruta
const routes = {
    '/': generateScatterPlot,
    '/map': generateMap,
};

// Escuchar el evento hashchange en la ventana
window.onhashchange = function() {
    const path = window.location.hash.substring(1); // Elimina el '#' del inicio
    if (routes[path]) {
        routes[path]();
    } else {
        console.log('Ruta no encontrada');
    }
};

// Ejecutar la ruta inicial
if (window.location.hash) {
    const path = window.location.hash.substring(1);
    if (routes[path]) {
        routes[path]();
    }
} else {
    routes['/']();
}