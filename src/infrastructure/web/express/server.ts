import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import AuthRouter from '../../../interfaces/routes/AuthRouter';
import KycRouter from '../../../interfaces/routes/KycRouter';
import UserRouter from '../../../interfaces/routes/UserRouter';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 4000;
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb+srv://JeshuaMR:JeshuaMR@cuatrifj.ejyg1tv.mongodb.net/';

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/kyc', KycRouter);
app.use('/api/v1/users', UserRouter);

// Swagger
const swaggerDocument = YAML.load('docs/openapi.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Conexión a MongoDB y arranque del servidor
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
      console.log(`Swagger disponible en http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err);
  }); 