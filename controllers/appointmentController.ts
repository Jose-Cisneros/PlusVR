import * as express from 'express';
import { ApiConstants } from '../helpers/constants/api.constants';
import appointmentModel from '../model/domain/appointment';

class AppointmentController {
  public router = express.Router();

  private BASE_PATH = ApiConstants.API_BASE_PATH + 'appointment/';

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(this.BASE_PATH + 'new', this.newAppointment);
    this.router.get(this.BASE_PATH + 'doctor/:id', this.getDoctorAppoinmentsById);
    this.router.get(this.BASE_PATH + 'patient/:id', this.getPatientAppoinmentsById);

  }

  //POST /vr/api/appointment/new
  /* 
  body: 
  {
      doctor_id: id,
      patient_id: id,
      date: date;
  }
  */
  private newAppointment = (request: express.Request, response: express.Response) => {
    const newAppointment = request.body;

    const scheduledAppointment = new appointmentModel(newAppointment);

    scheduledAppointment.save().then(newAppointment => response.send(newAppointment));
  };

  // GET  /vr/api/appointment/doctor/:id
  private getDoctorAppoinmentsById = (request: express.Request, response: express.Response) => {
    const id = request.params.id;
    appointmentModel.find({doctor: id}).then(appointments => {
      response.send(appointments);
    });
  }

  // GET  /vr/api/appointment/patient/:id
  private getPatientAppoinmentsById = (request: express.Request, response: express.Response) => {
    const id = request.params.id;
    appointmentModel.find({patient: id}).then(appointments => {
      response.send(appointments);    
    });
  }
}

export default AppointmentController;
