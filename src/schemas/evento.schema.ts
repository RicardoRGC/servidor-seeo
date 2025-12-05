import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventoDocument = HydratedDocument<Evento>;

@Schema({ timestamps: true }) // Crea automáticamente 'createdAt' y 'updatedAt'
export class Evento {
  
  @Prop({ required: true })
  numeroEvento: number;

  @Prop({ required: true })
  datosOriginales: string; // Aquí guardamos todo: "M [2025/...] 10 0A..."

  @Prop({ index: true }) 
  fechaProcesada: Date; // Aquí se guardará la fecha extraída para poder filtrarla
}

export const EventoSchema = SchemaFactory.createForClass(Evento);

// --- MAGIA: Hook "pre-save" ---
// Antes de guardar (save), buscamos si hay una fecha entre corchetes y la extraemos.
EventoSchema.pre('save', function(next) {
  const evento = this; // 'this' es el documento que se va a guardar

  if (evento.datosOriginales) {
    // Buscamos el patrón: [YYYY/MM/DD HH:MM:SS]
    // Explicación Regex: \[ (corchete) + dígitos y barras + espacio + hora + \] (corchete)
    const regexFecha = /\[(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})\]/;
    const coincidencia = evento.datosOriginales.match(regexFecha);

    if (coincidencia && coincidencia[1]) {
      // Si encontramos la fecha, la convertimos a objeto Date real
      // Reemplazamos las barras / por guiones - para asegurar compatibilidad con Date()
      const fechaString = coincidencia[1].replace(/\//g, '-');
      evento.fechaProcesada = new Date(fechaString);
      console.log(`📅 Fecha extraída y guardada: ${evento.fechaProcesada}`);
    } else {
      // Si no viene fecha (ej: datos viejos), usamos la fecha actual del servidor
      evento.fechaProcesada = new Date();
    }
  }
  
  next(); // Continuar con el guardado
});