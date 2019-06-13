/*
    Esta clase 'Vector' generará objetos vectores de posición para ubicar dinámicamente los elementos dinámicos del juego.
    Recibe una pareja de coordenadas espaciales (2D).
    Dependiendo del método 'prototype' que se le invoque devolverá otro objeto vector de posición.
*/
function Vector (x, y)
{
    this.x = x;
    this.y = y;
}

/*
    Método 'prototype' de la clase 'Vector' que se encargará de sumar dos posiciones espaciales.
    Recibe un objeto vector de posición y lo suma al propio vector de posición.
    Devuelve el objeto vector de posición resultado de la suma vectorial.
*/
Vector.prototype.plus = function (other)
{
    return (new Vector (this.x + other.x, this.y + other.y));
}

/*
    Método 'prototype' de la clase 'Vector' que se encargará de multiplicar las coordenadas del vector por un factor.
    Recibe el factor de producto y multiplica el propio vector de posición por él.
    Devuelve el objeto vector de posición resultado del producto vectorial.
*/
Vector.prototype.times = function (factor)
{
    return new Vector (this.x * factor, this.y * factor);
}