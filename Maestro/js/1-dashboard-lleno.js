import {
    auth,
    db,
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp,
    query,
    where,
    CerrarSesion,
    CrearAlumno,
    EditarNombreProyecto
} from "../../Firebase.js";

const btnNuevoProyecto = document.getElementById("btnNuevoProyecto");
const modalNuevoProyecto = document.getElementById("modalNuevoProyecto");
const btnCancelar = document.getElementById("btnCancelar");
const btnGuardarProyecto = document.getElementById("btnGuardarProyecto");
const inputNombreProyecto = document.getElementById("nombreProyecto");
const listaProyectosContainer = document.getElementById("listaProyectos");
const btnSalir = document.getElementById("btnSalir");
const btnAsignarAlumnos = document.getElementById("btnAsignarAlumnos");
const modalAsignarAlumno = document.getElementById("modalAsignarAlumno");
const btnAsignarAlumno = document.getElementById("btnAsignarAlumno");
const btnCancelarAsignacion = document.getElementById("btnCancelarAsignacion");
const inputCorreoAlumno = document.getElementById("correoAlumno");
const inputProyectoAlumno = document.getElementById("proyectoAlumno");
const btnEditar = document.getElementById("btnEliminar");
const modalEditarProyecto = document.getElementById("modalEditarProyecto");
const selectProyectoEditar = document.getElementById("selectProyectoEditar");
const txtNombreProyecto = document.getElementById("txtNombreProyecto");
const btnGuardarEditar = document.getElementById("btnGuardarEditar");
const btnCancelarEditar = document.getElementById("btnCancelarEditar");

/** */
function abrirModal() {

    modalNuevoProyecto.showModal();

}

function cerrarModal() {

    modalNuevoProyecto.close();

    inputNombreProyecto.value = "";

}

function abrirModalAsignacion() {

    modalAsignarAlumno.showModal();

}

function cerrarModalAsignacion() {

    modalAsignarAlumno.close();

    inputCorreoAlumno.value = "";
    inputProyectoAlumno.value = "";

}

async function guardarProyecto() {

    console.log("Entró a guardarProyecto");

    const nombreProyecto = inputNombreProyecto.value.trim();

    if (nombreProyecto === "") {
        alert("Escribe un nombre para el proyecto.");
        return;
    }

    try {

        await addDoc(collection(db, "proyectos"), {

            // Información básica
            nombre: nombreProyecto,
            descripcion: "",

            // Maestro responsable
            maestroUID: auth.currentUser.uid,
            maestroCorreo: auth.currentUser.email,


            // Código QR
            qr: "",
            urlQR: "",

            // Integrantes
            alumnos: [],

            // Votación
            votos: {
                total: 0
            },

            // Evaluación
            evaluacion: {
                promedio: 0
            },

            // Fechas
            fechaCreacion: serverTimestamp(),
            fechaActualizacion: serverTimestamp()

        });

        cerrarModal();

    }
    catch (error) {

        console.error("Error al guardar el proyecto:", error);
        alert("No fue posible crear el proyecto.");

    }

}

async function asignarAlumno() {

    const correo = inputCorreoAlumno.value.trim();

    const proyectoId = inputProyectoAlumno.value;


    if (correo === "") {

        alert("Escribe el correo del alumno.");
        return;

    }


    if (proyectoId === "") {

        alert("Selecciona un proyecto.");
        return;

    }


    try {

        const alumno = await CrearAlumno(
            correo,
            auth.currentUser.uid,
            proyectoId
        );


        console.log("Alumno creado:", alumno);


        cerrarModalAsignacion();


    }
    catch(error) {

        console.error("Error al crear alumno:", error);

        alert("No fue posible crear el alumno.");

    }

}

function cargarProyectos(proyectosRef) {

    onSnapshot(proyectosRef, (snapshot) => {

        listaProyectosContainer.innerHTML = "";

        cargarSelectProyectos(snapshot);

        snapshot.forEach((doc) => {

            const datos = doc.data();

            const tarjetaProyecto = document.createElement("a");

            tarjetaProyecto.href = `../www/2-detalleProyecto.html?id=${doc.id}`;

            tarjetaProyecto.className = "tarjeta-proyecto interactiva";

            tarjetaProyecto.textContent = datos.nombre;

            listaProyectosContainer.appendChild(tarjetaProyecto);

        });

    }, (error) => {

        console.error("Error al cargar los proyectos:", error);

    });

}

function cargarSelectProyectos(snapshot) {

    // -------- Asignar alumnos --------

    inputProyectoAlumno.innerHTML = "";

    const opcionInicial = document.createElement("option");

    opcionInicial.value = "";
    opcionInicial.textContent = "Selecciona un proyecto";

    inputProyectoAlumno.appendChild(opcionInicial);


    // -------- Editar proyecto --------

    selectProyectoEditar.innerHTML = "";

    const opcionInicialEditar = document.createElement("option");

    opcionInicialEditar.value = "";
    opcionInicialEditar.textContent = "Selecciona un proyecto";

    selectProyectoEditar.appendChild(opcionInicialEditar);


    snapshot.forEach((doc) => {

        const datos = doc.data();

        // Select de asignar alumnos
        const opcion = document.createElement("option");

        opcion.value = doc.id;
        opcion.textContent = datos.nombre;

        inputProyectoAlumno.appendChild(opcion);


        // Select de editar proyecto
        const opcionEditar = document.createElement("option");

        opcionEditar.value = doc.id;
        opcionEditar.textContent = datos.nombre;

        selectProyectoEditar.appendChild(opcionEditar);

    });

}

btnNuevoProyecto.addEventListener("click", abrirModal);

btnAsignarAlumnos.addEventListener( "click", abrirModalAsignacion );

btnCancelarAsignacion.addEventListener("click", cerrarModalAsignacion );

btnAsignarAlumno.addEventListener("click", asignarAlumno);

btnCancelar.addEventListener("click", cerrarModal);

btnGuardarProyecto.addEventListener("click", guardarProyecto);

async function iniciarDashboard() {

    await auth.authStateReady();

    const user = auth.currentUser;


    if (!user) {

        console.warn("Acceso denegado.");

        window.location.href = "../../Login/www/Login.html";

        return;

    }


    console.log("Maestro autenticado:", user.email);


    const proyectosRef = query(
        collection(db, "proyectos"),
        where("maestroUID", "==", user.uid)
    );


    cargarProyectos(proyectosRef);

}

async function guardarEdicion() {

    const proyectoId = selectProyectoEditar.value;
    const nuevoNombre = txtNombreProyecto.value.trim();

    if (proyectoId === "") {
        alert("Selecciona un proyecto.");
        return;
    }

    if (nuevoNombre === "") {
        alert("Escribe el nuevo nombre.");
        return;
    }

    await EditarNombreProyecto(
        proyectoId,
        nuevoNombre
    );

    txtNombreProyecto.value = "";
    selectProyectoEditar.selectedIndex = 0;

    modalEditarProyecto.close();

}


iniciarDashboard();

btnSalir.addEventListener("click", () => {
    CerrarSesion();
});

btnEditar.addEventListener("click", function () {
    modalEditarProyecto.showModal();
});



btnGuardarEditar.addEventListener("click", guardarEdicion);

btnCancelarEditar.addEventListener("click", cerrarModalEditar);

function abrirModalEditar() {
    modalEditarProyecto.showModal();
}

function cerrarModalEditar() {
    txtNombreProyecto.value = "";
    selectProyectoEditar.selectedIndex = 0;

    modalEditarProyecto.close();
}

console.log(
    "Sesión actual:",
    auth.currentUser ? auth.currentUser.email : "No hay usuario conectado"
);