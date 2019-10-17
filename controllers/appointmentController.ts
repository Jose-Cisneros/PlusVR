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
    this.router.get(this.BASE_PATH + 'doctor/pending/:id', this.getPendingAppoinmentsById);
    this.router.get(this.BASE_PATH + 'doctor/approved/:id', this.getApprovedAppoinmentsById);
    this.router.post(this.BASE_PATH + 'approve/:id', this.approveAppointment);

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
    newAppointment.approved = false;

    const scheduledAppointment = new appointmentModel(newAppointment);

    scheduledAppointment.save().then(newAppointment => response.send(newAppointment));
  };

  // GET  /vr/api/appointment/doctor/:id
  private getDoctorAppoinmentsById = async (request: express.Request, response: express.Response) => {
    const id = request.params.id;
    const populated = await appointmentModel.find({doctor: id}).populate({
      path: 'patient',
      populate: {
        path:'person'
      }
    })
    
      response.send(populated);    
  }

  // GET  /vr/api/appointment/doctor/pending/:id
  private getPendingAppoinmentsById = async (request: express.Request, response: express.Response) => {
    const id = request.params.id;
    const populated = await appointmentModel.find({doctor: id, approved: false}).populate({
      path: 'patient',
      populate: {
        path:'person'
      }
    })
    
      response.send(populated);    
  }

  // GET  /vr/api/appointment/doctor/approved/:id
  private getApprovedAppoinmentsById = async (request: express.Request, response: express.Response) => {
    const id = request.params.id;
    const populated = await appointmentModel.find({doctor: id, approved: true}).populate({
      path: 'patient',
      populate: {
        path:'person'
      }
    })
    
      response.send(populated);    
  }

  // GET  /vr/api/appointment/patient/:id
  private getPatientAppoinmentsById = async (request: express.Request, response: express.Response) => {
    const id = request.params.id;
    const populated = await appointmentModel.find({patient: id}).populate({
      path: 'doctor',
      populate: {
        path:'person'
      }
    })
    
      response.send(populated);    
    };
  
  // POST /vr/api/appointment/approve/:id
  private approveAppointment = async (request: express.Request, response: express.Response) => {
  const id = request.params.id;

  appointmentModel.findById(id).then(
    model => {
      if (model.approved) {
        response.status(400).send('Turn is already approved');
      }
      model.approved = true;
      model.save();
      response.send('Turn was approved!')
    }
  )

  }
}

export default AppointmentController;
