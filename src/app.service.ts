import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Evento, EventoDocument } from './schemas/evento.schema';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  // Inyectamos el modelo 'Evento' para poder usarlo
  constructor(@InjectModel(Evento.name) private eventoModel: Model<EventoDocument>) {}
  getHello(): string {
    return 'Hello World!';
  }
  async guardarEvento(numeroEvento: number, datos: string): Promise<Evento> {
    
    // Creamos una nueva instancia del modelo con los datos recibidos
    const nuevoEvento = new this.eventoModel({
      numeroEvento: numeroEvento,
      datosOriginales: datos, 
      // NOTA: No enviamos 'fechaProcesada' aquí porque nuestro Schema 
      // tiene el "hook" mágico que la extrae automáticamente antes de guardar.
    });

    // Guardamos en MongoDB Atlas
    const eventoGuardado = await nuevoEvento.save();
    
    this.logger.log(`💾 Evento #${numeroEvento} guardado con éxito. ID: ${eventoGuardado._id}`);
    
    return eventoGuardado;
  }
  async obtenerTodosLosEventos(): Promise<Evento[]> {
    // .find() busca todo. .exec() ejecuta la consulta.
    // .sort({ createdAt: -1 }) es opcional: ordena del más nuevo al más viejo
    return this.eventoModel.find().sort({ createdAt: -1 }).exec();
  }
}