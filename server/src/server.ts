import express from "express";


const app = express();

app.get('/users', (request, response) => {

  response.send([
    'Alex',
    'Gabriel',
    'Rodrigues',
    'Araujo'
  ])


})

app.listen(3333)