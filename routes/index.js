var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');
var app = require('../app');
var nodemailer = require('nodemailer');
var redis = require('redis');
var client = redis.createClient();

/*
This is a request handler for loading the main page. It will check to see if
a user is logged in, and render the index page either way.
*/
router.get('/', function(request, response, next) {
  /*
  Check to see if a user is logged in. If they have a cookie called
  "username," assume it contains their username
  */
  /*
  render the index page. The username variable will be either null
  or a string indicating the username.
  */
  if (request.cookies.username) {
    var database = app.get('database');
    
    var knex = app.get('database');
    knex('tweet').select().then(function(tweets) {
     response.render('tweets/index', { title: "Don't be a dick!", tweets: tweets });
    })

    // database.select('body').from('tweets').then(function (resp) {
    //   var tweets = resp.rows;

  } else {
    response.render('index', { title: 'No really, login!' });
  }
});

router.post('/', function (request, response) {
  var database = app.get('database');
  var params = request.body;

  var username;
  /*
  Check to see if a user is logged in. If they have a cookie called
  "username," assume it contains their username
  */
  if (request.cookies.username) {
    username = request.cookies.username;
    user_id = user_id;
      } else {
      username = null;
    }
});

// function currentUser (request) {
//   // Returns true if there is a user cookie
//   // Redirects to login if there isnt
// }



router.post('/register', function(request, response) {
  /*
  request.body is an object containing the data submitted from the form.
  Since we're in a POST handler, we use request.body. A GET handler would use
  request.params. The parameter names correspond to the "name" attributes of
  the form fields.

  app.get('database') returns the knex object that was set up in app.js. app.get
  is not the same as router.get; it's more like object attributes. You could
  think of it like it's saying app.database, but express apps use .get and .set
  instead of attributes to avoid conflicts with the attributes that express apps
  already have.
  */
  var username = request.body.username,
      password = request.body.password,
      password_confirm = request.body.password_confirm,
      database = app.get('database');

      database('users')
        .where({'username': username})
        .then(function authenticate(res) {
          if(res.length > 0) {
            response.render('index', 
            {
              title: "Log in or be Denied!",
              user: null, 
              error: "This name is already taken, please select something less stupid."
            });
            return;
          };

          if (!password || !username) {
            response.render('index', {
              user: null,
              error: 'Learn how to follow instructions. Fill out the damn form.'
            });
          };

          if (password === password_confirm) {
            //validate email via nonce
            
            var nonce = uuid.v4();
            console.log(nonce);
            console.log(username);
            client.set(nonce.toString(), username);
            var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
            user: 'lorenzotronic@gmail.com',
            pass: 'youeatdicks'
              }
            });

            var mailOptions = {
            from: 'You suck  <lorenzotronic@gmail.com>', // sender address 
            to: 'Mikeronomicon@gmail.com', // list of receivers 
            subject: 'Hello', // Subject line 
            text: 'click link to verify your account', // plaintext body 
            html: '<a href="http://localhost:3000/index/' + nonce + '"><strong>Click link to verify your account</strong></a>' // html body 
            };

            transporter.sendMail(mailOptions, function() {
              client.set(nonce, function() {
                console.log('got here');
                response.render('authenticate', {title: 'I demand to be verified!'});
              });
            });

            database('users').insert({
              username: username,
              password: password,
            }).then(function() {
             
            });
          } else {
            response.render('index', {
              title: 'Authorize Me!',
              user: null,
              error: "Password didn't match confirmation"
            });
          }
        });
});

/*
This is the request handler for logging in as an existing user. It will check
to see if there is a user by the given name, then check to see if the given
password matches theirs.
*/

router.post('/login', function(request, response) {
  /*
  Fetch the values the user has sent with their login request. Again, we're
  using request.body because it's a POST handler.

  Again, app.get('database') returns the knex object set up in app.js.
  */
  var username = request.body.username,
      password = request.body.password,
      database = app.get('database');


  /*
  This is where we try to find the user for logging them in. We look them up
  by the supplied username, and when we receive the response we compare it to
  the supplied password.
  */
  database('users').where({'username': username}).then(function(records) {
    /*
    We didn't find anything in the database by that username. Render the index
    page again, with an error message telling the user what's going on.
    */
    if (records.length === 0) {
        response.render('index', {
          title: "You don't exist!",
          user: null,
          error: "No such user"
        });
    } else {
      var user = records[0];
      if (user.password === password) {
        /*
        Hey, we found a user and the password matches! We'll give the user a
        cookie indicating they're logged in, and redirect them to the root path,
        where the GET request handler above will look at their cookie and
        acknowledge that they're logged in.
        */
        response.cookie('username', username);
        response.redirect('/');
      } else {
        /*
        There's a user by that name, but the password was wrong. Re-render the
        index page, with an error telling the user what happened.
        */
        response.render('index', {
          title: 'ERROR!',
          user: null,
          error: "Learn how to type, you jackass!"
        });
      }
    }
  });
});

router.get('/index/:nonce', function(request, response) {
  client.get(request.params.nonce, function(err, username) {
    client.del(request.params.nonce, function() {
        response.render('index', {Title: 'Congrats shmuck, you have an account!'});
        console.log(username);
    });
  });
});

router.post('/tweets', function(request, response) {
  var tweets = request.body.tweets,
  database = app.get('database'),
  username = request.cookies.user_id;

  database('tweet').insert({
    tweets: tweets,
    //users_id: users_id,
    posted_at: new Date(Date.now())
  }).then(function() {
    response.redirect('/');
    
    });
  });

module.exports = router;
