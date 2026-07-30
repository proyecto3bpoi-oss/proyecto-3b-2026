import { FallaUser,CrearMaestro, ObtenerMaestros,ObtenerEvento } from "../../Firebase.js";
await FallaUser();

const btnAsignar = document.getElementById('btnAsignar');
const modalOverlay = document.getElementById('modalOverlay');
const btnCancelar = document.getElementById('btnCancelar');
const btnGuardar = document.getElementById('btnGuardar');
const teacherNameInput = document.getElementById('teacherNameInput');
const teacherEmailInput = document.getElementById('teacherEmailInput');
const teachersContainer = document.getElementById('teachersContainer');
const eventTitleBadge = document.querySelector('.event-title-badge');
const btnBack = document.querySelector('.btn-back');
const btnProyectos = document.getElementById("btnProyectos");

const parametros = new URLSearchParams(window.location.search);

const eventoId = parametros.get("id");
const tituloEvento = document.getElementById("tituloEvento");
const evento = await ObtenerEvento(eventoId);

console.log(evento);

console.log("ID del evento:", eventoId);


// ASIGNACIÓN DINÁMICA: Mostrar el nombre del evento al que pertenece en la pantalla actual
if (evento && evento.titulo) {
    eventTitleBadge.textContent = evento.titulo;
}

btnProyectos.addEventListener("click", () => {

    window.location.href =
    `3-estadisticas4.html?id=${eventoId}`;

});

// Botón volver
if(btnBack) {
    btnBack.addEventListener('click', () => {
        window.history.back();
    });
}

// 2. Función para renderizar los maestros desde Firestore de manera dinámica
async function renderizarMaestros() {
    try {
        const listaMaestros = await ObtenerMaestros(eventoId);
        teachersContainer.innerHTML = ""; // Limpiamos la lista estática

        listaMaestros.forEach(maestro => {
            const newTeacherCard = document.createElement('div');
            newTeacherCard.classList.add('teacher-card');
            // Mostramos Nombre y Correo en la tarjeta
            newTeacherCard.textContent = `${maestro.nombre} (${maestro.correo})`;
            teachersContainer.appendChild(newTeacherCard);
        });
    } catch (error) {
        console.error("Error al traer los maestros de Firestore: ", error);
    }
}

btnAsignar.addEventListener('click', () => {
  modalOverlay.classList.add('active');
  teacherNameInput.focus();
});


const closeModal = () => {
  modalOverlay.classList.remove('active');
  teacherNameInput.value = '';
  teacherEmailInput.value = '';
};

btnCancelar.addEventListener('click', closeModal);

// 3. Manejo del guardado y asignación en Firebase
btnGuardar.addEventListener('click', async () => {
  const nombreMaestro = teacherNameInput.value.trim();
  const correoMaestro = teacherEmailInput.value.trim();

  if (nombreMaestro !== "") {
    console.log("eventoId:", eventoId);
      try {
          // Guardamos en Firebase Authentication y Firestore usando la función centralizada
          await CrearMaestro(nombreMaestro, correoMaestro.trim(),eventoId);
          
          alert("Docente creado y registrado correctamente en Firestore.");
          closeModal();
          
          // Actualizamos la lista dinámica de inmediato
          renderizarMaestros();
      } catch (error) {
          console.error(error);
          alert("Hubo un error al guardar en Firebase: " + error.message);
      }
  } else {
      alert("Por favor, ingresa el nombre de un docente válido.");
  }
});

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

btnSalir.addEventListener("click",()=>{
    window.location.href = "../../Login/www/Login.HTML";
})

// Carga inicial de los maestros guardados al abrir la página
renderizarMaestros();