import {
    auth,
    db,
    doc,
    getDoc,
    ObtenerEvaluacion,
    GuardarEvaluacion
} from "../../Firebase.js";


// =====================================================
// VARIABLES GLOBALES
// =====================================================

let alumnoUID = null;
let proyectoId = null;
let maestroUID = null;


// =====================================================
// OBTENER PARÁMETROS DE LA URL
// =====================================================

const parametros = new URLSearchParams(
    window.location.search
);

const modo = parametros.get("modo");

const alumnoUIDConsulta =
    parametros.get("alumnoUID");

const proyectoIdConsulta =
    parametros.get("proyectoId");


console.log(
    "Modo de la página:",
    modo
);

console.log(
    "Alumno recibido por URL:",
    alumnoUIDConsulta
);

console.log(
    "Proyecto recibido por URL:",
    proyectoIdConsulta
);


// =====================================================
// INICIAR PÁGINA
// =====================================================

async function iniciarEvaluacion() {

    try {

        // =================================================
        // MODO SUPERVISOR / CONSULTA
        // =================================================

        if (modo === "consulta") {

            console.log(
                "La evaluación se abrirá en modo consulta."
            );


            // =============================================
            // COMPROBAR PARÁMETROS
            // =============================================

            if (
                !alumnoUIDConsulta ||
                !proyectoIdConsulta
            ) {

                console.error(
                    "Faltan datos para consultar la evaluación."
                );

                alert(
                    "No se pudo cargar la evaluación."
                );

                return;

            }


            // =============================================
            // ASIGNAR DATOS
            // =============================================

            alumnoUID =
                alumnoUIDConsulta;

            proyectoId =
                proyectoIdConsulta;


            // =============================================
            // OBTENER DOCUMENTO DEL PROYECTO
            // =============================================

            const proyectoRef = doc(
                db,
                "proyectos",
                proyectoId
            );

            const proyectoSnap =
                await getDoc(
                    proyectoRef
                );


            if (
                !proyectoSnap.exists()
            ) {

                console.error(
                    "No se encontró el proyecto."
                );

                return;

            }


            // Obtener datos del proyecto
            const datosProyecto =
                proyectoSnap.data();


            console.log(
                "Datos del proyecto:",
                datosProyecto
            );


            // Obtener UID del maestro
            maestroUID =
                datosProyecto.maestroUID;


            if (!maestroUID) {

                console.error(
                    "El proyecto no tiene un maestro asignado."
                );

                return;

            }


            // =============================================
            // OBTENER EVALUACIÓN DEL ALUMNO
            // =============================================

            const evaluacion =
                await ObtenerEvaluacion(
                    alumnoUID,
                    proyectoId
                );


            if (
                evaluacion.existe
            ) {

                console.log(
                    "Evaluación encontrada."
                );

                console.log(
                    "Datos de la evaluación:",
                    evaluacion.datos
                );


                // =========================================
                // CARGAR EVALUACIÓN
                // =========================================

                cargarEvaluacion(
                    evaluacion.datos
                );


            }
            else {

                console.log(
                    "El alumno todavía no ha realizado una evaluación."
                );

            }


            // =============================================
            // ACTIVAR MODO SOLO LECTURA
            // =============================================

            activarModoConsulta();

            const btnVolver =
                document.getElementById("btnVolver");

            if (btnVolver) {

                btnVolver.addEventListener(
                    "click",
                    function (event) {

                        // Evitar que se ejecute el href
                        event.preventDefault();

                        // Regresar a la página anterior
                        window.history.back();

                    }
                );

            }


            return;

        }


        // =================================================
        // MODO NORMAL DEL ALUMNO
        // =================================================

        // Esperar a que Firebase confirme
        // el estado de autenticación

        await auth.authStateReady();


        // Obtener usuario actualmente autenticado

        const usuario =
            auth.currentUser;


        // Verificar que exista una sesión

        if (!usuario) {

            console.log(
                "No hay un alumno autenticado."
            );

            return;

        }


        // Guardar UID del alumno

        alumnoUID =
            usuario.uid;


        console.log(
            "Alumno autenticado:",
            alumnoUID
        );


        // =================================================
        // OBTENER DOCUMENTO DEL ALUMNO
        // =================================================

        const alumnoRef = doc(
            db,
            "alumnos",
            alumnoUID
        );

        const alumnoSnap =
            await getDoc(
                alumnoRef
            );


        if (
            !alumnoSnap.exists()
        ) {

            console.error(
                "No se encontró el documento del alumno."
            );

            return;

        }


        // Obtener datos del alumno

        const datosAlumno =
            alumnoSnap.data();


        console.log(
            "Datos del alumno:",
            datosAlumno
        );


        // Obtener ID del proyecto asignado

        proyectoId =
            datosAlumno.proyectoId;


        if (!proyectoId) {

            console.error(
                "El alumno no tiene un proyecto asignado."
            );

            return;

        }


        console.log(
            "Proyecto asignado:",
            proyectoId
        );


        // =================================================
        // OBTENER DOCUMENTO DEL PROYECTO
        // =================================================

        const proyectoRef = doc(
            db,
            "proyectos",
            proyectoId
        );

        const proyectoSnap =
            await getDoc(
                proyectoRef
            );


        if (
            !proyectoSnap.exists()
        ) {

            console.error(
                "No se encontró el proyecto."
            );

            return;

        }


        // Obtener datos del proyecto

        const datosProyecto =
            proyectoSnap.data();


        console.log(
            "Datos del proyecto:",
            datosProyecto
        );


        // Obtener UID del maestro

        maestroUID =
            datosProyecto.maestroUID;


        if (!maestroUID) {

            console.error(
                "El proyecto no tiene un maestro asignado."
            );

            return;

        }


        console.log(
            "Maestro del proyecto:",
            maestroUID
        );


        // =================================================
        // OBTENER EVALUACIÓN
        // =================================================

        const evaluacion =
            await ObtenerEvaluacion(
                alumnoUID,
                proyectoId
            );


        if (
            evaluacion.existe
        ) {

            console.log(
                "El alumno ya tiene una evaluación."
            );

            console.log(
                "Datos de la evaluación:",
                evaluacion.datos
            );


            // Cargar los datos existentes
            // en el formulario

            cargarEvaluacion(
                evaluacion.datos
            );


        }
        else {

            console.log(
                "El alumno todavía no ha realizado una evaluación."
            );

        }


        // =================================================
        // MOSTRAR INFORMACIÓN OBTENIDA
        // =================================================

        console.log(
            "================================"
        );

        console.log(
            "INFORMACIÓN DE LA EVALUACIÓN"
        );

        console.log(
            "Alumno UID:",
            alumnoUID
        );

        console.log(
            "Proyecto ID:",
            proyectoId
        );

        console.log(
            "Maestro UID:",
            maestroUID
        );

        console.log(
            "================================"
        );


    } catch (error) {

        console.error(
            "Error al iniciar la evaluación:",
            error
        );

    }

}


// =====================================================
// CARGAR EVALUACIÓN
// =====================================================

function cargarEvaluacion(
    datosEvaluacion
) {

    // Obtener las respuestas

    const respuestas =
        datosEvaluacion.respuestas;


    // =================================================
    // CARGAR RESPUESTAS
    // =================================================

    if (respuestas) {


        // Pregunta 1

        if (respuestas.p1) {

            const respuestaP1 =
                document.querySelector(
                    `input[name="p1"][value="${respuestas.p1}"]`
                );

            if (respuestaP1) {

                respuestaP1.checked =
                    true;

            }

        }


        // Pregunta 2

        if (respuestas.p2) {

            const respuestaP2 =
                document.querySelector(
                    `input[name="p2"][value="${respuestas.p2}"]`
                );

            if (respuestaP2) {

                respuestaP2.checked =
                    true;

            }

        }


        // Pregunta 3

        if (respuestas.p3) {

            const respuestaP3 =
                document.querySelector(
                    `input[name="p3"][value="${respuestas.p3}"]`
                );

            if (respuestaP3) {

                respuestaP3.checked =
                    true;

            }

        }


        // Pregunta 4

        if (respuestas.p4) {

            const respuestaP4 =
                document.querySelector(
                    `input[name="p4"][value="${respuestas.p4}"]`
                );

            if (respuestaP4) {

                respuestaP4.checked =
                    true;

            }

        }


        // Pregunta 5

        if (respuestas.p5) {

            const respuestaP5 =
                document.querySelector(
                    `input[name="p5"][value="${respuestas.p5}"]`
                );

            if (respuestaP5) {

                respuestaP5.checked =
                    true;

            }

        }

    }


    // =================================================
    // CARGAR COMENTARIO
    // =================================================

    const comentario =
        document.querySelector(
            "#comentario"
        );


    if (
        comentario &&
        datosEvaluacion.comentario
    ) {

        comentario.value =
            datosEvaluacion.comentario;

    }


    console.log(
        "Evaluación cargada correctamente."
    );

}


// =====================================================
// ACTIVAR MODO CONSULTA
// =====================================================

function activarModoConsulta() {

    console.log(
        "Activando modo solo lectura."
    );



    // =================================================
    // DESACTIVAR RESPUESTAS
    // =================================================

    const respuestas =
        document.querySelectorAll(
            'input[type="radio"]'
        );


    


    // =================================================
    // DESACTIVAR COMENTARIO
    // =================================================

    const comentario =
        document.querySelector(
            "#comentario"
        );


    if (comentario) {

        comentario.disabled =
            true;

    }


    // =================================================
    // OCULTAR BOTÓN DE ENVIAR
    // =================================================

    const btnEnviarEvaluacion =
        document.querySelector(
            "#btnEnviarEvaluacion"
        );


    if (btnEnviarEvaluacion) {

        btnEnviarEvaluacion.style.display =
            "none";

    }


    console.log(
        "Modo consulta activado correctamente."
    );

}


// =====================================================
// GUARDAR EVALUACIÓN
// =====================================================

async function guardarEvaluacion() {

    try {

        // =============================================
        // OBTENER RESPUESTAS
        // =============================================

        const respuestaP1 =
            document.querySelector(
                'input[name="p1"]:checked'
            );

        const respuestaP2 =
            document.querySelector(
                'input[name="p2"]:checked'
            );

        const respuestaP3 =
            document.querySelector(
                'input[name="p3"]:checked'
            );

        const respuestaP4 =
            document.querySelector(
                'input[name="p4"]:checked'
            );

        const respuestaP5 =
            document.querySelector(
                'input[name="p5"]:checked'
            );


        // =============================================
        // COMPROBAR QUE TODAS ESTÉN RESPONDIDAS
        // =============================================

        if (
            !respuestaP1 ||
            !respuestaP2 ||
            !respuestaP3 ||
            !respuestaP4 ||
            !respuestaP5
        ) {

            alert(
                "Debes responder todas las preguntas."
            );

            return;

        }


        // =============================================
        // CONVERTIR RESPUESTAS A NÚMEROS
        // =============================================

        const p1 =
            Number(
                respuestaP1.value
            );

        const p2 =
            Number(
                respuestaP2.value
            );

        const p3 =
            Number(
                respuestaP3.value
            );

        const p4 =
            Number(
                respuestaP4.value
            );

        const p5 =
            Number(
                respuestaP5.value
            );


        // =============================================
        // OBTENER COMENTARIO
        // =============================================

        const comentario =
            document.querySelector(
                "#comentario"
            );


        const textoComentario =
            comentario
                ? comentario.value
                : "";


        console.log(
            "Elemento comentario:",
            comentario
        );


        console.log(
            "Comentario que se enviará:",
            textoComentario
        );


        // =============================================
        // CALCULAR PROMEDIO
        // =============================================

        const promedio = (
            p1 +
            p2 +
            p3 +
            p4 +
            p5
        ) / 5;


        // =============================================
        // CREAR OBJETO DE RESPUESTAS
        // =============================================

        const respuestas = {

            p1: p1,

            p2: p2,

            p3: p3,

            p4: p4,

            p5: p5

        };


        // =============================================
        // GUARDAR EN FIREBASE
        // =============================================

        const resultado =
            await GuardarEvaluacion(

                alumnoUID,

                maestroUID,

                proyectoId,

                respuestas,

                textoComentario,

                promedio

            );


        // =============================================
        // COMPROBAR RESULTADO
        // =============================================

        if (resultado) {

            alert(
                "Evaluación guardada correctamente."
            );

        }
        else {

            alert(
                "No se pudo guardar la evaluación."
            );

        }


    } catch (error) {

        console.error(
            "Error al guardar la evaluación:",
            error
        );

        alert(
            "Ocurrió un error al guardar la evaluación."
        );

    }

}


// =====================================================
// BOTÓN ENVIAR EVALUACIÓN
// =====================================================

const btnEnviarEvaluacion =
    document.querySelector(
        "#btnEnviarEvaluacion"
    );


console.log(
    "Botón encontrado:",
    btnEnviarEvaluacion
);


if (btnEnviarEvaluacion) {

    btnEnviarEvaluacion.addEventListener(
        "click",
        () => {

            guardarEvaluacion();

        }
    );

}


// =====================================================
// INICIAR
// =====================================================

iniciarEvaluacion();