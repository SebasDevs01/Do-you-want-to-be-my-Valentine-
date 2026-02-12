/**
 * Script principal que inicializa la animación
 */

// Arreglo para almacenar los controladores de cada pétalo
const petals = [];

/**
 * Crea y coloca todos los pétalos en sus posiciones iniciales
 */
// Constantes para la rosa estática
const ROSE_CENTER_X = 50; // %
const ROSE_CENTER_Y = 78; // % (Bajado aún más para cerrar la brecha con el tallo)

/**
 * Crea la rosa estática que se queda en el tallo
 */
function createStaticRose() {
    const container = document.getElementById('rose-petals-container');
    if (!container) return;

    // Limpiar contenedor
    container.innerHTML = '';

    // Reconstruimos la cabeza de la rosa con los pétalos
    for (let i = PETAL_DATA.length - 1; i >= 0; i--) {
        const petalData = PETAL_DATA[i];
        const petal = document.createElement("div");
        petal.classList.add("petal", "static-petal"); // Clase extra para diferenciarlos

        const scale = 0.25;
        const relativeScale = 0.25;

        // Calculamos posición estática
        const widthPx = petalData.width * scale;
        const heightPx = petalData.height * scale;

        const topPos = `calc(${ROSE_CENTER_Y}% - ${heightPx * 0.9}px + ${(petalData.y_relative * relativeScale) + POSITION_BASE.y}px)`;
        const leftPos = `calc(${ROSE_CENTER_X}% - ${widthPx / 2}px + ${(petalData.x_relative * relativeScale) + POSITION_BASE.x}px)`;

        petal.setAttribute("style", `
            top: ${topPos}; 
            left: ${leftPos}; 
            width: ${widthPx}px; 
            height: ${heightPx}px;
            transform-origin: center bottom;
            z-index: ${100 - i};
        `);

        const img = document.createElement("img");
        img.src = petalData.path;
        img.alt = `Pétalo ${i + 1}`;

        img.style.filter = `
            brightness(1.1)
            contrast(1.1)
            saturate(1.3)
            drop-shadow(0 0 5px rgba(255,100,150,0.4))
        `;

        petal.appendChild(img);
        container.appendChild(petal);

        // NO agregamos física a estos pétalos. Son estáticos.
    }

    // Iniciar lluvia infinita
    startInfinitePetals();
}

function startInfinitePetals() {
    // Crear un pétalo cayendo cada cierto tiempo
    setInterval(spawnFallingPetal, 15000); // Cada 15 segundos (muy lento)

    // Cleanup de array de físicas para no llenar la memoria
    setInterval(() => {
        petals = petals.filter(p => p.physics.active);
    }, 5000);
}

function spawnFallingPetal() {
    const container = document.getElementById('rose-petals-container');
    if (!container) return;

    // Elegir un pétalo aleatorio
    const i = Math.floor(Math.random() * PETAL_DATA.length);
    const petalData = PETAL_DATA[i];

    const petal = document.createElement("div");
    petal.classList.add("petal", "falling-petal");

    const scale = 0.25;
    const widthPx = petalData.width * scale;
    const heightPx = petalData.height * scale;

    // Posición inicial: El centro de la rosa
    // Variación aleatoria pequeña para que no salgan todos idénticos
    const randX = (Math.random() - 0.5) * 10;
    const randY = (Math.random() - 0.5) * 10;

    const topPos = `calc(${ROSE_CENTER_Y}% - ${heightPx}px + ${randY}px)`;
    const leftPos = `calc(${ROSE_CENTER_X}% - ${widthPx / 2}px + ${randX}px)`;

    petal.setAttribute("style", `
        top: ${topPos}; 
        left: ${leftPos}; 
        width: ${widthPx}px; 
        height: ${heightPx}px;
        opacity: 0;
        transition: opacity 1s;
        z-index: 101; /* Por encima de la rosa estática al nacer */
    `);

    const img = document.createElement("img");
    img.src = petalData.path;

    img.style.filter = `
        brightness(1.2)
        contrast(1.1)
        saturate(1.2)
    `;

    petal.appendChild(img);
    container.appendChild(petal);

    // Calcular coordenadas relativas para la física
    const containerRect = container.getBoundingClientRect();
    // Aproximación segura para no depender del DOM rendering inmediato
    // Usamos las coordenadas lógicas basadas en el tamaño del contenedor (200x350)
    // CenterX es 100px. CenterY es 350 * (ROSE_CENTER_Y/100)
    const factorY = ROSE_CENTER_Y / 100;
    const startX = 100 + randX - (widthPx / 2); // approximate offset (container width 200)
    const startY = (350 * factorY) - heightPx + randY;

    // Crear física
    const physics = new PetalPhysics(petal, startX, startY, i);
    physics.start();

    petals.push({
        element: petal,
        physics: physics,
        index: i
    });
}

/**
 * Inicia la secuencia de caída de los pétalos
 */
function startFallingSequence() {
    let currentIndex = 0;

    function triggerNextPetal() {
        if (currentIndex < petals.length) {
            // Buscar el pétalo con el índice correcto (1-8)
            const petalToFall = petals.find(p => p.index === currentIndex + 1);
            if (petalToFall) {
                petalToFall.physics.start();
            }

            currentIndex++;

            // Programar la caída del siguiente pétalo
            if (currentIndex < petals.length) {
                setTimeout(triggerNextPetal, TIEMPO_ENTRE_PETALOS);
            }
        }
    }

    // Iniciar la secuencia
    triggerNextPetal();
}

/**
 * Inicializa la aplicación
 */
function init() {
    // Crear la rosa estática e iniciar lluvia
    createStaticRose();

    // Mejorar el cristal
    enhanceGlass();

    // Iniciar la secuencia después de un breve retraso
    setTimeout(startFallingSequence, 1000);
}

// Cuando el documento esté listo, inicializar la aplicación
document.addEventListener('DOMContentLoaded', init);