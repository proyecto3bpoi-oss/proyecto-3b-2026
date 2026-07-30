  /*Importaciones */
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
  import 
  {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    sendEmailVerification,
    signOut,
    deleteUser
  } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

  import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    getDoc,
    query,
    where,
    onSnapshot, 
    serverTimestamp,
    orderBy,
    updateDoc,
    arrayUnion,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyAI7XNgCpo6tRKEi6JYwg8tdXJhyXcybwE",
    authDomain: "proyecto-3b-2026.firebaseapp.com",
    projectId: "proyecto-3b-2026",
    storageBucket: "proyecto-3b-2026.firebasestorage.app",
    messagingSenderId: "172793924755",
    appId: "1:172793924755:web:08f21af18e295dab529166"
  };


  /*Constantes */
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore(app);
  let restaurandoSesion = false;

  /*Funciones a Exportar */

export async function FallaUser(loginUrl = "../../Login/www/Login.HTML") {

    const auth = getAuth();

    await auth.authStateReady();

    if (!auth.currentUser) {
        console.warn("Acceso denegado. Redirigiendo a login...");
        window.location.href = loginUrl;
        return;
    }

    console.log(
        "Sesión activa confirmada para el usuario:",
        auth.currentUser.uid
    );
}


export function CerrarSesion(loginUrl = "../../Login/www/Login.HTML") {
  console.log("loginUrl:", loginUrl);

    const auth = getAuth();

    signOut(auth)
        .then(() => {
            console.log("Sesión cerrada correctamente.");
            window.location.href = loginUrl;
        })
        .catch((error) => {
            console.error("Error al cerrar sesión:", error);
        });
}

export async function CrearEvento(titulo, descripcion) {
await addDoc(
    collection(db,"eventos"),
    {
        titulo: titulo
    }
);
}

export async function ObtenerEventos() {

    const consulta = await getDocs(collection(db, "eventos"));

    const eventos = [];

    consulta.forEach((doc) => {

        eventos.push({
            id: doc.id,
            ...doc.data()
        });

    });

    return eventos;
}

export async function EliminarEvento(id) {

    await deleteDoc(doc(db, "eventos", id));

}
export async function ObtenerEvento(id) {
       const documento = await getDoc(doc(db, "eventos", id));

    return documento.data();

}

/**
 * NOTA DE NUEVA FUNCIÓN: CrearMaestro
 * Esta función registra un usuario en Firebase Auth usando su correo y una contraseña genérica temporal.
 * Posteriormente, guarda un documento en la colección 'maestros' de Firestore con el nombre, correo y rol ('maestro').
 */
export async function CrearMaestro(nombre, correo, eventoId) {

    const passwordTemporal = "Maestro2026*";

    // Crear usuario en Authentication
    const credenciales = await createUserWithEmailAndPassword(
        auth,
        correo,
        passwordTemporal
    );

    // Guardar información en Firestore
    await addDoc(collection(db, "maestros"), {
        nombre,
        correo,
        rol: "maestro",
        uid: credenciales.user.uid,
        eventoId
    });

    console.log("Después de crear:", auth.currentUser?.email);
    restaurandoSesion = true;
    await signOut(auth);

    console.log("Después de cerrar sesión:", auth.currentUser);

    // Volver a iniciar sesión como supervisor
    await signInWithEmailAndPassword(
        auth,
        "proyecto.3b.poi@gmail.com",
        "proyecto123"
    );
    console.log("Después de iniciar supervisor:", auth.currentUser?.email);
    restaurandoSesion = false;

    // Enviar correo de notificación

}


export async function CrearAlumno(correo, maestroUID, proyectoId) {

    const passwordAlumno = "Alumno2026*";
    const passwordMaestro = "Maestro2026*";
    // Obtener el correo del maestro
    const consulta = query(
        collection(db, "maestros"),
        where("uid", "==", maestroUID)
    );

    const resultado = await getDocs(consulta);

    if (resultado.empty) {
        throw new Error("No se encontró el maestro.");
    }

    const correoMaestro = resultado.docs[0].data().correo;

    // Crear alumno
    const credenciales = await createUserWithEmailAndPassword(
        auth,
        correo,
        passwordAlumno
    );

    // Cerrar sesión del alumno
    restaurandoSesion = true;

    await signOut(auth);

    // Restaurar sesión del maestro
    await signInWithEmailAndPassword(
    auth,
    correoMaestro,
    passwordMaestro
    );

    console.log(
    "Usuario restaurado:",
    auth.currentUser?.email
    );

    restaurandoSesion = false;

    await updateDoc(
    doc(db, "proyectos", proyectoId),
    {
        alumnos: arrayUnion(credenciales.user.uid)
    }
    );

    await setDoc(
    doc(db, "alumnos", credenciales.user.uid),
    {
        uid: credenciales.user.uid,
        correo: correo,
        proyectoId: proyectoId,
        maestroUID: maestroUID,
        fechaCreacion: serverTimestamp()
    }
    );

    return {
        uid: credenciales.user.uid,
        correo
    };

}

/**
 * NOTA DE NUEVA FUNCIÓN: ObtenerMaestros
 * Recupera todos los documentos almacenados en la colección 'maestros' de Firestore para poder listarlos de manera dinámica.
 */
export async function ObtenerMaestros(eventoId) {

    const consulta = await getDocs(

        query(
            collection(db, "maestros"),
            where("eventoId", "==", eventoId)
        )

    );

    const maestros = [];

    consulta.forEach((doc) => {

        maestros.push({

            id: doc.id,

            ...doc.data()

        });

    });

    return maestros;

}

export async function ObtenerProyectos(eventoId) {
    // 1. Conseguir primero los maestros asignados a este evento
    const listaMaestros = await ObtenerMaestros(eventoId);
    
    // Si no hay maestros creados aún en este evento, no pueden existir proyectos enlazados
    if (listaMaestros.length === 0) {
        return [];
    }

    // 2. Extraer una lista pura con los uids de los maestros
    const uidsMaestros = listaMaestros.map(m => m.uid).filter(uid => uid !== undefined);
    
    if (uidsMaestros.length === 0) {
        return [];
    }

    // 3. Realizar la consulta buscando proyectos que pertenezcan a los UIDs recolectados
    const consultaProyectos = await getDocs(
        query(
            collection(db, "proyectos"),
            where("maestroUID", "in", uidsMaestros)
        )
    );

    const proyectos = [];
    consultaProyectos.forEach((doc) => {
        proyectos.push({
            id: doc.id,
            ...doc.data()
        });
    });

    return proyectos;
}

export async function ObtenerEvaluacion(alumnoUID, proyectoId) {

    try {

        // Crear ID único de la evaluación
        const evaluacionId = `${alumnoUID}_${proyectoId}`;

        // Referencia al documento
        const evaluacionRef = doc(
            db,
            "evaluaciones",
            evaluacionId
        );

        // Buscar documento
        const evaluacionSnap = await getDoc(
            evaluacionRef
        );


        // Verificar si existe
        if (evaluacionSnap.exists()) {

            console.log(
                "La evaluación ya existe."
            );

            return {
                existe: true,
                id: evaluacionId,
                datos: evaluacionSnap.data()
            };

        }


        // Si no existe
        console.log(
            "El alumno todavía no ha realizado la evaluación."
        );

        return {
            existe: false,
            id: evaluacionId,
            datos: null
        };


    } catch (error) {

        console.error(
            "Error al obtener la evaluación:",
            error
        );

        throw error;

    }

}

export async function GuardarEvaluacion(
    alumnoUID,
    maestroUID,
    proyectoId,
    respuestas,
    comentario,
    promedio
) {

    try {

        // Crear un ID único para la evaluación
        const evaluacionId = `${alumnoUID}_${proyectoId}`;


        // Referencia al documento de evaluación
        const evaluacionRef = doc(
            db,
            "evaluaciones",
            evaluacionId
        );


        // Comprobar si ya existe una evaluación
        const evaluacionSnap = await getDoc(
            evaluacionRef
        );


        // Datos que se van a guardar
        const datosEvaluacion = {

            alumnoUID: alumnoUID,

            maestroUID: maestroUID,

            proyectoId: proyectoId,

            respuestas: respuestas,

            comentario: comentario,

            promedio: promedio,

            fechaActualizacion: serverTimestamp()

        };


        // Si la evaluación no existe
        if (!evaluacionSnap.exists()) {

            datosEvaluacion.fechaCreacion =
                serverTimestamp();

        }


        // Crear o actualizar evaluación
        await setDoc(
            evaluacionRef,
            datosEvaluacion,
            {
                merge: true
            }
        );


        console.log(
            "Evaluación guardada correctamente."
        );


        return true;


    } catch (error) {

        console.error(
            "Error al guardar la evaluación:",
            error
        );

        return false;

    }

}

/**
 * NOTA DE NUEVA FUNCIÓN: VotarProyecto
 * Incrementa dinámicamente el campo 'votos' del proyecto en 1 usando transacciones o lecturas previas en Firestore.
 * Si el campo 'votos' no existe, inicializa en 1.
 */
export async function VotarProyecto(proyectoId) {
  try {
    const proyectoRef = doc(db, "proyectos", proyectoId);
    const snap = await getDoc(proyectoRef);
    if (snap.exists()) {
      const data = snap.data();
      
      // Capturamos el total actual. Si no existe la propiedad o el objeto 'votos', por defecto es 0
      const votosActuales = (data.votos && typeof data.votos.total === 'number') ? data.votos.total : 0;
      
      // Guardamos bajo la estructura objeto requerida: { votos: { total: X } }
      await updateDoc(proyectoRef, {
        votos: {
          total: votosActuales + 1
        }
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error al emitir el voto:", error);
    return false;
  }
}

export async function EditarNombreProyecto(proyectoId, nuevoNombre) {

    try {

        const proyectoRef = doc(db, "proyectos", proyectoId);

        await updateDoc(proyectoRef, {
            nombre: nuevoNombre
        });

        console.log("Proyecto actualizado correctamente.");

    } catch (error) {

        console.error("Error al actualizar proyecto:", error);

        throw error;

    }

}

/*Exportaciones */
export
{
    app,
    auth,
    user,
    signInWithEmailAndPassword,
    db,
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    deleteUser
};

export {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
};