import {
    FallaUser,
    ObtenerEvento,
    ObtenerProyectos,
    CerrarSesion
} from "../../Firebase.js";


await FallaUser();


const parametros = new URLSearchParams(window.location.search);

const eventoId = parametros.get("id");

console.log("Evento recibido:", eventoId);


if (!eventoId) {

    alert("No se encontró el evento.");

    window.history.back();

}


const tituloEvento = document.getElementById("tituloEvento");

const listaProyectos = document.getElementById("listaProyectos");

const btnSalir = document.getElementById("btnSalir");

const btnVolver = document.getElementById("btnVolver");


const evento = await ObtenerEvento(eventoId);


if (evento) {

    tituloEvento.textContent = evento.titulo;

}


async function MostrarProyectos() {

    try {

        const proyectos = await ObtenerProyectos(eventoId);

        listaProyectos.innerHTML = "";


        if (proyectos.length === 0) {

            listaProyectos.innerHTML = `

                <div class="fila-votos">

                    <div class="bloque-proyecto-voto">

                        No hay proyectos registrados.

                    </div>

                    <div class="bloque-cantidad-voto">

                        0 votos

                    </div>

                </div>

            `;

            return;

        }


        proyectos.forEach((proyecto) => {

            const fila = document.createElement("div");

            fila.className = "fila-votos";


            fila.innerHTML = `

                <div class="bloque-proyecto-voto">

                    <button class="boton-proyecto-voto">

                        ${proyecto.nombre}

                    </button>

                </div>

                <div class="bloque-cantidad-voto">

                    ${proyecto.votos.total} votos

                </div>

            `;


            const botonProyecto = fila.querySelector(
                ".boton-proyecto-voto"
            );


            botonProyecto.addEventListener("click", () => {

                window.location.href =
                    `4-Proyectos.html?eventoId=${eventoId}&proyectoId=${proyecto.id}`;

            });


            listaProyectos.appendChild(fila);

        });

    }
    catch(error) {

        console.error(error);

    }

}


btnSalir.addEventListener("click", () => {

    CerrarSesion();

});


btnVolver.addEventListener("click", () => {

    window.history.back();

});


MostrarProyectos();

