import { Schema, model } from 'mongoose';



const NewsletterSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
}, { timestamps: true});



export const Newsletter = model('newsletter', NewsletterSchema)