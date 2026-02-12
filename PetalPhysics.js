/**
 * Clase para simular la física de la caída de un pétalo
 */
class PetalPhysics {
    /**
     * Constructor del sistema de física para un pétalo
     * @param {HTMLElement} element - Elemento DOM del pétalo
     * @param {number} initialX - Posición X inicial en píxeles
     * @param {number} initialY - Posición Y inicial en píxeles
     * @param {number} zIndex - Índice Z para escalonar los pétalos
     */
    constructor(element, initialX, initialY, zIndex) {
        // Elementos DOM
        this.element = element;
        this.imgElement = element.querySelector('img');

        // Posición y rotación
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.initialX = initialX;
        this.initialY = initialY;
        this.scale = 1;

        // Inicializar posición Z aleatoria para escalonar los pétalos
        this.z = zIndex * 6;

        // Velocidad
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.vRotation = 0;
        this.vRotationX = 0;
        this.vRotationY = 0;

        // Fases para movimiento más natural
        this.phaseX = Math.random() * Math.PI * 2;
        this.phaseY = Math.random() * Math.PI * 2;
        this.phaseZ = Math.random() * Math.PI * 2;

        // Aceleración
        this.gravity = (0.005 + Math.random() * 0.01) * 0.25; // Gravedad suave (ajustado para no ser tan lento)
        this.windForce = 0;
        this.drag = 0.98; // Mucha resistencia al aire
        this.rotationDrag = 0.98;

        // Límites de caída
        this.maxFall = 1000; // Seguridad para que no desaparezcan prematuramente

        // Para el efecto de oscilación/flotación
        this.time = Math.random() * 1000;
        this.amplitude = 0.05 + Math.random() * 0.05;

        // Frecuencias diferentes para rotaciones distintas
        this.freqRotX = 0.3 + Math.random() * 0.7;  // 0.3-1.0
        this.freqRotY = 0.2 + Math.random() * 0.5;  // 0.2-0.7
        this.freqRotZ = 0.4 + Math.random() * 0.8;  // 0.4-1.2

        // Amplitudes de rotación
        this.ampRotX = 0.1 + Math.random() * 0.3;  // 0.1-0.4
        this.ampRotY = 0.1 + Math.random() * 0.2;  // 0.1-0.3
        this.ampRotZ = 0.2 + Math.random() * 0.4;  // 0.2-0.6

        // Estado
        this.active = false;
        this.onGround = false;
        this.groundTime = 0;

        // Rotación objetivo cuando se asiente en el suelo
        this.targetGroundRotX = 90; // Casi horizontal
        this.targetGroundRotY = 0;
        this.targetGroundRotZ = 0;

        // Aplicar iluminación inicial basada en la profundidad
        this.updateLighting();
    }

    /**
     * Inicia la animación del pétalo
     */
    start() {
        this.active = true;
        this.element.style.opacity = '1';
        this.animate();
    }

    /**
     * Actualiza los efectos visuales basados en la profundidad
     */
    updateLighting() {
        // Ajustamos el brillo según la profundidad (valor z)
        // En lugar de usar sombras, ajustamos la opacidad y luminosidad

        // Normalizamos el valor z a un rango útil para la visualización
        // Z negativo = más cerca = más brillante
        const zDepth = Math.max(-50, Math.min(10, this.z));
        const normalizedDepth = (zDepth + 50) / 100; // 0 a 1, donde 0 es más cercano

        // Ajustar brillo según profundidad
        const brightness = 1.4 - (normalizedDepth * 0.4); // 1.0 a 1.4

        // Aplicar efectos basados en profundidad
        this.imgElement.style.filter = `
            brightness(${brightness})
            contrast(2.5)
            saturate(1.1)
        `;

        // Ajustar opacidad ligeramente basada en profundidad
        this.imgElement.style.opacity = 1 - (normalizedDepth * 0.2); // 0.8 a 1
    }

    /**
     * Actualiza la física del pétalo en cada frame
     */
    updatePhysics() {
        if (!this.active) return;

        // Incrementar el tiempo
        this.time += 0.01;

        if (!this.onGround) {
            // Simular el viento lateral que cambia con el tiempo
            // Usar seno y coseno con diferentes frecuencias para movimiento más natural
            const windX = Math.sin(this.time * 0.7 + this.phaseX) * this.amplitude;
            const windZ = Math.cos(this.time * 0.9 + this.phaseZ) * this.amplitude;

            // Actualizar velocidades
            this.vx += 0;
            this.vy += this.gravity;
            this.vz += 0;

            // Efecto de zigzag - alternar dirección lateral durante caída
            this.vx += Math.sin(this.time * 2) * 0.001;
            this.vz += Math.cos(this.time * 1.7) * 0.0001;

            // Efecto de resistencia del aire
            this.vx *= this.drag;
            this.vy *= this.drag;
            this.vz *= this.drag;

            // Actualizar velocidades de rotación con oscilaciones complejas
            // Esto produce un efecto de "tumbling" (caída dando vueltas) más natural
            this.vRotationX = Math.sin(this.time * this.freqRotX) * this.ampRotX;
            this.vRotationY = Math.sin(this.time * this.freqRotY) * this.ampRotY;
            this.vRotationZ = Math.sin(this.time * this.freqRotZ) * this.ampRotZ;

            // Agregar influencia del viento a las rotaciones
            this.vRotationX += windX * 1;
            this.vRotationZ += windZ * 1;

            // Actualizar posición y rotación
            this.x += this.vx;
            this.y += this.vy;
            this.z += this.vz;
            this.rotationX += this.vRotationX;
            this.rotationY += this.vRotationY;
            this.rotation += this.vRotationZ;

            // LÍMITES DEL CILINDRO (Hardcoded para el contenedor de 200px)
            const centerX = 100;
            const radius = 75; // Reducido para evitar que salgan de la cúpula visual

            const dx = this.initialX + this.x - centerX;
            const dz = this.z;
            const distanceFromCenter = Math.sqrt(dx * dx + dz * dz);

            if (distanceFromCenter > radius) {
                // Simple bounce off walls
                if (this.x < 0) this.vx += 0.05;
                if (this.x > 220) this.vx -= 0.05;
            }

            // Suelo (Bottom of container is 350px)
            // Subimos esto para asegurar que se vean bien y no queden cortados por el border-radius
            const groundLevel = 290;

            if (this.y > groundLevel) {
                this.onGround = true;
                this.y = groundLevel;
                // Detener movimiento vertical
                this.vy = -this.vy * 0.1; // Pequeño rebote

                // Reducir movimiento horizontal
                this.vx *= 0.4;
                this.vz *= 0.4;
            }
        } else {
            // Comportamiento en el suelo
            this.groundTime += 0.001;
            const settleProgress = Math.min(1, this.groundTime);

            // Asentar gradualmente
            // Interpolar hacia la rotación objetivo (plana)
            this.rotationX = (1 - settleProgress) * this.rotationX + settleProgress * this.targetGroundRotX;
            this.rotationY = (1 - settleProgress) * this.rotationY + settleProgress * this.targetGroundRotY;
            this.rotation = (1 - settleProgress) * this.rotation + settleProgress * this.targetGroundRotZ;

            // Frenar gradualmente
            this.vx *= 0.7;
            this.vz *= 0.7;
            this.x += this.vx * (1 - settleProgress);
            this.z += this.vz * (1 - settleProgress);

            // Pequeño movimiento ondulante incluso cuando está asentado
            if (settleProgress >= 1) {
                // Micro-movimientos sutiles
                const microTime = this.time * 0.2;
                this.x += Math.sin(microTime) * 0.05;
                this.z += Math.cos(microTime * 1.3) * 0.05;
                this.rotationY += Math.sin(microTime * 0.7) * 0.1;
            }

            // FADING LOGIC
            // Solo empezar a desvanecer después de que haya pasado un tiempo en el suelo
            // Aumentado a 5 segundos para permitir que se acumulen "montoncitos"

            if (!this.fading) {
                this.groundDuration = (this.groundDuration || 0) + 0.016; // Aprox 1/60 seg
                if (this.groundDuration > 10.0) { // Esperar 10 segundos para ver la acumulación
                    this.fading = true;
                    this.fadeTime = 0;
                }
            } else {
                this.fadeTime += 0.02; // Desvanecer un poco más rápido
                const opacity = 1 - this.fadeTime;
                this.element.style.opacity = opacity;

                if (opacity <= 0) {
                    this.destroy();
                    return;
                }
            }
        }

        // Actualizar efectos visuales basados en el movimiento
        this.updateLighting();

        // Aplicar transformaciones 3D
        this.element.style.transform = `
            translate3d(${this.x}px, ${this.y}px, ${this.z}px)
            rotateX(${this.rotationX}deg)
            rotateY(${this.rotationY}deg)
            rotateZ(${this.rotation}deg)
        `;
    }

    /**
     * Función de animación que se ejecuta en cada frame
     */
    animate() {
        if (!this.active) return;

        this.updatePhysics();
        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        this.active = false;
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        // Nota: Idealmente deberíamos eliminarlo del array global 'petals' también
        // pero por simplicidad dejaremos que el GC eventual lo maneje o el array crecerá lentamente.
        // Una mejora sería filtrar el array active.
    }
}