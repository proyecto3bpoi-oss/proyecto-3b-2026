import { 
    auth, 
    db, 
    doc, 
    getDoc, 
    updateDoc, 
    onSnapshot, 
    FallaUser, 
    CerrarSesion 
} from "../../Firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Validar que el usuario esté autenticado
    await FallaUser("../../../Login/www/Login.HTML");

    const usuarioActual = auth.currentUser;
    if (!usuarioActual) return;

    // Referencias a los elementos del DOM (ajusta los selectores según tu HTML)
    const labelTituloProyecto = document.querySelector("#tituloProyecto"); // El cuadro superior del título
    const txtDescripcionProyecto = document.querySelector("#descripcionProyecto"); // El textarea grande de descripción
    const btnSalir = document.querySelector(".btn-logout");
    const btnEvaluar = document.querySelector(".btn-evaluar");
    const btnQR = document.querySelector(".btn-qr");

    if (btnEvaluar) {
        btnEvaluar.addEventListener("click", () => {
            window.location.href = "./3-evaluacion.html";
        });
    }
    if (btnQR) {
        btnQR.addEventListener("click", () => {
            window.location.href = "./2-codigoQr.html";
        });
    }

    if (btnSalir) {
        btnSalir.addEventListener("click", () => {
            CerrarSesion("../../../Login/www/Login.HTML");
        });
    }

    try {
        // 2. Obtener los datos del alumno en Firestore para conocer su 'proyectoId'
        const alumnoDocRef = doc(db, "alumnos", usuarioActual.uid);
        const alumnoSnap = await getDoc(alumnoDocRef);

        if (!alumnoSnap.exists()) {
            console.error("No se encontró información del alumno en la base de datos.");
            return;
        }

        const datosAlumno = alumnoSnap.data();
        const proyectoId = datosAlumno.proyectoId;

        if (!proyectoId) {
            console.warn("El alumno no está asignado a ningún proyecto.");
            return;
        }

        // 3. Escuchar en tiempo real los cambios del proyecto (Nombre y Descripción)
        const proyectoDocRef = doc(db, "proyectos", proyectoId);

        onSnapshot(proyectoDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const proyectoData = docSnap.data();

                // REGLA: Título del proyecto asignado por el maestro (Solo Lectura)
                if (labelTituloProyecto) {
                    labelTituloProyecto.textContent = proyectoData.nombre || "Título de proyecto";
                }

                // REGLA: Edición compartida de la descripción
                if (txtDescripcionProyecto && document.activeElement !== txtDescripcionProyecto) {
                    txtDescripcionProyecto.value = proyectoData.descripcion || "";
                }
            }
        });

        // 4. Guardar cambios en la descripción en tiempo real cuando los alumnos escriban
        if (txtDescripcionProyecto) {
            let timeoutId;
            txtDescripcionProyecto.addEventListener("input", (e) => {
                clearTimeout(timeoutId);
                const nuevaDescripcion = e.target.value;

                // Hacemos un pequeño "debounce" para no saturar Firestore con cada letra
                timeoutId = setTimeout(async () => {
                    try {
                        await updateDoc(proyectoDocRef, {
                            descripcion: nuevaDescripcion
                        });
                        console.log("Descripción actualizada de forma compartida.");
                    } catch (error) {
                        console.error("Error al actualizar la descripción:", error);
                    }
                }, 500);
            });
        }

    } catch (error) {
        console.error("Error al cargar la vista del alumno:", error);
    }
});