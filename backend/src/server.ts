import express from 'express';
import cors from 'cors';
import routes from './routes';
import sequelize from './database/connection';
import './models'; // Import models to register them

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(routes);

// Sync Database and Start Server
const startServer = async () => {
  try {
    // In production, use migrations instead of sync({ force: true/alt })
    // For this challenge/prototype, sync() is acceptable but let's be careful not to drop data every time unless asked
    await sequelize.authenticate();
    console.log('Database connected.');
    
    // Sync models with DB. 
    // alter: true tries to match DB to models without dropping tables.
    await sequelize.sync({ alter: true }); 
    console.log('Models synchronized.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
