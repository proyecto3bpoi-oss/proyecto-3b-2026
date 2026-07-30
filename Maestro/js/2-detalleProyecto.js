import {
    auth,
    db,
    FallaUser,
    CerrarSesion,
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "../../Firebase.js";

const btnVolver = document.getElementById("btn-volver")
const btnSalir = document.getElementById("btn-salir")


async function CargarDetallesProyecto() {

    try {

        // Obtener el ID del proyecto desde la URL
        const parametros = new URLSearchParams(window.location.search);
        const proyectoId = parametros.get("id");


        // Verificar que exista el ID del proyecto
        if (!proyectoId) {

            console.error("No se encontró el ID del proyecto.");

            document.getElementById("tituloProyecto").textContent =
                "Proyecto no encontrado";

            document.getElementById("descripcionProyecto").textContent =
                "No se pudo identificar el proyecto.";

            return;
        }


        // Referencia al documento del proyecto
        const proyectoRef = doc(
            db,
            "proyectos",
            proyectoId
        );


        // Obtener información del proyecto
        const proyectoSnap = await getDoc(proyectoRef);


        // Verificar que el proyecto exista
        if (!proyectoSnap.exists()) {

            console.error("El proyecto no existe.");

            document.getElementById("tituloProyecto").textContent =
                "Proyecto no encontrado";

            document.getElementById("descripcionProyecto").textContent =
                "El proyecto solicitado no existe.";

            return;
        }


        // Obtener los datos del proyecto
        const datosProyecto = proyectoSnap.data();


        // Mostrar título del proyecto
        document.getElementById("tituloProyecto").textContent =
            datosProyecto.nombre || "Sin título";


        // Mostrar descripción del proyecto
        document.getElementById("descripcionProyecto").textContent =
            datosProyecto.descripcion || "Sin descripción";


        // Obtener el contenedor de alumnos
        const listaAlumnos =
            document.getElementById("listaAlumnos");


        // Limpiar la lista antes de agregar alumnos
        listaAlumnos.innerHTML = "";


        // Buscar alumnos pertenecientes al proyecto
        const consultaAlumnos = query(
            collection(db, "alumnos"),
            where("proyectoId", "==", proyectoId)
        );


        const alumnosSnap =
            await getDocs(consultaAlumnos);


        // Verificar si no hay alumnos
        if (alumnosSnap.empty) {

            const mensaje =
                document.createElement("div");

            mensaje.className = "pill-alumno";

            mensaje.textContent =
                "No hay alumnos asignados a este proyecto.";

            listaAlumnos.appendChild(mensaje);

            return;
        }


        // Mostrar cada alumno
        alumnosSnap.forEach((alumnoDoc) => {

            const datosAlumno =
                alumnoDoc.data();

            const alumno =
                document.createElement("div");

            alumno.className =
                "pill-alumno";

            alumno.textContent =
                datosAlumno.nombre ||
                datosAlumno.correo ||
                "Alumno sin información";

            listaAlumnos.appendChild(alumno);

        });


    } catch (error) {

        console.error(
            "Error al cargar los detalles del proyecto:",
            error
        );

    }

}

btnVolver.addEventListener("click",()=>{
    window.location.href = "./1-dashboard-lleno.html";
})


btnSalir.addEventListener("click", () => {

    CerrarSesion();

});
// Ejecutar la función al cargar la página
CargarDetallesProyecto();
