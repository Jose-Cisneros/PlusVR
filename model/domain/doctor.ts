import * as mongoose from 'mongoose';

const workableDaySchema = new mongoose.Schema({
    name: String,
    startHour: Number,
    finishHour: Number,
    breakStart: Number,
    breakFinish: Number,
    maxAppointments: Number
})


const doctorSchema = new mongoose.Schema({
    person: {
        ref: 'Person',
        type: mongoose.Schema.Types.ObjectId,
    },
    speciality: String,
    workableWeek: [workableDaySchema]

})

const doctorModel = mongoose.model('Doctor', doctorSchema);

export default doctorModel;