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
          res.send({success:true,id:result.insertId})
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

//joining and leaving community
router.post('/comLogs', (req, res) => {
  const { user_id, com_id } = req.body;
  const sql = `SELECT * FROM community_logs WHERE community_id='${com_id}' AND user_id='${user_id}'`;
  conn.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      res.json(err);
      return;
    } else {
      const exists = result.length > 0;
      if (exists) {
        const currentStatus = result[0].current_status;

        // Toggle the status
        const newStatus = currentStatus === 'joined' ? 'left' : 'joined';

        // Update the status in the database
        const updateSql = `UPDATE community_logs SET current_status='${newStatus}' WHERE community_id='${com_id}' AND user_id='${user_id}'`;
        conn.query(updateSql, (updateErr, updateResult) => {
          if (updateErr) {
            console.log(updateErr);
            res.json(updateErr);
            return;
          }

          // Send a response indicating the updated status
          res.json({ exists, newStatus });
        });
      } else {
        // Handle the case where the user is not found in the community_logs
        res.json({ exists: false, message: 'User not found in community logs.' });
      }
    }
  });
});


//get user is in a community
router.get('/statusLog',(req,res)=>{
  const {user_id,com_id}=req.body;
  const sql = `SELECT * FROM community_logs WHERE community_id='${com_id}' AND user_id='${user_id}'`;
  conn.query(sql,(err,result)=>{
    if(err){
      console.log(err);
      res.json(err);
      return;
    }
    const isThere=result.length>0;
    if(isThere){
      const current_status=result[0].current_status;
      if(current_status=="joined"){
        res.json({joined:true});
      }
      else if(current_status=="created"){
        res.json({created:true});
      }
      else{
        res.json({joined:false});
      }
    }else{
      res.json({joined:false})
    }
    
  })
});


//feed algo
router.get('/feed/:userId', (req, res) => {
  const userId = req.params.userId;

  conn.query(
    `
    SELECT p.id, p.title, p.description, p.image, p.upvote, p.downvote, p.clicks
    FROM post p
    JOIN communities c ON p.community_id = c.id
    LEFT JOIN votes v ON p.id = v.post_id AND v.user_id = ?
    LEFT JOIN comments cm ON p.id = cm.post_id AND cm.user_id = ?
    LEFT JOIN community_logs cl ON c.id = cl.community_id AND cl.user_id = ? AND cl.current_status = 'joined'
    WHERE v.post_id IS NULL
    AND cm.post_id IS NULL
    AND cl.community_id IS NOT NULL
    ORDER BY 
      (p.upvote - p.downvote) DESC, -- Rank by upvotes minus downvotes
      p.clicks DESC -- Then rank by clicks
    LIMIT 20
    `,
    [userId, userId, userId],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      // Shuffle the results
      const shuffledResults = results.sort(() => Math.random() - 0.5);

      res.json({ feed: shuffledResults });
    }
  );
});


//feed for not logged-ins
router.get('/feed', (req, res) => {
  const sql = `
    SELECT p.id, p.title, p.description, p.image, p.upvote, p.downvote, p.clicks
    FROM post p
    ORDER BY 
      (p.upvote - p.downvote) DESC, -- Rank by upvotes minus downvotes
      p.clicks DESC -- Then rank by clicks
    LIMIT 20
  `;
  conn.query(sql, (err, result) => {
    if (err) {
      res.json(err);
      console.log(err);
      return;
    }

    // Shuffle the results
    const shuffledResults = result.sort(() => Math.random() - 0.5);

    res.json(shuffledResults);
  });
});

//vote 
router.post('/vote', (req, res) => {
  const { user_id, post_id, voteAction } = req.body;

  if (!voteAction || (voteAction !== 'up' && voteAction !== 'down')) {
    res.status(400).json({ error: 'Invalid vote action. Provide either "up" or "down".' });
    return;
  }

  // Check if the user has already voted on the post
  const checkVoteSql = `SELECT * FROM votes WHERE user_id='${user_id}' AND id='${post_id}'`;

  conn.query(checkVoteSql, (err, result) => {
    if (err) {
      console.log(err);
      res.json(err);
      return;
    }

    if (result.length > 0) {
      // User has already voted, update the vote status or remove vote
      const currentVoteStatus = result[0].status;

      if (currentVoteStatus === voteAction) {
        // Remove the vote
        const removeVoteSql = `DELETE FROM votes WHERE user_id='${user_id}' AND id='${post_id}'`;
        conn.query(removeVoteSql, (removeErr, removeResult) => {
          if (removeErr) {
            console.log(removeErr);
            res.json(removeErr);
            return;
          }

          // Update post table: Subtract from upvote or downvote
          const updatePostSql = `UPDATE post SET ${voteAction === 'up' ? 'upvote' : 'downvote'} = ${voteAction === 'up' ? 'upvote - 1' : 'downvote - 1'} WHERE id='${post_id}'`;
          conn.query(updatePostSql, (updateErr, updateResult) => {
            if (updateErr) {
              console.log(updateErr);
              res.json(updateErr);
              return;
            }

            // Send a response indicating the vote has been removed
            res.json({ hasVoted: true, removedVoteStatus: voteAction });
          });
        });
      } else {
        // Update the vote status
        const updateVoteSql = `UPDATE votes SET status='${voteAction}' WHERE user_id='${user_id}' AND id='${post_id}'`;
        conn.query(updateVoteSql, (updateErr, updateResult) => {
          if (updateErr) {
            console.log(updateErr);
            res.json(updateErr);
            return;
          }

          // Update post table: Adjust upvote or downvote based on the previous vote
          const updatePostSql = `
            UPDATE post 
            SET 
              ${currentVoteStatus === 'up' ? 'upvote' : 'downvote'} = ${currentVoteStatus === 'up' ? 'upvote - 1' : 'downvote - 1'},
              ${voteAction === 'up' ? 'upvote' : 'downvote'} = ${voteAction === 'up' ? 'upvote + 1' : 'downvote + 1'} 
            WHERE id='${post_id}'`;
          conn.query(updatePostSql, (updatePostErr, updatePostResult) => {
            if (updatePostErr) {
              console.log(updatePostErr);
              res.json(updatePostErr);
              return;
            }

            // Send a response indicating the vote status has been updated
            res.json({ hasVoted: true, newVoteStatus: voteAction });
          });
        });
      }
    } else {
      // User has not voted, insert a new vote record
      const insertVoteSql = `INSERT INTO votes (user_id, id, status) VALUES ('${user_id}', '${post_id}', '${voteAction}')`;
      conn.query(insertVoteSql, (insertErr, insertResult) => {
        if (insertErr) {
          console.log(insertErr);
          res.json(insertErr);
          return;
        }

        // Update post table: Add to upvote or downvote
        const updatePostSql = `UPDATE post SET ${voteAction === 'up' ? 'upvote' : 'downvote'} = ${voteAction === 'up' ? 'upvote + 1' : 'downvote + 1'} WHERE id='${post_id}'`;
        conn.query(updatePostSql, (updatePostErr, updatePostResult) => {
          if (updatePostErr) {
            console.log(updatePostErr);
            res.json(updatePostErr);
            return;
          }

          // Send a response indicating the user has voted
          res.json({ hasVoted: false, newVoteStatus: voteAction });
        });
      });
    }
  });
});


//increasing clicks
router.post('/incrementClicks', (req, res) => {
  const { post_id } = req.body;

  if (!post_id) {
    res.status(400).json({ error: 'Post ID is required.' });
    return;
  }

  // Increment the clicks in the post table
  const incrementClicksSql = `UPDATE post SET clicks = clicks + 1 WHERE id='${post_id}'`;

  conn.query(incrementClicksSql, (err, result) => {
    if (err) {
      console.log(err);
      res.json(err);
      return;
    }

    res.json({ success: true, message: 'Clicks incremented successfully.' });
  });
});

//get is voted by user or not
router.post('/checkVoteStatus', (req, res) => {
  const { user_id, post_id } = req.body;

  if (!user_id || !post_id) {
    res.status(400).json({ error: 'User ID and Post ID are required.' });
    return;
  }

  // Check if the user has voted on the post
  const checkVoteSql = `SELECT * FROM votes WHERE user_id='${user_id}' AND id='${post_id}'`;

  conn.query(checkVoteSql, (err, result) => {
    if (err) {
      console.log(err);
      res.json(err);
      return;
    }

    if (result.length > 0) {
      const voteStatus = result[0].status;
      res.json({ hasVoted: true, voteStatus });
    } else {
      res.json({ hasVoted: false });
    }
  });
});



module.exports=router;
