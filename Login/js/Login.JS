import { auth,signInWithEmailAndPassword, db, doc, getDoc, signOut } from "../../Firebase.js";

// =======================
// Botones principales
// =======================

const btnSupervisor = document.querySelector("#btnSupervisor");
const btnMaestro = document.querySelector("#btnMaestro");
const btnAlumno = document.querySelector("#btnAlumno");


// =======================
// Dialogs
// =======================

const dialogSupervisor = document.querySelector("#dialogSupervisor");
const dialogMaestro = document.querySelector("#dialogMaestro");
const dialogAlumno = document.querySelector("#dialogAlumno");


// =======================
// Botones Supervisor
// =======================

const cancelarSupervisor = document.querySelector("#cancelarSupervisor");
const entrarSupervisor = document.querySelector("#entrarSupervisor");

const correoSupervisor = document.querySelector("#correoSupervisor");
const passwordSupervisor = document.querySelector("#passwordSupervisor");


// =======================
// Botones Maestro
// =======================

const cancelarMaestro = document.querySelector("#cancelarMaestro");
const entrarMaestro = document.querySelector("#entrarMaestro");

const correoMaestro = document.querySelector("#correoMaestro");


// =======================
// Botones Alumno
// =======================

const cancelarAlumno = document.querySelector("#cancelarAlumno");
const entrarAlumno = document.querySelector("#entrarAlumno");

const correoAlumno = document.querySelector("#correoAlumno");


// ======================================================
// ABRIR DIALOGS
// ======================================================

btnSupervisor.addEventListener("click", function () {

    dialogSupervisor.showModal();

});

btnMaestro.addEventListener("click", function () {

    dialogMaestro.showModal();

});

btnAlumno.addEventListener("click", function () {

    dialogAlumno.showModal();

});


// ======================================================
// CERRAR DIALOGS
// ======================================================

cancelarSupervisor.addEventListener("click", function () {

    dialogSupervisor.close();

});

cancelarMaestro.addEventListener("click", function () {

    dialogMaestro.close();

});

cancelarAlumno.addEventListener("click", function () {

    dialogAlumno.close();

});


// ======================================================
// SUPERVISOR
// ======================================================

entrarSupervisor.addEventListener("click", async function () {

    const correo = correoSupervisor.value.trim();
    const password = passwordSupervisor.value;

    if (correo === "" || password === "") {

        alert("Ingrese el correo y la contraseña.");
        return;

    }

    try {

        await signInWithEmailAndPassword(
            auth,
            correo,
            password
        );

        if (
            auth.currentUser.uid !==
            "Riz7qS9NlTbA5JnLVJF2OICAlrw1"
        ) {

            await signOut(auth);

            alert("Este usuario no es el supervisor.");

            return;

        }

        window.location.href =
        "../../../Supervisor/www/1-Evento.html";

    }
    catch (error) {

        console.error(error);

        alert("No se pudo iniciar sesión.");

    }

});


// ======================================================
// MAESTRO
// ======================================================

entrarMaestro.addEventListener("click", function () {

    async function LoginMaestro()
{
    const correo = correoMaestro.value.trim();

    if (correo === "")
    {
        alert("Ingrese un correo.");
        return;
    }

    try
    {
        await signInWithEmailAndPassword(
            auth,
            correo,
            "Maestro2026*"
        );

        window.location.href =
        "../../../Maestro/www/1-dashboard-lleno.html";
    }
    catch(error)
    {
        console.error(error);
        alert("No se pudo iniciar sesión.");
    }
}
LoginMaestro();

});


// ======================================================
// ALUMNO
// ======================================================

entrarAlumno.addEventListener("click", function () {

    async function LoginAlumno()
    {
        const correo = correoAlumno.value.trim();

        if (correo === "")
        {
            alert("Ingrese un correo.");
            return;
        }

        try
        {
            await signInWithEmailAndPassword(
                auth,
                correo,
                "Alumno2026*"
            );

            window.location.href =
            "../../../Alumno/www/1-alumnos.html";
        }
        catch(error)
        {
            console.error(error);
            alert("No se pudo iniciar sesión.");
        }
    }

    LoginAlumno();

});


// ======================================================
// CERRAR DIALOG SI SE HACE CLICK FUERA
// ======================================================

function cerrarFuera(dialog) {

    dialog.addEventListener("click", function (event) {

        const rect = dialog.getBoundingClientRect();

        const dentro =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;

        if (!dentro) {

            dialog.close();

        }

    });

}

cerrarFuera(dialogSupervisor);
cerrarFuera(dialogMaestro);
cerrarFuera(dialogAlumno);