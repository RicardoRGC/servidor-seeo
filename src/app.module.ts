import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Evento, EventoSchema } from './schemas/evento.schema';
@Module({
  imports: [
   MongooseModule.forRoot(
      'mongodb+srv://gonzalezlaboratorio2025_db_user:lOJ2DfcK4uwfZfrO@cluster0.hrryigj.mongodb.net/?appName=Cluster0'
    ),
    
    MongooseModule.forFeature([{ name: Evento.name, schema: EventoSchema }])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
