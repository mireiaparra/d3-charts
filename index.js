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

// Función para actualizar la clase 'active'
function updateActiveClass() {
    // Obtén todos los enlaces del menú
    const menuItems = document.querySelectorAll('.menuItems a');

    // Recorre todos los enlaces
    menuItems.forEach((item) => {
        // Comprueba si el href del enlace coincide con la ruta actual
        if (item.getAttribute('href') === window.location.hash) {
            // Si coincide, añade la clase 'active'
            item.classList.add('active');
        } else {
            // Si no coincide, asegúrate de que la clase 'active' no está presente
            item.classList.remove('active');
        }
    });
}

// Llama a la función cuando se carga la página
updateActiveClass();

// Llama a la función cuando cambia la URL
window.addEventListener('hashchange', updateActiveClass);