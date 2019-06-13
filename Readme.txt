
.. Archivos de Código JavaScript del juego analizado en el curso 'JavaScript desde Cero' de KeepCoding ..
=========================================================================================================

Los archivos de código están comentados por mí como mejor he sabido hacerlo.
Espero que puedan servir de ayuda didáctica para entender mejor el código del juego.

Cualquier ayuda, mejora o comentario... todo será siempre bienvenido.


---------------------
 Indice de Contenido
---------------------

- Carpeta Sounds     : Contiene el archivo coin.wav (sonido ejecutado al recoger una moneda).
- Archivo coin.js    : Clase Moneda.
- Archivo display.js : Clase Ventana.
- Archivo index.js   : Funciones de ejecución y repintado del juego.
- Archivo lava.js    : Clase Lava.
- Archivo level.js   : Clase Nivel.
- Archivo levels.js  : Array de mapas de niveles del juego.
- Archivo player.js  : Clase Jugador.
- Archivo vector.js	 : Clase Vector.
- Archivo index.html : Página de la que se cuelga el juego.
- Archivo style.css  : Hoja de estilos.
- Archivo readme.txt : Este mismo índice.


---------------------------------
 Mecánica de Ejecución del Juego
---------------------------------

Voy a intentar describir la secuencia de ejecución del código, aunque se debe entender que se trata
de una ejecución recursiva contínua, con pintados y repintados de frames, y siempre atendiendo a la
sucesión de eventos, para detectar cuando el usuario pulsa o suelta las teclas que actúan sobre el
movimiento del Jugador (héroe del juego).

¡¡ Vamos allá !!

Cuando se carga el archivo index.html en un navegador, se leen todos los archivos linkados en él con
etiquetas <script> y comienza la secuencia de ejecución del código JavaScript.

El archivo index.js lanza la ejecución del juego invocando la función 'runGame'.

En ella se ejecuta la función 'startLevel' generando un objeto Nivel, a partir del array del primer
nivel del juego, y se invoca, con él, a la función 'runLevel'.

En esta función 'runLevel' se genera una capa HTML dinámica <div, 'game'> (la Ventana) colgada de la
etiqueta <body>. En la Ventana se coloca una tabla HTML estática <table, 'background'> en la que se
van pintando por filas <tr> y celdas <td> los elementos estáticos del juego contenidos en el mapeo
del nivel.

Acto seguido se invoca la función 'runAnimation'. Comienza entonces el contínuo repintado recursivo
de frames, que se repetirá indefinidamente mientras no cambie la propiedad 'status' de la Ventana,
es decir, mientras el jugador no muera intentando superar el nivel o hasta que consiga superarlo.

Si el jugador muere durante el transcurso de un nivel se reiniciará la secuencia 'startLevel' de ese
mismo nivel. Si supera un nivel (recopilando la totalidad de las monedas que haya en él) se iniciará
la secuencia 'startLevel' del siguiente nivel (si lo hubiera) o terminará el juego con su victoria.

Dentro de la función 'runAnimation' se ejecuta otra función, definida de forma anónima en la primera 
llamada a 'runAnimation' y pasada como parámetro (esta es la función se reinvoca una y otra vez con
el método 'requestAnimationFrame' de la Ventana para pedir una y otra vez repintados de frame).

En la primera ejecución, la primera vez que se invoca al método 'animate' del Nivel, se calculan las
posiciones iniciales de todos los elementos dinámicos del juego (actores), después ya se invoca el
método 'drawFrame' de la Ventana generando una capa HTML dinámica <div, 'actorsLayer'> colgada de la
propia Ventana. Esta capa 'actorsLayer' se eliminará y recolgará en cada repintado de frame y de
ella se colgarán tantas capas HTML dinamicas <div, 'Actor'> como actores tenga el nivel.

Es decir, cada actor tendrá su propia capa dinámica superpuesta al fondo para situarse y moverse por
la Ventana, pudiendo así pasar por encima, tanto del fondo, como de otros actores. Lo que suceda
cuando dos actores, o cuando un actor y un elemento estático del fondo, compartan el mismo espacio
de píxeles lo definirá, para cada uno de ellos, su propio metodo de animación 'act'.

Y así sucederá el continuo repintado que causará el efecto de animación. Las contínuas peticiones de
'requestAnimationFrame' derivarán en repetidas ejecuciones secuenciales de los métodos 'animate' y
'drawFrame', calculando y redibujando el movimiento de los actores en sus capas dinámicas.

Mientras esta secuencia se lleva a cabo, analizando en cada paso las interactuaciones entre actores,
la función 'handler' (manejador de eventos) estará atenta a las pulsaciones y liberaciones de teclas
del usuario, para traducir y enviar al método 'act' del Jugador las órdenes para que éste se mueva 
en consecuencia y se realicen sus acciones secundarias como el desplazamiento automático de la zona
visible del nivel del juego, la desaparición de las monedas cuando el Jugador las recoge (y suena el
audio asociado a este suceso) o la animación final si muere o supera el nivel.

Más detalles de las clases y sus métodos y propiedades, en los comentarios del código.

¡¡ Gracias !!