// Archivo de índice para pruebas unitarias del dominio
// Este archivo importa todas las pruebas del dominio para facilitar la ejecución

// Importar todas las pruebas del dominio
import './entities/User.test';
import './aggregates/AggregateRoot.test';
import './events/DomainEvent.test';
import './events/UserEvents.test';
import './events/EventBus.test';
import './services/UserService.test';
import './repositories/BaseRepository.test';

// Este archivo no contiene pruebas, solo importa las pruebas existentes
// para facilitar la ejecución de todas las pruebas del dominio juntas 