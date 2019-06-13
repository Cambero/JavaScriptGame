// Diccionario de constantes con la relación de claves con los caracteres con los que se marcan los elementos dinámicos en el array de cadenas de carácteres representativo de cada nivel y su significado.
const ACTORS = 
{
    'o': Coin,
    '@': Player,
    '=': Lava,
    '|': Lava,
    'v': Lava
};

// Constante con el parámetro que indica el máximo avance de los elementos dinámicos del nivel del juego por pintado de frame.
const MAX_STEP = 0.05;

// Constante con la ruta del archivo de sonido que se ejecutará cuando el player recoja una moneda.
const gameAudio = new Audio ('./sounds/coin.wav');

/*
    Esta clase 'Level' generará el objeto Nivel con su mapeo y uso.
    Recibe el array de cadenas de caracteres representativo del nivel del juego.
    Dependiendo del método 'prototype' que se le invoque devolverá unos elementos u otros.
*/
function Level (plan) 
{
    /*
        Define sus propiedades de:
        · Ancho, como la longitud de cualquiera de los elementos del array de cadenas de caracteres representativo del nivel del juego.
        · Alto, como el número de elementos (filas) del array de cadenas de caracteres representativo del nivel del juego.
        · Estado del Juego, al principio 'null' y así estará hasta que se gane 'won' o se pierda 'lost'.
        · Retardo Final, por defecto a 'null'. Se le dará valor dependiendo del estado final (si se supera el nivel o de si el jugador muere intentándolo).
        · Rejilla, por defecto un array vacío, que se irá llenando con la traducción de los elementos estáticos del array de cadenas de caracteres representativo del nivel del juego.
        · Actores, por defecto un array vacío, que se irá llenando con los elementos dinámicos del nivel del juego.
    */
    this.width = plan[0].length;
    this.height = plan.length;
    this.status = null;
    this.finishDelay = null;
    this.grid = [];
    this.actors = [];

    // Lo primero que hace es invocar la función 'validateLevel' y si le devuelve un 'false' lanza una excepción con un mensaje de error que capturará quién invoque la función 'Level'.
    if (!validateLevel(plan))
    {
        throw new Error ('Se necesita, al menos, un jugador y una moneda en el nivel.');
    }

    // Realiza un doble bucle 'for' para recorrer el array de cadenas de caracteres representativo del nivel del juego por filas (height) y caracteres de cada fila (length).
    for (let y = 0 ; y < this.height ; y++)
    {
        /*
            Va cargando en la variable 'line' cada una de los elementos del array de cadenas de caracteres representativo del nivel del juego (filas).
            Define un array vacío 'gridLine' para ir albergando la traducción de cada elemento del array de cadenas de caracteres representativo del nivel del juego.
        */
        let line = plan[y];
        let gridLine = [];

        for (let x = 0 ; x < this.width ; x++)
        {
            /*
                Va cargando en la variable 'character' cada carácter leído de la fila que recorre.
                Define una variable 'characterType' por defecto a 'null' a la que dará valor evaluando el carácter leído.
                Define un alias 'Actor' sobre el que carga el valor de la clave del diccionario 'ACTORS' si el carácter leído está definido en dicho diccionario. 
            */
            let character = line[x];
            let characterType = null;
            let Actor = ACTORS[character];
            
            /*
                Si el alias 'Actor' no contiene 'undefined', entonces el caracter leído mapea un elemento dinámico del nivel.
                Si hemos encontrado un elemento dinámico del nivel, lo cargamos en el array de Actores como un nuevo objeto que se crea a partir de una instancia mediante el
                alias Actor ('Lava', 'Coin' o 'Player') enviando un 'Vector' de posición (que ubicará en su posición inicial el elemento) y el carácter que identifica su tipo de elemento.
            */
            if (Actor) this.actors.push (new Actor (new Vector (x, y), character));
            
            /*
                Si el carácter leído es 'x' definimos su 'characterType' como 'wall' (muro).
                Si el carácter leído es '!' definimos su 'characterType' como 'lava' (lava fija).
                  [Denotar que si hemos encontrado un carácter que mapea un elemento dinámico del nivel, lo cargamos en el array de Actores, pero no definimos su 'characterType',
                   por lo que se cargará como 'null' en la Rejilla de elementos estáticos del nivel].                
            */
            if (character === 'x') characterType = 'wall';
            else if (character === "!") characterType = 'lava';
            
            // Cargamos el 'characterType' en el array 'gridLine'.
            gridLine.push (characterType);
        }

        // Cargamos cada array 'gridLine' en el array Rejilla de elementos estáticos del nivel.
        this.grid.push (gridLine);
    }

    // Carga la propiedad Jugador con el objeto del array de Actores. Para ello filtra el array (sabiendo que solo hay un jugador) para quedarse el elemento 0 del array filtrado.
    this.player = this.actors.filter (actor => actor.type === 'player')[0];
}

/*
    Método 'prototype' de la clase 'Level' que comprueba si el Estado del Juego es distinto de 'null' (si se ha ganado o se ha perdido) y si el Retardo Final ha terminado.
    Si ambas condiciones son ciertas devuelve 'true', en caso contrario 'false'.
*/
Level.prototype.isFinished = function ()
{
    return (this.status !== null && this.finishDelay < 0);
}

/*
    Método 'prototype' de la clase 'Level' que se encarga de calcular el efecto de animación del movimiento de los actores (elementos dinámicos del juego).
    Este método es el que se estará llamando de forma repetida e ininterrumpida mientras el juego esté cargado en el navegador.
    Recibe un tiempo de salto de animación (un tiempo calculado antes de invocarla) y la tecla pulsada. 
*/
Level.prototype.animate = function (step, keys)
{
    // Si el Estado del Juego es distinto de 'null' (habremos ganado o perdido), reduce el Retardo final en la cantidad de tiempo del salto de animación.
    if (this.status !== null) this.finishDelay -= step;

    /*
        Bucle 'while' a repetir mientras quede tiempo de salto de animación:
        · Calcula el salto mínimo entre el tiempo de salto de animación restante y la constante 'MAX_STEP'. 
        · Para cada objeto del array de Actores invoca su función 'act' para que cada uno realice su animación personalizada pasándole el salto de animación que debe dar (el mínimo calculado), el propio Level y la tecla pulsada.
            [Denotar que todas clases correspondientes a los objetos dinámicos del juego (Actores) tienen un método 'act' (llamado en todas igual) para poderlo invocar de esta forma normalizada].
        · Finalmente resta al tiempo de salto de animación el salto mínimo calculado al principio. 
    */
    while (step > 0)
    {
        let thisStep = Math.min (step, MAX_STEP);
        this.actors.forEach (actor => actor.act (thisStep, this, keys));
        step -= thisStep;
    }
}

/*
    Método 'prototype' de la clase 'Level' que se encarga de detectar si el Jugador choca contra objetos estáticos del juego.
    Recibe la posición del jugador (las coordenadas de su esquina superior izquierda) y su tamaño.
    Devuelve el tipo del objeto estático contra el que choca (si no choca contra nada devuelve 'null').
*/
Level.prototype.obstacleAt = function (position, size)
{
    /*
        Como la posición es un valor cualquiera del espacio (2D), puede tener coordenadas no enteras y sabemos que los objetos estáticos del juego están colocados en coordenadas enteras.
        Para ajustar el espacio ocupado por el Jugador (su cuerpo) en valores enteros utilizamos los métodos 'floor' y 'ceil' de 'Math' sobre las coordenadas y teniendo en cuenta su tamaño. 
          [Denotar que en el caso de que la longitud horizontal del Jugador (0.8px) esté pisando 2 píxeles, nuestro ajuste definirá que ocupa los dos píxeles horizontales.
           De igual manera, verticalmente el Jugador mide 1.5px, por tanto por defecto se definirá que ocupa dos píxeles verticales, aunque puede llegar a ocupar tres].
                Ejemplo:    · position = (5.4, y)
                            · xStart = floor(5.4) = 5
                            · xEnd = ceil(5.4 + 0.8) = 7
                Según el cálculo anterior nuestro jugador ocupará horizontalmente desde la posicion 5 a la 7 (el largo de dos píxeles). 
    */
    let xStart = Math.floor(position.x);
    let xEnd = Math.ceil(position.x + size.x);
    let yStart = Math.floor(position.y);
    let yEnd = Math.ceil(position.y + size.y);

    /*
        Si la coordenada horizontal inicial del cuerpo se sale del espacio de juego por la izquierda, o la coordenada horizontal final del cuerpo se sale del espacio del juego por la derecha, 
        o la coordenada inicial vertical se sale del juego por arriba, entonces el método devolverá 'wall' (muro).
    */
    if (xStart < 0 || xEnd > this.width || yStart < 0) return ('wall');

    // Si la coordenada final vertical del cuerpo se sale del espacio del juego por abajo, entonces el método devolverá 'lava' (lava fija).
    if (yEnd > this.height) return ('lava');

    /*
        Se recorren todos los píxeles que se han definido como cuerpo del Jugador (vertical y horizontalmente).
        Si en la Rejilla de elementos estáticos del nivel hay marcado algo en alguno de esos píxeles se devuelve (los valores 'null' son el cielo, por tanto no cuentan).
    */
    for (let y = yStart; y < yEnd; y++)
    {
        for (let x = xStart; x < xEnd; x++)
        {
            let fieldType = this.grid[y][x];

            if (fieldType) return (fieldType);
        }
    }
}

/*
    Método 'prototype' de la clase 'Level' que se encarga de detectar si donde se va a mover el Jugador hay algún objeto dinámico del juego.
    Recibe el objeto Jugador.
    Devuelve el tipo del objeto dinámico contra el que chocaría (si no chocara contra nada devuelve 'null').
      [Denotar que como los objetos dinámicos del juego se mueven, pueden ocupar espacios con coordenadas no enteras, por tanto no se realizan ajustes análogos a los del método 'obstacleAt'].
*/
Level.prototype.actorAt = function (actor)
{
    // Recorre uno por uno los elementos dinámicos almacenados en el array de Actores y va asignando a la variable 'other' cada uno de ellos.
    for (let i = 0; i < this.actors.length; i++)
    {
        let other = this.actors[i];

        /*
            Si el elemento dinámico no es el propio Jugador, revisa las siguientes condiciones:
            · Que la coordenada x más el tamaño horizontal del Jugador sobrepase, en el eje horizontal, la coordenada x del elemento dinámico.
            · Que la coordenada x más el tamaño horizontal del elemento dinámico antepase, en el eje horizontal, la coordenada x del Jugador.
            · Que la coordenada y más el tamaño vertical del Jugador sobrepase, en el eje vertical, la coordenada y del elemento dinámico.
            · Que la coordenada y más el tamaño vertical del elemento dinámico antepase, en el eje vertical, la coordenada y del Jugador.
            Si todas las condiciones anteriores se cumplen, entonces se podrá decir que el Jugador está tocando un elemento dinámico del juego y se devuelve dicho elemento.
        */
        if (actor !== other &&
            actor.position.x + actor.size.x > other.position.x && actor.position.x < other.position.x + other.size.x &&            
            actor.position.y + actor.size.y > other.position.y && actor.position.y < other.position.y + other.size.y) return (other);
    }
}

/*
    Método 'prototype' de la clase 'Level' que se encarga de definir que ocurre cuando el Jugador choca contra un elemento del juego.
    Recibe el tipo de elemento contra el que ha chocado el jugador y el objeto del elemento contra el que ha chocado el Jugador.
    Si el jugador choca contra:
    · 'wall' --> No pasa nada, el estado del juego no cambia.
    · 'lava' --> El estado del juego se cambia a 'lost' (ha perdido) y se fija un Retardo Final de 1 segundo.
    · 'coin' --> Ejecuta el archivo de audio y elimina una moneda del array de Actores.
                 Acto seguido, comprueba si quedan más monedas en el array de Actores y, si no es así, cambia el estado del juego a 'won' (ha ganado) y fija un Retardo Final de 2 segundos.
*/
Level.prototype.playerTouched = function (type, actor)
{
    if (type === 'lava' && this.status === null)
    {
        this.status = 'lost';
        this.finishDelay = 1;
    }
    else if (type === 'coin')
         {
             playAudio ();
             this.actors = this.actors.filter (otherActor => otherActor !== actor);
             
             if (!remainCoins (this.actors))
             {
                 this.status = 'won';
                 this.finishDelay = 2;
             }
         }
}

/*
    Función que comprueba si en el array de cadenas de caracteres representativo del nivel del juego hay un jugador '@' y al menos una moneda 'o'.
    Recibe el array de cadenas de caracteres representativo del nivel del juego.
    Realiza un 'and' de dos búsquedas.
    Cada búsqueda se hace con el metodo 'some' de los arrays al que se le pasa una función que realiza una comprobación sobre cada uno de los elementos del array.
    Si al menos uno de los elementos del array cumple con la comprobación el método 'some' devuelve 'true', en caso contrario, 'false'.
    Las funciones flecha que se pasan a cada 'some' recorren todos los elementos del array ('row') y dentro de ellos buscan un carácter '@' y un carácter 'o'.
    Para ello utilizan el método 'indexOf' de los arrays que devuelve la posición del elemento buscado en el array o -1 si no lo encuentra. 
    Devuelve 'true' si ambas búsquedas terminan con valores distintos a -1 o 'false' si alguna de ellas termina con -1 (no encontrando lo que busca).
*/
function validateLevel (level)
{
    return ((level.some (row => row.indexOf ('@') !== -1) && level.some (row => row.indexOf ('o') !== -1)));
}

/*
    Función que lanzará el archivo de sonido.
    El primer paso es parar cualquier posible reproducción en curso, después rebobinar al principio del archivo de audio y por último reproducir.
*/
function playAudio ()
{
    gameAudio.pause ();
    gameAudio.currentTime = 0;
    gameAudio.play ();
}

/*
    Función que comprueba si en el array de Actores queda al menos un objeto de tipo moneda 'coin'.
    Recibe el array de Actores.
    Realiza la comprobación con el metodo 'some' al que le pasa una función flecha que recorre todos los elementos del array ('actor') comparando su tipo con 'coin'.
    Devuelve 'true' si encuentra al menos una moneda, o 'false' si no queda ninguna en el array de Actores.
*/
function remainCoins (actors)
{
    return (actors.some (actor => actor.type === 'coin'));
}