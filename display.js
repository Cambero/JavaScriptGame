// Esta constante define el factor de escala del juego. Todo lo que se pinte en la pantalla se multiplicará por ella.
const SCALE = 20;

/*
    Esta función es la que generará cada elemento HTML a integrar en la página web.
    Recibe el tipo (etiqueta HTML) y un nombre (opcional).
    Utiliza el método 'document.createElement' de la API de JavaScript [https://developer.mozilla.org/es/docs/Web/API/Document/createElement] para generar un objeto elemento HTML.
    Devuelve el elemento HTML creado del tipo deseado.

*/
function createElement (type, className)
{
    let element = document.createElement (type);

    if (className !== null)
    {
        element.className = className;
    }
    return element;
}

/*
    Esta clase 'Display' es la que se encargará de linkar la ventana de trabajo para la aplicación con el documento HTML (digamos que activa el DOM).
    Recibe el 'parent' (la etiqueta o zona del HTML de la que colgará) y el Nivel del juego que habrá que pintar en la ventana de trabajo.
    Genera un primer elemento 'wrap' colgando del 'parent' que es una capa ('div' - HTML dinámico) con el nombre 'game' sobre la que se pintarán los elementos estáticos de cada nivel.
    De la capa (div) 'wrap', cuelga el primer pintado, el de los elementos estáticos del nivel del juego, invocando su método 'drawBackground'.
    Para colgar unos objetos de otros utiliza el método 'element.appendChild' de la API de JavaScript [https://developer.mozilla.org/es/docs/Web/API/Node/appendChild].
    Define la propiedad 'actorsLayer' a 'null' (este será el objeto que colgará de la capa 'wrap' conteniendo el pintado de los elementos dinámicos de cada nivel).
    Dependiendo del método 'prototype' que se le invoque devolverá unos elementos u otros.
*/
function DOMDisplay (parent, level)
{
    this.wrap = parent.appendChild (createElement('div', 'game'));
    this.level = level;
    this.wrap.appendChild (this.drawBackground ());
    this.actorsLayer = null;
}

/*
    Método 'prototype' de la clase 'Display' que se encargará de pintar los elementos estáticos del nivel del juego (la capa de fondo: cielo, muros y lavas fijas).    
    Generará y devolverá un elemento 'table' (una tabla HTML) con el ancho del Nivel ('level') del juego en píxeles multiplicado por la escala que contendrá,
    ordenados en sus celdas, los elementos estáticos del nivel del juego.
*/
DOMDisplay.prototype.drawBackground = function ()
{
    let table = createElement ('table', 'background');
    table.style.width = this.level.width * SCALE + 'px';

    /*
        Recorre el array Rejilla de elementos estáticos del Nivel y por cada elemento (fila) crea un elemento 'tr' (una fila de una tabla HTML)
        a la que asigna un tamaño igual a 1 píxel multiplicado por la escala.
        Cuelga el elemento 'tr' de la 'table'.
    */
    this.level.grid.forEach (row => 
                             {
                                 let rowElement = createElement ('tr');
                                 rowElement.style.height = SCALE + 'px';
                                 table.appendChild (rowElement);

                                 /*
                                     Recorre el array fila del array Rejilla de elementos estáticos del Nivel y para cada item crea un elemento 'td' (una celda de una fila de una tabla HTML)
                                     al que nombra con el tipo del item del array y directamente cuelga del elemento 'tr'.   
                                 */
                                 row.forEach (type => rowElement.appendChild (createElement('td', type)));
                             });

    return (table);
}

/*
    Método 'prototype' de la clase 'Display' que se encargará de pintar los elementos dinámicos del nivel del juego (los actores: monedas, lavas dinámicas y el jugador).    
    Generará y devolverá un elemento 'actorsWrap' que es una capa ('div') conteniendo un array de capas ('div'), cada una albergando a cada uno de los actores del juego.
*/
DOMDisplay.prototype.drawActors = function ()
{
    let actorsWrap = createElement ('div');

    /*
        Para generar el array de capas utiliza el método 'map' de los arrays, al que pasa una funcion flecha que recorre el array de Actores del Nivel.
        Para cada actor genera un elemento 'actorElement' que es también una capa ('div') que va nombrando como 'actor + tipo'.
        Esta capas 'actorElement' se van colgando respectivamente del mismo número de elementos 'rect', a los que se les definen su tamaño y posicion utilizando sus métodos de estilo
        para igualar estas características, en píxeles multiplicados por la escala, a las de cada uno de los Actores del Nivel.
        Los elementos 'rect' [https://developer.mozilla.org/es/docs/Web/SVG/Element/rect] son una forma básica de los formatos de gráficos vectoriales escalables (SVG)
        con los que pueden interactuar JavaScript y HTML.
    */
    this.level.actors.map (actor => 
                           {
                               let actorElement = createElement ('div', `actor ${actor.type}`);
                               let rect = actorsWrap.appendChild (actorElement);
                               rect.style.width = actor.size.x * SCALE + 'px';
                               rect.style.height = actor.size.y * SCALE + 'px';
                               rect.style.left = actor.position.x * SCALE + 'px';
                               rect.style.top = actor.position.y * SCALE + 'px';
                           });
    
    return (actorsWrap);
}

/*
    Método 'prototype' de la clase 'Display' que se encargará de realizar los scrolls dinámicos de la pantalla en función de la posición del jugador en cada nivel.
    Esto generará el efecto de avance del jugador por el nivel manteniéndolo siempre dentro de los márgenes del marco visible.
*/
DOMDisplay.prototype.moveDisplay = function ()
{
    // Define el ancho y el alto del marco visible iguales a los definidos el ha hoja de estilos para el elemento capa 'wrap' (.game)
    let width = this.wrap.clientWidth;
    let height = this.wrap.clientHeight;

    /*
        Define el margen como la tercera parte del ancho del marco visible.
        El margen será punto que marque la distancia limite, hasta cada uno de los finales del marco visible, a la que puede llegar el jugador sin que scrollee dinámicamente la pantalla.
        Este margen será utilizado tanto para el eje horizontal como para el vertical.
    */
    let margin = width / 3;

    /*
        Define de forma relativa los límites geográficos dinámicos del marco visible utilizando los valores almacenados en las propiedades del elemento capa 'wrap':
        · Izquierda (inicio del eje horizontal) ==> como lo que valga 'wrap.scrollLeft'.
        · Derecha (fin del eje horizontal) ==> como lo que valga 'wrap.scrollLeft' + el ancho del marco visible.
        · Arriba (inicio del eje vertical) ==> como lo que valga 'wrap.scrollTop'.
        · Abajo (fin del eje vertical) ==> como lo que valga 'wrap.scrollTop' + el alto del marco visible.
    */
    let left = this.wrap.scrollLeft;
    let right = left + width;
    let top = this.wrap.scrollTop;
    let bottom = top + height;

    // Calcula el punto central del cuerpo del jugador sumando vectorialemente a su posición (que marca su esquina superior izquierda) la mitad de su tamaño multiplicado por la escala.
    let player = this.level.player;
    let playerCenter = player.position.plus(player.size.times(0.5)).times(SCALE);

    /*
        Para realizar el scroll dinámico horizontal comprueba:
        · Si el punto central del cuerpo del jugador se encuentra entre el inicio del eje horizontal y su punto límite margen, recalcula la propiedad 'wrap.scrollLeft'
          como la diferencia entre la coordenada x del punto central del cuerpo del jugador y el margen (es decir, la distancia que el jugador sobrepase el margen limite hacia la izquierda).
        · Si el punto central del cuerpo del jugador se encuentra entre el fin del eje horizontal y su punto límite margen, recalcula la propiedad 'wrap.scrollLeft'
          como la diferencia entre la coordenada x del punto central del cuerpo del jugador más el margen y el ancho del marco visible (es decir, la distancia que el jugador sobrepase el margen limite hacia la derecha).
    */
    if (playerCenter.x < left + margin) this.wrap.scrollLeft = playerCenter.x - margin;
    else if (playerCenter.x > right - margin) this.wrap.scrollLeft = playerCenter.x + margin - width;

    /*
        Para realizar el scroll dinámico vertical comprueba:
        · Si el punto central del cuerpo del jugador se encuentra entre el inicio del eje vertical y su punto límite margen, recalcula la propiedad 'wrap.scrollTop'
          como la diferencia entre la coordenada y del punto central del cuerpo del jugador y el margen (es decir, la distancia que el jugador sobrepase el margen limite hacia arriba).
        · Si el punto central del cuerpo del jugador se encuentra entre el fin del eje vertical y su punto límite margen, recalcula la propiedad 'wrap.scrollTop'
          como la diferencia entre la coordenada y del punto central del cuerpo del jugador más el margen y el alto del marco visible (es decir, la distancia que el jugador sobrepase el margen limite hacia abajo).
    */
    if (playerCenter.y < top + margin) this.wrap.scrollTop = playerCenter.y - margin;
    else if (playerCenter.y > bottom - margin) this.wrap.scrollTop = playerCenter.y + margin - height;
}

/*
    Método 'prototype' de la clase 'Display' que se encargará de eliminar y regenerar los pintados de los objetos dinámicos del nivel.
    Esto generará el efecto 'pelicula', cambiando los frames a gran velocidad y creando la animación del juego para el ojo humano.
*/
DOMDisplay.prototype.drawFrame = function ()
{
    // Si el objeto 'actorsLayer' contiene algo (no es la primera vez que se pinta) se elimina (se descuelga) de la capa 'wrap'.
    if (this.actorsLayer !== null) this.wrap.removeChild (this.actorsLayer);
    
    // Se genera un objeto 'actorsLayer', colgado de la capa 'wrap', invocando el método 'drawActors' para pintar en una capa las subcapas con los elementos dinámicos del nivel. 
    this.actorsLayer = this.wrap.appendChild (this.drawActors ());

    /*
        Se nombra la capa 'wrap' como la concatenación de 'game ' + o el estado del juego o nada.
          [Denotar que esto solo cambiará el nombre a la capa 'wrap' cuando se gane o se pierda].
    */
    this.wrap.className = 'game ' + (this.level.status || '');

    // Se invoca el método 'moveDisplay' para que se realice el scroll dinámico consecuente.
    this.moveDisplay ();
}

/*
    Método 'prototype' de la clase 'Display' que se encargará de eliminar (de descolgar) de la pantalla el 'wrap' de un nivel finalizado (ganado o perdido).
*/
DOMDisplay.prototype.clear = function ()
{
    this.wrap.parentNode.removeChild (this.wrap);
}