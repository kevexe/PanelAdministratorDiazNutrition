import { db } from '../firebase/config'; // Asegúrate de tener tu config de firebase
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/config';
import { AgendaEvent } from '../types/agenda';

const COLLECTION_NAME = 'agenda';

export const agendaService = {
  // Crear nuevo compromiso
  crearEvento: async (evento: Omit<AgendaEvent, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => {
    const timestamp = Date.now();
    return await addDoc(collection(db, COLLECTION_NAME), {
      ...evento,
      fechaCreacion: timestamp,
      fechaActualizacion: timestamp,
    });
  },

  // Actualizar compromiso (Ej: Drag & Drop o Formulario)
  actualizarEvento: async (id: string, data: Partial<AgendaEvent>) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    return await updateDoc(docRef, {
      ...data,
      fechaActualizacion: Date.now()
    });
  },

  // Eliminar compromiso
  eliminarEvento: async (id: string) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    return await deleteDoc(docRef);
  },

  // Escuchar eventos en tiempo real (Suscripción)
  suscribirEventos: (nutricionistaId: string, callback: (eventos: AgendaEvent[]) => void) => {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('nutricionistaId', '==', nutricionistaId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const eventos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AgendaEvent[];
      callback(eventos);
    });
  }
};