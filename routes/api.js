const express=require('express');
const router=express.Router();


const conn = require('../db_con');


//get all users
router.get('/users', (req, res) => {
    conn.query('SELECT * FROM users', (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });

//get all communities
  router.get('/communities', (req, res) => {
    conn.query('SELECT * FROM communities', (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });

//get all posts
  router.get('/posts',(req,res)=>{
    conn.query(`SELECT * FROM post `, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });

//get community logs
  router.get('/communityLogs', (req, res) => {
    conn.query('SELECT * FROM community_logs', (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });

//create community
  router.post('/createCommunity',(req,res)=>{
    const {community , admin,dp}=req.body;
    const sql = `INSERT INTO communities (community, admin, dp) VALUES ('${community}', '${admin}', '${dp}')`;
    conn.query(sql, (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    const com_id=result.insertId;
    const sql2 = `INSERT INTO community_logs (community_id, user_id, current_status) VALUES ('${com_id}', '${admin}', 'created')`;
        conn.query(sql2, (err, result) => {
          if (err) {
            console.error('Error adding to logs:', err);
            res.status(500).send('Internal Server Error');
            return;
          }
          console.log("created");
          // Send a success response
          res.send({success:true});
        });
    })
    
  });

//joined comminities of users
  router.get('/joinedCommunities',(req,res)=>{
    const email=req.query.email;
    conn.query(`SELECT * FROM community_logs where user_id='${email}'`, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });

//get all posts of a community
  router.get('/communityPosts',(req,res)=>{
    const com=req.query.com;
    conn.query(`SELECT * FROM post where community_id='${com}'`, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });

//get all posts of a user
  router.get('/userPosts',(req,res)=>{
    const email=req.query.email;
    conn.query(`SELECT * FROM post where user_id='${email}'`, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });

  
//create a post
  router.post('/post',(req,res)=>{
    const {user_id,com_id,title,description,image}=req.body;
    const sql = `INSERT INTO post (user_id, community_id, title,description,image,upvote,downvote,clicks) VALUES ('${user_id}', '${com_id}', '${title}','${description}', '${image}' , '0','0','0')`;
        conn.query(sql, (err, result) => {
          if (err) {
            console.error('Error adding to logs:', err);
            res.status(500).send('Internal Server Error');
            return;
          }
          console.log("created");
          // Send a success response
          res.send({success:true});
        });
  });

//getting community for search
  router.get('/searchCom',(req,res)=>{
    const keyword=req.query.keyword;
    conn.query(`SELECT * FROM communities where community like '%${keyword}%'`, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });

//get post data
router.get('/getPost',(req,res)=>{
  const id=req.query.id;
  conn.query(`SELECT * FROM post where id='${id}'`, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});


//login route
router.post('/login',(req,res)=>{
  const {email}=req.body;
  //query to check if the given email is already exsit 
  let sql=`SELECT * FROM users WHERE email='${email}' `;
  conn.query(sql,(err,result)=>{
    if(err)
    console.log(err);
  const emailexsist=result.length>0;
  if(emailexsist==true){
    res.json({existinguser:true});
  }
  else{
  //inserting the new email into database
    let insertquery=`INSERT INTO users (email,username) VALUES ('${email}',"")`;
    conn.query(insertquery,(err,result)=>{
      if(err)
      console.log(err)
    console.log('email added to database'+result);
    res.json({added:true});
    })
  }
  })
})

module.exports=router;
