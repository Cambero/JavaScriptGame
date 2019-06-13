/*
    Esta clase 'Lava' generará el elemento dinámico Lava ('lava') como un actor del juego.
    Recibe un objeto vector de posición (2D) como su posición inicial y el carácter que identifica su tipo de elemento lava.
*/
function Lava (initialPosition, characterType)
{
    // Ubica el elemento lava en su vector de posición inicial y fija su tamaño en 1 x 1 píxeles. 
    this.position = initialPosition;
    this.size = new Vector (1, 1);

    /*
        Si el carácter recibido es:
        · '=' --> Será una lava con movimiento de vaivén horizontal. Se fija su velocidad como un vector que avanza dos píxeles horizontalmente.
        · '|' --> Será una lava con movimiento de vaivén vertical. Se fija su velocidad como un vector que avanza dos píxeles verticalmente.
        · 'v' --> Será una lava que cae verticalmente una y otra vez. Se fija su velocidad como un vector que avanza tres píxeles verticalmente. Se le fija un punto de reposicionamiento en su posición inicial.
    */    
    if (characterType === '=')
    {
        this.speed = new Vector (2, 0);
    }
    else if (characterType === '|')
         {
             this.speed = new Vector (0, 2);
         }
         else if (characterType === 'v')
              {
                  this.speed = new Vector (0, 3);
                  this.respawnPosition = initialPosition;
              }
}

// Propiedad 'prototype' de la clase 'Lava' que fija su tipo de elemento.
Lava.prototype.type = 'lava';

/*
    Método 'prototype' de la clase 'Lava' que se encarga de mover los elementos de esta clase en cada frame de repintado.
    Recibe el salto de animación que debe realizar el elemento lava y el objeto Nivel para poder comprobar el mapa de objetos estáticos del juego. 
*/
Lava.prototype.act = function (step, level)
{
    // Calcula la posición final del elemento lava tras el salto de animación sumando a su posición actual el producto vectorial de su vector velocidad por el factor del salto de animación.
    let newPosition = this.position.plus (this.speed.times (step));

    /*
        Comprueba si en la posición final que el elemento lava debería ocupar hay algun otro elemento del juego.
        Para ello invoca el método 'obstacleAt' del objeto Nivel ('level'), pasándole la posición final del elemento lava y su tamaño.
        Este método devolverá el tipo del obstáculo que haya en esa posición o 'null' si no hay nada (si es espacio de cielo).
        · Si no hay nada, ubica el elemento lava en su nueva posición.
        · Si hay algo y el elemento lava es de los que caen verticalmente con reposicionamiento, lo ubica en su posición de reposición.
        · Si hay algo y el elemento lava es de los que tienen movimiento de vaivén, multiplica su vector velocidad por -1 para que su movimiento cambie de sentido.
    */
    if (!level.obstacleAt (newPosition, this.size)) this.position = newPosition;
    else if (this.respawnPosition) this.position = this.respawnPosition;
         else this.speed = this.speed.times(-1);
}