import express from 'express';
import example from './src';


const PORT = 3030;

let app = new express();
app.set('port', PORT)

app = example(app);

app.listen(app.get('port'), ()=>{
  console.log('Welcome to Smart Device!!!');
})
