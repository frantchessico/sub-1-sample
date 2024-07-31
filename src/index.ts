


import dotenv from 'dotenv';
dotenv.config();


import { createNewsletter } from './service/newsletter.service';
import { connection } from './configs/mongodb';
import { sub } from './configs/subscriber';

connection();





sub.subscribe('newsletter', ['pubsub'], async (message: string) => {
  console.log('SUB 1')
  const msg = JSON.parse(message)
  await createNewsletter(msg.name, msg.email);
})

