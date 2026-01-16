import express from 'express';
import cors from 'cors';
import routes from './routes';
import sequelize from './database/connection';
import './models';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(routes);


const startServer = async () => {
  try {

    await sequelize.authenticate();
    console.log('Database connected.');
    

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
