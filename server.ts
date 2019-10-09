import 'dotenv/config';
import App from './app';
import IndexController from './controllers/indexController';
import MedicController from './controllers/medicController';
import validateEnv from './utils/validateEnv';

validateEnv();


const app = new App(
  [new IndexController(), new MedicController()], 3000);

app.listen();
