/**
 * Configuración global para la animación de los pétalos
 */

// Tiempo entre caída de pétalos (en milisegundos)
const TIEMPO_ENTRE_PETALOS = 5000;

// Posición de la luz (corresponde con el CSS)
const LIGHT_POSITION = {
    x: 50, // Mitad de 100px
    y: 50
};

// Definir límites del cilindro para mantener pétalos dentro
const CYLINDER = {
    centerX: 50, // Mitad de la anchura del contenedor (100px)
    centerY: 85, // Mitad de la altura
    radius: 40, // Radio del cilindro en píxeles (reducido para caber)
    bottom: 160 // Suelo del cilindro (altura del contenedor aprox 170px)
};

// Datos de los pétalos con sus propiedades
const PETAL_DATA = [
    { path: "1.svg", x_relative: -35, y_relative: -140, width: 95, height: 100 },
    { path: "2.svg", x_relative: 20, y_relative: -125, width: 110, height: 130 }, // Ajustado de 40 a 20
    { path: "3.svg", x_relative: -30, y_relative: -132, width: 110, height: 155 },
    { path: "4.svg", x_relative: 20, y_relative: -115, width: 89, height: 110 }, // Levantado de -81 a -115 para que no parezca caído
    { path: "5.svg", x_relative: 0, y_relative: -140, width: 85, height: 120 },
    { path: "6.svg", x_relative: 15, y_relative: -140, width: 102, height: 140 },
    { path: "7.svg", x_relative: 15, y_relative: -160, width: 110, height: 170 },
    { path: "8.svg", x_relative: 0, y_relative: -130, width: 132, height: 150 }
];

// Posición base para todos los pétalos
// Posición base para todos los pétalos
const POSITION_BASE = {
    x: 0,
    y: 0
};