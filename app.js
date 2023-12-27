const express=require('express');
const cors=require('cors');
const bodyParser = require('body-parser');


//middlewares
const app=express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const api=require('./routes/api');
app.use('/api',api);




const port=3000;
app.listen(port,()=>{
    console.log("listening in port 3000");
});
