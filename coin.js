// Constantes para fijar la velocidad y la distancia máxima de oscilación de las monedas.
const WOBBLE_SPEED = 10;
const WOBBLE_DISTANCE = 0.1;

/*
    Esta clase 'Coin' generará el elemento dinámico Moneda ('coin') como un actor del juego.
    Recibe un objeto vector de posición (2D) como su posición inicial.
*/
function Coin (initialPosition)
{
    /*
        Ubica la posición base y la posición inicial del elemento moneda sumando a la posición recibida un vector fijo (0.2, 0.1).
          [Denotar que esta suma lo que hace es centrar horizontalmente cada moneda en su píxel base y ubicarla una décima de píxel mas abajo
           dentro de su píxel base para que el efecto de oscilación no haga que la moneda se salga de dicho píxel base].
        Fija el tamaño del elemento moneda en 0.6 x 0.6 píxeles.
        Calcula el ángulo de oscilación inicial de la moneda como el producto de 2π por un número aleatorio entre 0 y 1.
          [Denotar que ángulo será siempre menor a los 360ͦ  de los 2π de una circunferencia completa].
    */
    this.basePosition = this.position = initialPosition.plus(new Vector (0.2, 0.1));
    this.size = new Vector (0.6, 0.6);
    this.wobble = 2 * Math.PI * Math.random ();
}

// Propiedad 'prototype' de la clase 'Coin' que fija su tipo de elemento.
Coin.prototype.type = 'coin';

/*
    Método 'prototype' de la clase 'Coin' que se encarga de mover los elementos de esta clase en cada frame de repintado.
    Recibe el salto de animación que debe realizar el elemento moneda. 
*/
Coin.prototype.act = function (step)
{
    /*
        En cada frame el nuevo angulo de oscilación de la moneda se recalculará sumándose a si mismo el producto del salto de animación por la velocidad de oscilacion.
        La posición oscilada se recalculará como el seno del ángulo de oscilación de la moneda multiplicado por su distancia máxima de oscilación.
        La nueva posición de la moneda será el resultado de sumar a su posición base (calculada al crear el objeto) la posición oscilada en su eje vertical.
          [Denotar que los valores del seno irán oscilando, frame a frame, entre +1 y -1, por lo que la nueva posición de la moneda nunca se saldrá de su píxel base].
    */
    this.wobble += step * WOBBLE_SPEED;
    let wobblePosition = Math.sin (this.wobble) * WOBBLE_DISTANCE;
    this.position = this.basePosition.plus (new Vector (0, wobblePosition));
}