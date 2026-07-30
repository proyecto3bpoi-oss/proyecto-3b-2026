import { db, doc, getDoc, VotarProyecto } from "../../Firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
    // NOTA DE NUEVA LÓGICA: Capturar los parámetros pasados en la URL del QR
    const parametrosURL = new URLSearchParams(window.location.search);
    const proyectoId = parametrosURL.get("id");

    if (!proyectoId) {
        document.querySelector(".contenido").innerHTML = "<h2>Error: Enlace de votación inválido o expirado.</h2>";
        return;
    }

    const labelTitulo = document.querySelector(".tituloProyecto h2");
    const labelDescripcion = document.querySelector(".descripcion p");
    const btnVotar = document.querySelector(".btnVotar");

    try {
        // Consultar a Firestore los datos del proyecto único
        const proyectoRef = doc(db, "proyectos", proyectoId);
        const proyectoSnap = await getDoc(proyectoRef);

        if (proyectoSnap.exists()) {
            const datosProyecto = proyectoSnap.data();
            
            // Asignación de datos únicos leídos dinámicamente
            if (labelTitulo) labelTitulo.textContent = datosProyecto.nombre || "Sin Título";
            if (labelDescripcion) labelDescripcion.textContent = datosProyecto.descripcion || "Sin descripción disponible.";
        } else {
            if (labelTitulo) labelTitulo.textContent = "Proyecto no encontrado";
            if (btnVotar) btnVotar.style.display = "none";
            return;
        }

        // Evento encargado del procesamiento del voto único
        if (btnVotar) {
            btnVotar.addEventListener("click", async () => {
                btnVotar.disabled = true; // Evitar spam / múltiples clics accidentales
                
                // Ejecución de la suma de puntos en la colección correspondiente
                const exito = await VotarProyecto(proyectoId);

                if (exito) {
                    // NOTA DE CAMBIO NUEVO: Redirección inmediata tras el voto a la página de rechazo/confirmación establecida
                    window.location.href = "./2-Rechazo.html";
                } else {
                    alert("Ocurrió un error al procesar el voto en Firestore. Inténtelo de nuevo.");
                    btnVotar.disabled = false;
                }
            });
        }

    } catch (error) {
        console.error("Error al cargar la plataforma de votación:", error);
    }
});