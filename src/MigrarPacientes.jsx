import { db } from "./firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const ejecutarMigracionPacientes = async () => {
  const dataset = [
    { nombre: "EVER OMAR CALDERON ORELLANA", nacimiento: "15 DE DICIEMBRE 1990", dui: "04457804-5", modalidad: "PRESENCIAL", celular: "77403452" },
    { nombre: "SANDRA GUADALUPE RIVERA PINEDA", nacimiento: "10 DE ENERO 1997", dui: "05469018-2", modalidad: "PRESENCIAL", celular: "70451102" },
    { nombre: "JOSE DANIEL SOLORZANO CHACON", nacimiento: "28 DE JUNIO 2001", dui: "02247243-3", modalidad: "PRESENCIAL", celular: "79350771" },
    { nombre: "KARLA GUADALUPE LANDAVERDE LEMUS", nacimiento: "17 DE JUNIO 2002", dui: "06381478-5", modalidad: "PRESENCIAL", celular: "64606910" },
    { nombre: "NESTOR ADONAY MENJIVAR BELTRAN", nacimiento: "5 DE AGOSTO 2003", dui: "06544038-8", modalidad: "PRESENCIAL", celular: "" },
    { nombre: "ARIANNA BERSABETH ALAS HERNANDEZ", nacimiento: "7 DE JULIO 1993", dui: "04860062-4", modalidad: "PRESENCIAL", celular: "76705444" },
    { nombre: "JENNIFER MICHELLE CRUZ GARCIA", nacimiento: "6 DE JULIO 1999", dui: "05902420-5", modalidad: "PRESENCIAL", celular: "70970482" },
    { nombre: "YESENIA CAROLINA GUEVARA DE GUARDADO", nacimiento: "16 DE ENERO 1990", dui: "04216262-3", modalidad: "PRESENCIAL", celular: "70874347" },
    { nombre: "MARJORIE DENNISE LOPEZ", nacimiento: "5 DE JULIO 1996", dui: "05375796-5", modalidad: "PRESENCIAL", celular: "72656850" },
    { nombre: "MANUEL JOSE LOPEZ ABARCA", nacimiento: "10 DE OCTUBRE 1990", dui: "04306431-0", modalidad: "PRESENCIAL", celular: "78879747" },
    { nombre: "ALEJANDRA ABIGAIL DIAZ", nacimiento: "29 DE SEPTIEMBRE 1999", dui: "05925410-1", modalidad: "PRESENCIAL", celular: "79691249" },
    { nombre: "BERTHA POSADA DE RIVAS", nacimiento: "28 DE NOVIEMBRE 1997", dui: "05626105-2", modalidad: "PRESENCIAL", celular: "72352158" },
    { nombre: "KEVIN RIVAS", nacimiento: "23 DE MARZO 1997", dui: "05505416-9", modalidad: "PRESENCIAL", celular: "62097179" }
  ];

  console.log("Iniciando migración masiva a Firestore...");
  
  try {
    const columnaRef = collection(db, "pacientes");
    for (const paciente of dataset) {
      await addDoc(columnaRef, {
        ...paciente,
        estado: "ACTIVO",
        fechaCreacion: serverTimestamp()
      });
      console.log(`✅ Registrado con éxito: ${paciente.nombre}`);
    }
    alert("¡Migración completada con éxito! Todos los pacientes están en tu Firestore.");
  } catch (error) {
    console.error("Error durante la inserción en la base de datos:", error);
    alert("Ocurrió un fallo en la migración.");
  }
};