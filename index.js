// Diccionario de constantes para fijar los códigos asociados a las teclas de flechas de dirección del teclado que operarán sobre el manejo del Jugador.
const ARROW_CODES =
{
    37: 'left',
    38: 'up',
    39: 'right'    
}
// Objeto 'arrows' que albergará la pareja clave-valor con la tecla detectada en la función de manejo de eventos 'trackKeys' y si se ha pulsado o soltado.
let arrows = trackKeys (ARROW_CODES);

/*
    Función 'trackKeys' que detectará las pulsaciones de las teclas que operaran sobre el manejo del Jugador.
    Recibe el diccionario de constantes con los códigos asociados a la teclas.
    Devuelve el par clave-valor de la tecla pulsada.
*/
function trackKeys (keyCodes)
{
    // Define vacío un diccionario para poder contener el par clave-valor de la tecla que detecte que se ha pulsado.
    let pressedKeys = {};

    /*
        Función 'handler' para realizar el manejo de los eventos que se atienden en el DOM.
        Recibe el evento detectado. 
    */
    function handler (event)
    {
        // Comprueba si el diccionario de constantes contiene la tecla que se ha detectado en el evento (se habrá pulsado o soltado).
        if (keyCodes.hasOwnProperty (event.keyCode))
        {
            // Si se ha detectado alguna de las teclas que interesan la variable 'downPressed' se carga con 'true' (si se ha pulsado), si no con 'false' (si se ha soltado). 
            let downPressed;

            if (event.type === 'keydown') downPressed = true;
            else downPressed = false;
            
            /*
                Se carga en el diccionario 'pressedKeys' la pareja clave-valor, en la que la clave es el valor del diccionario de constantes de la tecla detectada en el evento.
                y el valor 'true' o 'false' dependiendo de si la tecla detectada se ha pulsado o se ha soltado.
            */
            pressedKeys[keyCodes[event.keyCode]] = downPressed;

            /*
                Una vez detectado el evento lo cancela (sin detener las consecuencias que haya generado) para poder escuchar los siguientes.
                Para ello utiliza el método 'event.preventDefault' [https://developer.mozilla.org/es/docs/Web/API/Event/preventDefault] de los eventos del DOM.
            */
            event.preventDefault ();
        }
    }

    // Añade a la función las escuchas de eventos de teclas pulsadas o soltadas.
    addEventListener ('keydown', handler);
    addEventListener ('keyup', handler);

    return (pressedKeys);
}

/*
    Función 'runAnimation' encargada de ir ejecutando los frames de animación de los objetos dinámicos del juego.
*/
function runAnimation (frameFunction)
{
    let lastTime = null;

    /*
        Función 'frame' encargada de calcular el salto de animación para el repintado de los frames de animación de los objetos dinámicos del juego.
        Recibe un tiempo (que será el que transcurra entre eventos detectados).
    */
    function frame (time)
    {
        let stop = false;

        /*
            Si no se pulsan teclas 'lastTime' valdrá 'null' y no se repintará nada.
            Cuando se detecten eventos habrá que realizar repintados para traducir dichos eventos en animaciónes del juego.
            Los repintados para poder conseguir el efecto de animación serán muchos por segundo, por tanto se irá dividiendo el tiempo en tramos (saltos de animación) para realizar en cada uno un repintado.
            Se determina el valor mínimo comparando una decima de segundo y la diferencia entre el tiempo recibido y la ultima vez que se repintó.
            El valor mínimo obtenido se pasa a milisegundos y ese será el salto de animación.
            Si el nivel ha terminado, la 'frameFunction' (que es la función anónima definida en la invocación de 'runAnimation') habrá retornado el valor 'false' en vexz de un tiempo.
            Si el nivel ha terminaod se activa la variable 'stop' para parar los repintados.
            Si el nivel sigue activo se invoca el método 'requestAnimationFrame' de la Ventana para pedir un nuevo repintado.
        */
        if (lastTime !== null)
        {
            let timeStep = Math.min (time - lastTime, 100) / 1000;
            
            if (frameFunction (timeStep) === false) stop = true;
            else stop = false;
        }

        lastTime = time;

        if (!stop) requestAnimationFrame (frame);
    }

    // Inicia los repintados con el método 'requestAnimationFrame' [https://developer.mozilla.org/es/docs/Web/API/Window/requestAnimationFrame] de la Ventana del DOM.
    requestAnimationFrame (frame);
}

/*
    función 'runLevel' encargada de ejecutar los niveles del juego.
    Recibe el Nivel, el constructor para generar la ventana en el DOM y una función 'callback' para poder reinvocar la función 'runLevel' en cada frame de repintado.
*/
function runLevel (level, Display, callback)
{
    // Genera la Ventana del juego en el DOM, pasándole como parámetros el 'body' HTML (que será de donde se cuelgue) y el Nivel a ejecutar.
    let display = new Display (document.body, level);

    // Invoca la función 'runAnimation' que se encargará de ir ejecutando los frames de animación de los objetos dinámicos del juego, pasándole una función anónima que recibe y devuelve el tiempo entre eventos.
    runAnimation (function (step)
                  {
                      // Invoca el método 'animate' del Nivel pasándole el salto de animación y la tecla detectada como pulsada en el manejo de eventos.
                      level.animate (step, arrows);

                      // Invoca el método 'drawFrame' de la Ventana para pintar los elementos dinámicos del juego, una vez calculada y determinada su animación.
                      display.drawFrame ();

                      /*
                          Comprueba si el esatado del juego ha cambiado (si se ha ganado o perdido) incocando el método 'isFinished' del Nivel.
                          Si el estado del juego ha cambiado, borra la Ventana y si hay una función 'callback' la ejecuta para actuar en consecuencia con el cambio de estado del juego.
                      */
                      if (level.isFinished ())
                      {
                          display.clear ();

                          if (callback) callback (level.status);

                          return (false);
                      }
                  });
}
/*
    Función 'runGame' que se encarga de iniciar el videojuego.
    Recibe el array de niveles del juego y el constructor para generar la ventana en el DOM.
*/
function runGame (levels, Display)
{
    /*
        Función 'startLevel' encargada de iniciar los niveles del juego.
        Recibe el número de orden del elemento del array de niveles del juego que debe iniciar.
        Es una función recursiva, que se llama a si misma cuando el estado del juego cambia en el nivel que se esté jugando.
    */
    function startLevel (levelNumber)
    {
        /*
            Genera el Nivel a iniciar invocando la clase 'Level' a la que envía el array de elementos del nivel a iniciar.
            Captura el posible error, que la clase 'Level' puede devolver tras ejecutar su metodo de validación del array de elementos del nivel a iniciar, y si sucede lanza un mensaje de alerta.
        */
        let levelObject;

        try
        {
            levelObject = new Level (levels[levelNumber]);
        }
        catch (error)
        {
            return (alert (error.message));
        }

        /*
            Invoca la Función 'runLevel' para ejecutar el nivel y actuar si el estado del juego cambia durante su ejecución.
            Envía como parámetros el Nivel, el constructor para generar la ventana en el DOM y la función flecha que necesita para poder realizar el 'callback' recursivo si el estado del juego ha cambiado.
        */
        runLevel (levelObject, Display, status =>
                                        {
                                            /*
                                                Si durante la ejecución del nivel el estado del juego ha cambiado a 'lost' (ha perdido) se reinicia el mismo nivel.
                                                Si durante la ejecución del nivel el estado del juego ha cambiado, pero no a 'lost' (se habrá superado el nivel), si quedan niveles por jugar se inicia el siguiente
                                                y si no quedan se lanza un mensaje de alerta para indicar la victoria final. 
                                            */
                                            if (status === 'lost') startLevel (levelNumber);
                                            else if (levelNumber < levels.length - 1) startLevel (levelNumber + 1);
                                                 else alert ('Has Ganado el Juego');
                                        });
    }

    // Se inicia el primer nivel del juego.
    startLevel (0);
}

/*
    Esta es la invocación que pone en marcha el videojuego.
    Se llama a la función 'runGame' pasándole el array de niveles del juego y el constructor para generar la ventana en el DOM.
*/
runGame (GAME_LEVELS, DOMDisplay);