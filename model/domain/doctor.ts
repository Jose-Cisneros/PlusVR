import { validate } from 'class-validator';
import { bcrypt } from 'bcryptjs';
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

const reviewSchema = new mongoose.Schema({
    comment: String
})


const doctorSchema = new mongoose.Schema({
    person: {
        ref: 'Person',
        type: mongoose.Schema.Types.ObjectId,
    },
    speciality: String,
    workableWeek: [workableDaySchema],
    rating: Number,
    adress: String,
    ratingCount: 0,
    profileUrl: String,
    review: [reviewSchema],
    prepaid: [prepaidSchema],
    email: {
        type: String,
        required: false,
        unique: true
    },
    password: String,
    
    


})

// doctorSchema.methods.encryptPassword = async (password : string): Promise<string> => {
//     const encrypt = await bcrypt.genSalt(10);
//     return bcrypt.hash(password, encrypt);

// }   

 doctorSchema.methods.validatePassword = async function ( password : string): Promise<boolean> {
     return await bcrypt.compare(password, this.password);
}

const doctorModel = mongoose.model('Doctor', doctorSchema);

export default doctorModel;