import * as express from 'express';
import { ApiConstants } from '../helpers/constants/api.constants';
import appointmentModel from '../model/domain/appointment';
import doctorModel from '../model/domain/doctor';
import { DateHelper } from '../helpers/date.helper';
import moment = require('moment');

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
    this.router.get(this.BASE_PATH + 'doctor/date/:id/:date', this.getDoctorAppointmentsByDate);
    this.router.get(this.BASE_PATH + 'doctor/:speciality/:date', this.getDoctorsAvailableForADate);
    this.router.get(this.BASE_PATH + 'doctor/available/:id/:date', this.getDoctorAvailableAppointmentsByDate);
    this.router.get(this.BASE_PATH + 'next/:id', this.getNextAvailableAppointment);
    this.router.post(this.BASE_PATH + 'approve/:id', this.approveAppointment);
    this.router.post(this.BASE_PATH + 'reject/:id', this.rejectAppointment);


  }

  //POST /vr/api/appointment/new
  /* 
  body: 
  {
      doctor_id: id,
      patient_id: id,
      date: date,
      hour: hour
  }
  */
  private newAppointment = async (request: express.Request, response: express.Response) => {
    const newAppointment = request.body;
    newAppointment.approved = false;
    newAppointment.rejected = false;
    if (DateHelper.isAfterThanToday(newAppointment.date)) {
      //check if doctor has any appointment at that time
      const appointments = await appointmentModel.find({doctor: newAppointment.doctor});
      if (appointments.find(appointment => appointment.date === newAppointment.date && appointment.hour === newAppointment.hour)) {
        response.status(400).send('Doctor already has a turn on ' + newAppointment.date + ' at ' + newAppointment.hour);
      } else {
        const dayOfWeek = DateHelper.getDayOfWeek(newAppointment.date);
        const workableWeek = await doctorModel.findById(newAppointment.doctor).populate('workableWeek.workableWeek');
        if (!!workableWeek.workableWeek.find(day => day.number === dayOfWeek)) {
          const scheduledAppointment = new appointmentModel(newAppointment);
          scheduledAppointment.save().then(newAppointment => response.send(newAppointment));
        }
        else response.status(400).send('Doctor does not work that day');

      }
    } else response.status(400).send('The date for the appointment must be after today');

   
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
    const populated = await appointmentModel.find({doctor: id, approved: false, rejected: false}).populate({
      path: 'patient',
      populate: {
        path:'person'
      }
    })
    
      response.send(populated);    
  }


    // GET /vr/api/appointment/doctor/date/:id/:date
    private getDoctorAppointmentsByDate =  async (request: express.Request, response: express.Response) => {
      const id = request.params.id;
      const date = request.params.date;
      const appointments = await this.retrieveDoctorAppointmentsByDate(id,date);
      
      response.send(appointments);    
    }

    // GET /vr/api/appointment/doctor/available/:id/:date
    private getDoctorAvailableAppointmentsByDate =  async (request: express.Request, response: express.Response) => {
      const id = request.params.id;
      const date = request.params.date;
      if (!DateHelper.isAfterThanToday(date)) {
      response.status(400).send('date is before today');
      return;
      }
      const appointments = await this.retrieveDoctorAppointmentsByDate(id,date);
      const workableWeekData = await this.retrieveWorkableWeekByDoctor(id);
      const workableDayData = workableWeekData.find( day => day.number === DateHelper.getDayOfWeek(date));
      let availables = [];
      let breakTime = [];

      if (workableDayData) {
        // Estos deberia en una funcion porque basicamente se repite lo mismo dos veces
        let initialHour = workableDayData.startHour;
        let finalHour = workableDayData.finishHour;
        let initialDate = moment(date + ' ' + initialHour +':00' , 'DD-MM-YYYY H:mm');
        let finalDate = moment(date + ' ' + finalHour +':00' , 'DD-MM-YYYY H:mm');
        while (initialDate.isBefore(finalDate)) {
          const formattedHour = initialDate.format('H:mm');
          if (!appointments.find(appointment => appointment.hour === formattedHour )) {
          availables.push(formattedHour);
          }
          initialDate = initialDate.add(30,'m');

        }

        let breakInitialHour = workableDayData.breakStart;
        let breakFinalHour = workableDayData.breakFinish;
        let breakInitialDate = moment(date + ' ' + breakInitialHour +':00' , 'DD-MM-YYYY H:mm');
        let breakFinalDate = moment(date + ' ' + breakFinalHour +':00' , 'DD-MM-YYYY H:mm');
        while (breakInitialDate.isBefore(breakFinalDate)) {
          const formattedHour = breakInitialDate.format('H:mm');
          breakTime.push(formattedHour);
          breakInitialDate = breakInitialDate.add(30,'m');
        }

        availables = availables.filter((el) => !breakTime.includes(el));

        response.send(availables);
      } else {
        response.status(400).send('Doctor does not work that week day');
        return;  
      } 
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
        response.status(400).send('Turn was already approved');
      }
      model.approved = true;
      model.save();
      response.send('Turn was approved!')
    }
  )

  }


  // POST /vr/api/appointment/reject/:id
  private rejectAppointment = async (request: express.Request, response: express.Response) => {
    const id = request.params.id;

    appointmentModel.findById(id).then(
      model => {
        if (model.rejected) {
          response.status(400).send('Turn was already rejected');
        }
        model.rejected = true;
        model.save();
        response.send('Turn was rejected!')
      }
    )

    }

    // GET /vr/api/appointment/:speciality/:date
    private getDoctorsAvailableForADate = async (request: express.Request, response: express.Response) => {
      const speciality = request.params.speciality;
      const date = request.params.date;
      const doctors = await doctorModel.find({speciality: speciality});
      let responseDoctors = await this.retrieveAvailableDoctors(doctors, date);
    
      response.send(responseDoctors);

    }

      // GET /vr/api/appointment/next/:id
      private getNextAvailableAppointment = async (request: express.Request, response: express.Response) => {
        const id = request.params.id;
        let searchDate = moment().add(1,'d').format("DD-MM-YYYY")
        let appointmentFound = false;
        while( !appointmentFound) {
          const appointments = await this.retrieveDoctorAppointmentsByDate(id,searchDate);
          const workableWeekData = await this.retrieveWorkableWeekByDoctor(id);
          const workableDayData = workableWeekData.find( day => day.number === DateHelper.getDayOfWeek(searchDate));
          let availables = [];
          let breakTime = [];
    
          if (workableDayData) {
            // Estos deberia en una funcion porque basicamente se repite lo mismo dos veces
            let initialHour = workableDayData.startHour;
            let finalHour = workableDayData.finishHour;
            let initialDate = moment(searchDate + ' ' + initialHour +':00' , 'DD-MM-YYYY H:mm');
            let finalDate = moment(searchDate + ' ' + finalHour +':00' , 'DD-MM-YYYY H:mm');
            while (initialDate.isBefore(finalDate)) {
              const formattedHour = initialDate.format('H:mm');
              if (!appointments.find(appointment => appointment.hour === formattedHour )) {
              availables.push(formattedHour);
              }
              initialDate = initialDate.add(30,'m');
    
            }
    
            let breakInitialHour = workableDayData.breakStart;
            let breakFinalHour = workableDayData.breakFinish;
            let breakInitialDate = moment(searchDate + ' ' + breakInitialHour +':00' , 'DD-MM-YYYY H:mm');
            let breakFinalDate = moment(searchDate + ' ' + breakFinalHour +':00' , 'DD-MM-YYYY H:mm');
            while (breakInitialDate.isBefore(breakFinalDate)) {
              const formattedHour = breakInitialDate.format('H:mm');
              breakTime.push(formattedHour);
              breakInitialDate = breakInitialDate.add(30,'m');
            }
    
            availables = availables.filter((el) => !breakTime.includes(el));
            if(availables.length > 0) {
              appointmentFound = true;
              response.send({ date: searchDate, hour: availables[0]}) }

        } else {
          searchDate = moment(searchDate,"DD-MM-YYYY").add(1,'d').format("DD-MM-YYYY")
        }
      }
    }

    private async retrieveAvailableDoctors(doctors, date) {
      let responseDoctors = [];
      for (const doctor of doctors){
        await this.addDoctorIfAvailable(doctor, responseDoctors, date);
      }
      return responseDoctors;
    }

    private async addDoctorIfAvailable(doctor, responseDoctors, date) {
      const workableWeekData = await this.retrieveWorkableWeekByDoctor(doctor.id);
      const workableDayData = workableWeekData.find( day => day.number === DateHelper.getDayOfWeek(date));
      if (workableDayData) {

        const appointments = await this.retrieveDoctorAppointmentsByDate(doctor.id,date);
        if (workableDayData.maxAppointments > appointments.length){
          responseDoctors.push(doctor)
        }
        
      }
    }
    
    

    //utility methods (deberian estar en otros archivos)
    private async retrieveDoctorAppointmentsByDate(id: String, date: String) {
      const appointments = await appointmentModel.find({doctor: id}).find({date: date}).populate({
        path: 'patient',
        populate: {
          path:'person'
        }
      })
      return appointments
    }

    private async retrieveWorkableWeekByDoctor(id: String) {
      const doctor = await doctorModel.findById(id);
      return doctor.workableWeek;
    };


}

export default AppointmentController;
