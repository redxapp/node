const express=require('express');
const router=express.Router();


const conn = require('../db_con');
router.post('/comments', (req, res) => {
  const { post_id, comment, user_id } = req.body;
  const sql = 'INSERT INTO comments(post_id, comment, user_id) VALUES (?, ?, ?)';
  conn.query(sql, [post_id, comment, user_id], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
  
    res.status(201).send({ success: true });
  });
});
//get comments by postid
router.post('/getComment',(req,res)=>{
  const {post_id}=req.body;
  const sql=`SELECT * FROM comments WHERE post_id=${post_id}`;
  conn.query(sql,(err,result)=>{
    if(err){
      console.error('error query',err);
      res.status(500).send('internel sderver error');
    }
    res.json(result);
    
  })

})
//feed_logs
router.get('/feedLogs', (req, res) => {
  conn.query('SELECT * FROM feed_logs', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});



//get all users
router.get('/allUsers', (req, res) => {
    conn.query('SELECT * FROM users', (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });

//get all communities
  router.get('/communities', (req, res) => {
    conn.query('SELECT * FROM communities order by rand()', (err, results) => {
      if (err) throw err;
      console.log(results);
      res.json(results);
    });
  });

  //get vote logs
  router.get('/voteLogs', (req, res) => {
    conn.query('SELECT * FROM votes', (err, results) => {
      if (err) throw err;
      console.log(results);
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
          console.log(com_id);
          res.send({insertId:com_id});
        });
    })
    
  });


  router.get('/getPostDetailsWithUserAndCommunity', (req, res) => {
    const postId = req.query.post_id;
    const userId = req.query.user_id;
  
    conn.query(`
      SELECT 
        p.title, 
        p.description, 
        p.id,
        p.image, 
        p.community_id,
        p.upvote, 
        p.downvote, 
        u.username AS user_name,
        u.email AS user_email,
        c.dp AS community_dp,
        c.community AS community_name,
        COALESCE(v.status, 'Not Voted') AS vote_status
      FROM post p
      INNER JOIN users u ON p.user_id = u.email
      INNER JOIN communities c ON p.community_id = c.id
      LEFT JOIN votes v ON p.id = v.post_id AND v.user_id = '${userId}'
      WHERE p.id = '${postId}'
    `, (err, results) => {
      if (err) throw err;
  
      res.json(results);
    });
  });


//joined communities
  router.get('/joinedCommunities', (req, res) => {
    const email = req.query.email;
  
    // Use a JOIN query to fetch community details based on user's email
    conn.query(`
      SELECT c.*
      FROM communities c
      JOIN community_logs cl ON c.id = cl.community_id
      WHERE cl.user_id = '${email}' AND (cl.current_status='joined' OR cl.current_status='created')
    `,
 (err, results) => {
      if (err) {
        // Handle the error appropriately (e.g., send an error response)
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      // Log the results for debugging (you can remove this in a production environment)
      //console.log(results);
  
      // Send the community details as a JSON response
      res.json(results);
    });
  });
  
//get all posts of a community
  router.get('/communityPosts',(req,res)=>{
    const com=req.query.com;
    conn.query(`SELECT * FROM post where community_id='${com}'  order by id desc`, (err, results) => {
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
router.post('/login', (req, res) => {
  const { email } = req.body;

  // Query to check if the given email already exists
  let sql = `SELECT * FROM users WHERE email='${email}'`;

  conn.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      res.json(err);
      return;
    }

    const emailExist = result.length > 0;

    if (emailExist) {
      res.json({ existingUser: true });
      return;
    } else {
      // Generate a random 4-digit number
      const randomDigits = Math.floor(1000 + Math.random() * 9000);

      // Create the dynamic username
      const dynamicUsername = `RedX User ${randomDigits}`;

      // Inserting the new email into the database
      let insertQuery = `INSERT INTO users (email, username) VALUES ('${email}', '${dynamicUsername}')`;

      conn.query(insertQuery, (err, result) => {
        if (err) {
          console.log(err);
          res.json(err);
          return;
        }

        console.log('Email added to database ' + result);
        res.json({ added: true });
      });
    }
  });
});


//get community
router.get('/community/:id', (req, res) => {
  const id=req.params.id;
 conn.query(`SELECT * FROM communities where id='${id}'`, (err, results) => {
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

//get members count
router.get('/membersCount', (req, res) => {
  const com_id=req.query.com_id;
  conn.query(`SELECT * FROM community_logs where community_id='${com_id}' and current_status='joined'`, (err, results) => {
    if (err) throw err;
    res.json({count:results.length});
  });
});


//joining and leaving community
router.post('/comLogs', (req, res) => {
  const { user_id, com_id } = req.body;
  const sql = `SELECT * FROM community_logs WHERE community_id='${com_id}' AND user_id='${user_id}'`;
  console.log("here");
  conn.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      res.json(err);
      return;
    }

    const exists = result.length > 0;

    if (exists) {
      // User exists, toggle the status
      const currentStatus = result[0].current_status;
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
      // User not found, insert a new record
      const insertSql = `INSERT INTO community_logs (user_id, community_id, current_status) VALUES ('${user_id}', '${com_id}', 'joined')`;
      conn.query(insertSql, (insertErr, insertResult) => {
        if (insertErr) {
          console.log(insertErr);
          res.json(insertErr);
          return;
        }

        // Send a response indicating the user has been joined
        res.json({ exists: false, newStatus: 'joined' });
      });
    }
  });
});

//get user is in a community
router.get('/statusLog',(req,res)=>{
  const {user_id,com_id}=req.query;
  const sql = `SELECT * FROM community_logs WHERE community_id='${com_id}' AND user_id='${user_id}'`;
  conn.query(sql,(err,result)=>{
    if(err){
      console.log(err);
      res.json(err);
      return;
    }
    const isThere=result.length>0;
    if(result.length>0){
      const current_status=result[0].current_status;
      if(current_status=="joined"){
        res.json({joined:true});
      }
      else if(current_status=="left"){
        res.json({joined:false});
      }
      else{
        res.json({});
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

      res.json(shuffledResults );
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
  const checkVoteSql = 'SELECT * FROM votes WHERE user_id=? AND post_id=?';

  conn.query(checkVoteSql, [user_id, post_id], (err, result) => {
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
        const removeVoteSql = 'DELETE FROM votes WHERE user_id=? AND post_id=?';
        conn.query(removeVoteSql, [user_id, post_id], (removeErr, removeResult) => {
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
        const updateVoteSql = 'UPDATE votes SET status=? WHERE user_id=? AND post_id=?';
        conn.query(updateVoteSql, [voteAction, user_id, post_id], (updateErr, updateResult) => {
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
      const insertVoteSql = 'INSERT INTO votes (user_id, post_id, status) VALUES (?, ?, ?)';
      conn.query(insertVoteSql, [user_id, post_id, voteAction], (insertErr, insertResult) => {
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
console.log("vshdvv");
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


// Update username by email
router.put('/users', (req, res) => {
  const { email, newUsername } = req.body;
  const query = `UPDATE users SET username = ? WHERE email = ?`;

  conn.query(query, [newUsername, email], (err, results) => {
    if (err) {
      console.error('Error updating username:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.affectedRows > 0) {
      res.json({ success: true, message: 'Username updated successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

// Get user details by email
router.get('/users', (req, res) => {
  const { email } = req.query;
  const query = `SELECT * FROM users WHERE email = ?`;

  conn.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error fetching user data:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

module.exports=router;
