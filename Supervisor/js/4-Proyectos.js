import {
    FallaUser,
    CerrarSesion,
    db,
    doc,
    getDoc,
    ObtenerEvaluacion
} from "../../Firebase.js";


// =====================================================
// COMPROBAR USUARIO AUTENTICADO
// =====================================================

await FallaUser();


// =====================================================
// OBTENER PARÁMETROS DE LA URL
// =====================================================

const parametros = new URLSearchParams(
    window.location.search
);

const eventoId = parametros.get("eventoId");

const proyectoId = parametros.get("proyectoId");


console.log(
    "Evento recibido:",
    eventoId
);

console.log(
    "Proyecto recibido:",
    proyectoId
);


// =====================================================
// COMPROBAR QUE EXISTE EL ID DEL PROYECTO
// =====================================================

if (!proyectoId) {

    alert(
        "No se encontró el proyecto."
    );

    window.history.back();

}


// =====================================================
// OBTENER ELEMENTOS DEL HTML
// =====================================================

const nombreProyecto =
    document.getElementById(
        "nombreProyecto"
    );


const listaAlumnos =
    document.getElementById(
        "listaAlumnos"
    );


const promedioProyecto =
    document.getElementById(
        "promedioProyecto"
    );


const btnSalir =
    document.getElementById(
        "btnSalir"
    );


const btnVolver =
    document.getElementById(
        "btnVolver"
    );


// =====================================================
// MOSTRAR INFORMACIÓN DEL PROYECTO
// =====================================================

async function MostrarProyecto() {

    try {

        // =============================================
        // REFERENCIA AL PROYECTO
        // =============================================

        const proyectoRef = doc(
            db,
            "proyectos",
            proyectoId
        );


        // =============================================
        // OBTENER DOCUMENTO
        // =============================================

        const proyectoSnap = await getDoc(
            proyectoRef
        );


        // =============================================
        // COMPROBAR QUE EXISTE
        // =============================================

        if (!proyectoSnap.exists()) {

            console.error(
                "No se encontró el proyecto."
            );

            alert(
                "No se encontró el proyecto."
            );

            return;

        }


        // =============================================
        // OBTENER DATOS
        // =============================================

        const proyecto =
            proyectoSnap.data();


        console.log(
            "Datos del proyecto:",
            proyecto
        );


        // =============================================
        // MOSTRAR NOMBRE DEL PROYECTO
        // =============================================

        nombreProyecto.textContent =
            proyecto.nombre;


        // =============================================
        // OBTENER LISTA DE ALUMNOS
        // =============================================

        const alumnosUID =
            proyecto.alumnos || [];


        console.log(
            "UIDs de alumnos:",
            alumnosUID
        );


        // =============================================
        // LIMPIAR LISTA
        // =============================================

        listaAlumnos.innerHTML = "";


        // =============================================
        // COMPROBAR SI HAY ALUMNOS
        // =============================================

        if (alumnosUID.length === 0) {

            listaAlumnos.innerHTML = `
            
                <p>
                    No hay alumnos asignados a este proyecto.
                </p>
            
            `;

            promedioProyecto.textContent = "0";

            return;

        }


        // =============================================
        // VARIABLES PARA EL PROMEDIO
        // =============================================

        let sumaPromedios = 0;

        let cantidadEvaluaciones = 0;


        // =============================================
        // RECORRER ALUMNOS
        // =============================================

        for (
            const alumnoUID of alumnosUID
        ) {


            // =========================================
            // OBTENER DATOS DEL ALUMNO
            // =========================================

            const alumnoRef = doc(
                db,
                "alumnos",
                alumnoUID
            );


            const alumnoSnap =
                await getDoc(
                    alumnoRef
                );


            // =========================================
            // CREAR BOTÓN
            // =========================================

            const botonAlumno =
                document.createElement(
                    "button"
                );


            botonAlumno.className =
                "btnAlumno";


            // =========================================
            // MOSTRAR NOMBRE DEL ALUMNO
            // =========================================

            if (
                alumnoSnap.exists()
            ) {

                const alumno =
                    alumnoSnap.data();


                botonAlumno.textContent =
                    alumno.nombre ||
                    alumno.correo ||
                    alumnoUID;


                console.log(
                    "Alumno encontrado:",
                    alumno
                );

            }
            else {

                botonAlumno.textContent =
                    alumnoUID;

            }


            // =========================================
            // CLICK EN ALUMNO
            // =========================================

            botonAlumno.addEventListener(
                "click",
                () => {

                    window.location.href =
                        `../../Alumno/www/3-evaluacion.html?alumnoUID=${alumnoUID}&proyectoId=${proyectoId}&modo=consulta`;

                }
            );


            // =========================================
            // AGREGAR BOTÓN A LA LISTA
            // =========================================

            listaAlumnos.appendChild(
                botonAlumno
            );


            // =========================================
            // OBTENER EVALUACIÓN
            // =========================================

            const evaluacion =
                await ObtenerEvaluacion(
                    alumnoUID,
                    proyectoId
                );


            // =========================================
            // COMPROBAR SI EXISTE EVALUACIÓN
            // =========================================

            if (
                evaluacion &&
                evaluacion.existe &&
                evaluacion.datos
            ) {

                const promedio =
                    Number(
                        evaluacion.datos.promedio
                    );


                // =====================================
                // COMPROBAR QUE EL PROMEDIO SEA VÁLIDO
                // =====================================

                if (
                    !isNaN(promedio)
                ) {

                    sumaPromedios +=
                        promedio;

                    cantidadEvaluaciones++;

                }

            }

        }


        // =============================================
        // CALCULAR PROMEDIO GENERAL
        // =============================================

        if (
            cantidadEvaluaciones > 0
        ) {

            const promedioGeneral =
                sumaPromedios /
                cantidadEvaluaciones;


            // =========================================
            // MOSTRAR PROMEDIO
            // =========================================

            promedioProyecto.textContent =
                promedioGeneral.toFixed(2);


        }
        else {

            // =========================================
            // NO HAY EVALUACIONES
            // =========================================

            promedioProyecto.textContent =
                "0";

        }


        console.log(
            "Suma de promedios:",
            sumaPromedios
        );

        console.log(
            "Cantidad de evaluaciones:",
            cantidadEvaluaciones
        );

        console.log(
            "Promedio general:",
            promedioProyecto.textContent
        );


    }
    catch(error) {

        console.error(
            "Error al mostrar el proyecto:",
            error
        );

    }

}


// =====================================================
// BOTÓN SALIR
// =====================================================

btnSalir.addEventListener(
    "click",
    () => {

        CerrarSesion();

    }
);


// =====================================================
// BOTÓN VOLVER
// =====================================================

btnVolver.addEventListener(
    "click",
    () => {

        window.history.back();

    }
);


// =====================================================
// INICIAR PÁGINA
// =====================================================

MostrarProyecto();