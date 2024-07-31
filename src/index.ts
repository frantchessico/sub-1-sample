import dotenv from 'dotenv';
dotenv.config()
import express from 'express';
import morgan from 'morgan';
import { createNewsletter } from './service/newsletter.service';
import { connection } from './configs/mongodb';
import { sub } from './configs/subscriber';

connection();


const app = express();
app.use(express.json())

app.use(morgan('dev'))

const port = process.env.PORT || 2600;




app.get('/', (_, res) => {
  return res.send(`<h1>Welcome to Subscriber 1 Sample`)
})






sub.subscribe('newsletter', ['pubsub'], async (message: string) => {
  console.log('SUB 1')
  const msg = JSON.parse(message)
  await createNewsletter(msg.name, msg.email);
})


app.listen(port, () => console.log(`Server on http://localhost:${port}`))