import * as mongoose from 'mongoose';


const personSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    birthDate: Date,
    dni: Number,
    phone: Number

})

const personModel = mongoose.model('Person', personSchema);

export default personModel;