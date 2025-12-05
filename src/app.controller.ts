import { Get, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { Body, Controller, Post, Headers, Logger } from '@nestjs/common';
@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}
private readonly logger = new Logger(AppController.name);
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('login')
  login(@Body() body: any) {
    this.logger.log('--- Intento de Login recibido ---');
    this.logger.log(`Usuario: ${body.username}`);
    this.logger.log(`Password: ${body.password}`);

    // Validamos "quemado" lo que envía tu ESP8266 para simular la realidad
    if (body.username === 'formacionXX' && body.password === '@proyectoEventosATP188') {
      this.logger.log('✅ Login Exitoso. Enviando token...');
      return {
        token: 'token_de_prueba_generado_localmente_12345',
      };
    } else {
      this.logger.warn('❌ Credenciales incorrectas');
      return { error: 'Credenciales invalidas' }; 
    }
  }

  // 2. Endpoint de EVENTOS
  @Post('event')
  @HttpCode(200) // IMPORTANTE: El ESP espera un 200, no un 201
  async recibirEventos(@Body() body: any) {
    
    // 1. Extraemos los datos que envía el ESP
    // Vienen como strings porque es x-www-form-urlencoded
    const rawNumero = body.numeroEvento; 
    const datosRaw = body.datos;

    this.logger.log(`📨 Recibiendo paquete... Evento Nº: ${rawNumero}`);

    // 2. Convertimos el numeroEvento a entero (Number)
    const numeroEvento = parseInt(rawNumero, 10);

    if (isNaN(numeroEvento) || !datosRaw) {
      this.logger.error('⚠️ Datos incompletos o corruptos recibidos del ESP');
      return { status: 'Error', message: 'Datos inválidos' };
    }

    // 3. Llamamos al servicio para guardar en Mongo
    try {
      await this.appService.guardarEvento(numeroEvento, datosRaw);
      
      // 4. Respondemos al ESP
      return { 
        status: 'OK', 
        message: 'Guardado correctamente' 
      };
      
    } catch (error) {
      this.logger.error(`❌ Error al guardar en DB: ${error.message}`);
      // Aunque falle la DB, a veces conviene responder OK al ESP para que no se cicle, 
      // pero por ahora devolvemos error 500 (automático de Nest) para que reintente.
      throw error; 
    }
  }
}
