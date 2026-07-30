import { auth, db, doc, getDoc, FallaUser, CerrarSesion } from "../../Firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
    // Seguridad y validación de sesión
    await FallaUser("../../../Login/www/Login.HTML");
    
    const usuarioActual = auth.currentUser;
    if (!usuarioActual) return;

    const btnVolver = document.querySelector(".btn-volver");
    if (btnVolver) {
        btnVolver.addEventListener("click", () => {
            window.location.href = "./1-alumnos.html";
        });
    }

    // Listener para el botón superior "Salir"
    const btnSalir = document.querySelector(".btn-logout");
    if (btnSalir) {
        btnSalir.addEventListener("click", () => {
            CerrarSesion("../../../Login/www/Login.HTML");
        });
    }

    try {
        // Obtener el ID del proyecto asociado al alumno
        const alumnoDocRef = doc(db, "alumnos", usuarioActual.uid);
        const alumnoSnap = await getDoc(alumnoDocRef);

        if (!alumnoSnap.exists()) {
            console.error("No se encontró el perfil del alumno.");
            return;
        }

        const proyectoId = alumnoSnap.data().proyectoId;
        if (!proyectoId) {
            alert("No tienes un proyecto asignado todavía.");
            return;
        }

        // Construir la URL absoluta o relativa a la que apuntará el QR
        // NOTA DE CAMBIO NUEVO: Redirección dinámica hacia 1-votacion.html inyectando el ID por QueryString Parámetros
        const urlVotacion = `${window.location.origin}/Votacion/www/1-votacion.html?id=${proyectoId}`;

        // Limpiar contenedor previo e instanciar QR
        const contenedorQR = document.getElementById("qrcode");
        contenedorQR.innerHTML = "";

        const qrGenerador = new QRCode(contenedorQR, {
            text: urlVotacion,
            width: 550,
            height: 550,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // Configurar la descarga de la imagen QR generada
        const btnDescarga = document.getElementById("btn-descarga");
        if (btnDescarga) {
            btnDescarga.addEventListener("click", () => {
                const imgQR = contenedorQR.querySelector("img");
                if (imgQR) {
                    const enlace = document.createElement("a");
                    enlace.href = imgQR.src;
                    enlace.download = `QR_Proyecto_${proyectoId}.png`;
                    enlace.click();
                } else {
                    alert("El código QR aún se está procesando, por favor reintente.");
                }
            });
        }

    } catch (error) {
        console.error("Error al procesar el código QR dinámico:", error);
    }
});