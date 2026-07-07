import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "./firebase"; // Asegúrate de que esta ruta apunte a tu archivo de configuración de Firebase

/**
 * Guarda o actualiza el plan nutricional de un usuario específico.
 * @param {string} usuarioId - El ID del documento en Firebase (ej. A77G9CvTQ...)
 * @param {object} planData - El objeto completo del plan (Desayuno, Almuerzo, etc.)
 * @param {object} macrosTotales - Los totales calculados (Kcal, Proteínas, etc.)
 */
export const publicarPlanNutricional = async (usuarioId, planData, macrosTotales) => {
  try {
    const usuarioRef = doc(db, "usuarios", usuarioId);

    // Creamos el objeto del plan con un timestamp para el historial
    const nuevoPlan = {
      fechaCreacion: new Date().toISOString(),
      estructura: planData,
      macrosObjetivo: macrosTotales,
      estado: "activo"
    };

    // Actualizamos el documento del usuario
    await updateDoc(usuarioRef, {
      // Guardamos el plan actual para fácil acceso
      planActual: nuevoPlan,
      // Opcional: Guardamos un historial de planes usando arrayUnion
      historialPlanes: arrayUnion(nuevoPlan) 
    });

    return { success: true, message: "Plan publicado exitosamente" };
  } catch (error) {
    console.error("Error al publicar el plan en Firebase:", error);
    return { success: false, error };
  }
};