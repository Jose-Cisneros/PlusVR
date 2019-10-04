import App from './app';
import IndexController from './controllers/indexController';
import MedicController from './controllers/medicController';
 
const app = new App(
  [
    new IndexController(),
    new MedicController()
  ],
  3000,
);
 
app.listen();