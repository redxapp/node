const express=require('express');
const router=express.Router();


const conn = require('../db_con');


router.get('/users', (req, res) => {
    conn.query('SELECT * FROM users', (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });

router.get('/test',(req,res)=>{
    res.send("hello");
});


module.exports=router;
