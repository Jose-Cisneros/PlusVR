import 'dotenv/config';
import App from './app';
import IndexController from './controllers/indexController';
import MedicController from './controllers/medicController';
import validateEnv from './utils/validateEnv';
import PatientController from './controllers/patientController';
import AppointmentController from './controllers/appointmentController';

validateEnv();


const app = new App(
  [new IndexController(), new MedicController(), new PatientController(), new AppointmentController()], 3000);

app.listen();
