import * as mongoose from 'mongoose';

const workableDaySchema = new mongoose.Schema({
    name: String,
    number: Number,
    startHour: Number,
    finishHour: Number,
    breakStart: Number,
    breakFinish: Number,
    maxAppointments: Number
})

const prepaidSchema = new mongoose.Schema({
    name: String
})


const doctorSchema = new mongoose.Schema({
    person: {
        ref: 'Person',
        type: mongoose.Schema.Types.ObjectId,
    },
    speciality: String,
    workableWeek: [workableDaySchema],
    rating: Number,
    prepaid: [prepaidSchema]

})

const doctorModel = mongoose.model('Doctor', doctorSchema);

export default doctorModel;