// Constantes para fijar la velocidad, la gravedad y la potencia de salto del jugador.
const PLAYER_SPEED = 6;
const GRAVITY = 28;
const JUMP_SPEED = 18;

/*
    Esta clase 'Player' generará el elemento dinámico Jugador ('player') como un actor del juego.
    Recibe un objeto vector de posición (2D) como su posición inicial.
*/
function Player (initialPosition)
{
    // Ubica el elemento jugador en su vector de posición inicial levantado medio pixel ya que fija su tamaño en 0.8 x 1.5 píxeles e inicializa su velocidad con un vector nulo. 
    this.position = initialPosition.plus (new Vector (0, -0.5));
    this.size = new Vector (0.8, 1.5);
    this.speed = new Vector (0, 0);
}

// Propiedad 'prototype' de la clase 'Player' que fija su tipo de elemento.
Player.prototype.type = 'player';

/*
    Método 'prototype' de la clase 'Player' que se encarga de mover los elementos de esta clase horizontalmente en cada frame de repintado.
    Recibe el salto de animación que debe realizar el elemento lava, el objeto Nivel para poder comprobar el mapa de objetos estáticos del juego y la tecla detectada como pulsada en el manejo de eventos. 
*/
Player.prototype.moveX = function (step, level, keys)
{
    // Inicializa la coordenada horizontal del vector velocidad a cero.
    this.speed.x = 0;

    // Si la tecla detectada como pulsada en el manejo de eventos es la flecha izquierda se decrementa el vector velocidad con la constante de velocidad del jugador.
    if (keys.left) this.speed.x -= PLAYER_SPEED;

    // Si la tecla detectada como pulsada en el manejo de eventos es la flecha derecha se incrementa el vector velocidad con la constante de velocidad del jugador.
    if (keys.right) this.speed.x += PLAYER_SPEED;

    /*
        Calcula el movimiento horizontal como el producto vectorial del vector velocidad (que sólo puede tener valor en la coordenada horizontal) por el salto de animación.
        Calcula la posición final del elemento jugador tras el salto de animación sumando a su posición actual el producto vectorial calculado como movimiento.
    */
    let motion = new Vector (this.speed.x * step, 0);
    let newPosition = this.position.plus (motion);

    /*
        Comprueba si en la posición final que el elemento jugador debería ocupar hay algun objeto estático del juego.
        Para ello invoca el método 'obstacleAt' del objeto Nivel ('level') pasándole la posición final del elemento jugador y su tamaño.
        Este método devolverá a la variable 'obstacle' el tipo de objeto estático que haya en esa posición o 'null' si no hay nada (si es espacio de cielo).
    */
    let obstacle = level.obstacleAt (newPosition, this.size);

    /*
        Si la variable 'obstacle' es distinta de 'null' invoca el método 'playerTouched' del objeto Nivel ('level') pasándole el tipo de objeto estático, para que determine que ocurre tras el choque.
        Si la variable 'obstacle' vale 'null', ubica el elemento jugador en su nueva posición.
    */
    if (obstacle) level.playerTouched (obstacle);
    else this.position = newPosition;
}

/*
    Método 'prototype' de la clase 'Player' que se encarga de mover los elementos de esta clase verticalmente en cada frame de repintado.
    Recibe el salto de animación que debe realizar el elemento lava, el objeto Nivel para poder comprobar el mapa de objetos estáticos del juego y la tecla detectada como pulsada en el manejo de eventos. 
*/
Player.prototype.moveY = function (step, level, keys)
{
    // Inicializa la coordenada vertical del vector velocidad como el efecto gravedad, aumentándola en el producto de la gravedad por el salto de animación.
    this.speed.y += step * GRAVITY;

    /*
        Calcula el movimiento vertical como el producto vectorial del vector velocidad (que sólo puede tener valor en la coordenada vertical) por el salto de animación.
        Calcula la posición final del elemento jugador tras el salto de animación sumando a su posición actual el producto vectorial calculado como movimiento.
    */
    let motion = new Vector (0, this.speed.y * step);
    let newPosition = this.position.plus (motion);

    /*
        Comprueba si en la posición final que el elemento jugador debería ocupar hay algun objeto estático del juego.
        Para ello invoca el método 'obstacleAt' del objeto Nivel ('level') pasándole la posición final del elemento jugador y su tamaño.
        Este método devolverá a la variable 'obstacle' el tipo de objeto estático que haya en esa posición o 'null' si no hay nada (si es espacio de cielo).
    */
    let obstacle = level.obstacleAt (newPosition, this.size);

    /*
        Si la variable 'obstacle' es distinta de 'null' invoca el método 'playerTouched' del objeto Nivel ('level') pasándole el tipo de objeto estático, para que determine que ocurre tras el choque.
        Si tras evaluar el choque el jugador no ha perdido, se comprueba si se ha pulsado la flecha arriba y si el vector velocidad tiene un valor positivo en su coordenada vertical,
        lo cual significará que el jugador está posado (y no en la fase de ascenso de un salto).
        Si lo anterior se cumple, se decrementa la coordenada vertical del vector velocidad con la constante de potencia de alto del jugador (para que salte hacia arriba).
        Si por el contrario no se cumple, o bien porque no se haya pulsado la flecha arriba, o bien porque aunque se haya pulsado el jugador está en pleno salto,
        se anula la coordenada vertical del vector velocidad para que no haya un posible salto (en el aire) sin apoyo.
        Si la variable 'obstacle' vale 'null', ubica el elemento jugador en su nueva posición.
    */
    if (obstacle)
    {
        level.playerTouched (obstacle);

        if (keys.up && this.speed.y > 0) this.speed.y = -JUMP_SPEED; 
        else this.speed.y = 0; 
    }
    else this.position = newPosition;
}

/*
    Método 'prototype' de la clase 'Player' que se encarga de mover los elementos de esta clase en cada frame de repintado.
    Recibe el salto de animación que debe realizar el elemento jugador, el objeto Nivel del juego y la tecla detectada como pulsada en el manejo de eventos. 
*/
Player.prototype.act = function (step, level, keys)
{
    // Invoca los métodos de movimiento horizontal y vertical del objeto jugador, pasándoles el salto de animación, el objeto Nivel del juego y la tecla detectada como pulsada en el manejo de eventos.
    this.moveX (step, level, keys);
    this.moveY (step, level, keys);

    /*
        Comprueba si en la posición final que el elemento jugador debería ocupar hay algun objeto dinámico del juego.
        Para ello invoca el método 'actorAt' del objeto Nivel ('level') pasándole el propio elemento jugador.
        Este método devolverá a la variable 'otherActor' el tipo de objeto dinámico que haya en esa posición o 'null' si no hay nada.
    */
    let otherActor = level.actorAt (this);

    /*
        Si la variable 'otherActor' es distinta de 'null' invoca el método 'playerTouched' del objeto Nivel ('level') pasándole el tipo de objeto dinámico y el propio objeto dinámico,
        para que determine que ocurre tras el choque.
    */
    if (otherActor) level.playerTouched (otherActor.type, otherActor);

    /*
        Si tras el choque el estado del juego ha cambiado a 'lost' (ha perdido) se incrementa la posición vertical del jugador con el salto de animación y se decrementa en igual medida su tamaño.
        Esto creará el efecto de empequeñecimiento del jugador al perder el juego.
    */
    if (level.status === 'lost')
    {
        this.position.y += step;
        this.size.y -= step;
    }
}