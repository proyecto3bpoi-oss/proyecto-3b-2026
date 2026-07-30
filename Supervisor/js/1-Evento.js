import { FallaUser,CerrarSesion,CrearEvento,ObtenerEventos,EliminarEvento } from "../../Firebase.js";
await FallaUser();


const btnCrear = document.getElementById('btnCrear');
const modalOverlay = document.getElementById('modalOverlay');
const btnCancelar = document.getElementById('btnCancelar');
const btnGuardar = document.getElementById('btnGuardar');
const eventNameInput = document.getElementById('eventNameInput');
const eventsContainer = document.getElementById('eventsContainer');
const btnSalir = document.getElementById("btnSalir");
const btnEliminar = document.getElementById("btnEliminar");

let modoEliminar = false;


async function MostrarEventos() {
        // Obtener todos los eventos de Firestore
    const eventos = await ObtenerEventos();

    // Limpiar el contenedor para no duplicar tarjetas
    eventsContainer.innerHTML = "";

    // Recorrer todos los eventos
    eventos.forEach((evento) => {

        // Crear la tarjeta
        const newCard = document.createElement("div");
        newCard.classList.add("event-card");

        // Mostrar el título del evento
        newCard.textContent = evento.titulo;
        // Estilo visual de puntero para que el usuario sepa que es clickeable
        newCard.style.cursor = "pointer";
         // Eliminar si está activado el modo eliminar
        newCard.addEventListener("click", async () => {

            if (modoEliminar) {

            const confirmar = confirm(
                `¿Deseas eliminar "${evento.titulo}"?`
            );

            if (!confirmar) return;

            await EliminarEvento(evento.id);

            modoEliminar = false;

            MostrarEventos();
            return;
            }
            window.location.href = `2-index.html?id=${evento.id}`;


        });

        // Agregar la tarjeta al contenedor
        eventsContainer.appendChild(newCard);
        
        

    });

}

//eliminar
btnEliminar.addEventListener("click", () => {

    modoEliminar = true;

    alert("Selecciona el evento que deseas eliminar.");

});

btnCrear.addEventListener('click', () => {
    modalOverlay.classList.add('active');
    eventNameInput.focus();
});


const closeModal = () => {
    modalOverlay.classList.remove('active');
    eventNameInput.value = ''; 
};

btnCancelar.addEventListener('click', closeModal);


btnGuardar.addEventListener('click', async () => {

    const nombreEvento = eventNameInput.value.trim();

    if (nombreEvento === "") {
        alert("Por favor, ingresa un nombre válido.");
        return;
    }

    try {

        // Guarda el evento en Firebase
        await CrearEvento(nombreEvento);

        
        

        closeModal();

        MostrarEventos();

    } catch (error) {
    console.error(error);
    alert(error.message);
}

});


modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

btnSalir.addEventListener("click",()=>{
    window.location.href = "../../Login/www/Login.HTML";
})
MostrarEventos();