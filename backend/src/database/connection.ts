import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'takeat_db',
  process.env.DB_USERNAME || 'postgres', // <--- Corrigido para bater com o .env
  process.env.DB_PASSWORD || 'postgres', // <--- Corrigido para bater com o .env
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432, // <--- ADICIONADO: Sem isso ele ignora a porta 5433
    dialect: 'postgres',
    logging: false, 
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

export default sequelize;