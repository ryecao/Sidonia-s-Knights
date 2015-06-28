
var express = require('express');
var hash = require('./pass').hash;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
var app = express();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    

// config                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
app.set('view engine', 'ejs');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
app.set('views', __dirname + '/views');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 

// middleware                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'shhhh, very secret'
}));    

app.use(function(req, res, next){
  var err = req.session.error;
  var msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});

var users = {
  tj: { name: 'tj' }
};

hash('foobar', function(err, salt, hash){
  if (err) throw err;
  users.tj.salt = salt;
  users.tj.hash = hash;
  users.tj.score = 10;
});

var getTopTen = function(users){
  var ulist = [];
  for (var key in users) {
    ulist.push({name:key, score: users[key].score});
  };
  return ulist.sort(function(a, b){return b.score - a.score}).slice(0,10);
}
// Authenticate using our plain-object database of doom!

function authenticate(name, pass, fn) {
  if (!module.parent) console.log('authenticating %s:%s', name, pass);
  var user = users[name];
  // query the db for the given username
  if (!user) return fn(new Error('cannot find user'));
  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  hash(pass, user.salt, function(err, hash){
    if (err) return fn(err);
    if (hash == user.hash) return fn(null, user);
    fn(new Error('invalid password'));
  });
}

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

app.get('/', function(req, res){
  res.redirect('/login');
});

app.get('/index', restrict, function(req, res){
  res.render('index');
});

app.get('/logout', function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
});

app.get('/login', function(req, res){
  res.render('login');
});

var gb_uname;
var init_score;

app.post('/login', function(req, res){
  if (req.body.type ==="Login") {
    authenticate(req.body.username, req.body.password, function(err, user){
      if (user) {
      // Regenerate session when signing in
      // to prevent fixation
      req.session.regenerate(function(){
        // Store the user's primary key
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user;
        req.session.success = 'Authenticated as ' + user.name
        + ' click to <a href="/logout">logout</a>. '
        gb_uname = user.name;
        init_score = user.score;
        res.redirect('./index');
      });
    } 
    else {
      req.session.error = 'Authentication failed, please check your '
      + ' username and password.';
      res.redirect('/login');
    }
  });
  }
  else{ //register
    var uname = req.body.username;
    if (uname in users) {
      req.session.error = 'User already exists ';
      res.redirect('/login');
    }
    else{
      hash(req.body.password, function(err, salt, hash){
        if (err) throw err;
        // store the salt & hash in the "db"
        users[req.body.username] = {name: req.body.username,
          salt: salt,
          hash: hash,
          score: 10};
        // users.uname.salt = salt;
        // users.uname.hash = hash;
      });
      gb_uname = req.body.username;
      // req.session.success = 'Rest
      req.session.success = 'Registered as ' +  req.body.username;

      res.redirect('/login');
    }

  }

});

var path = require('path');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var sockets = {};
var online_players = {};

app.use(express["static"](path.resolve(__dirname + '/../client')));

// var mysql      = require('mysql');
// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : 'momo',
//   database : 'sidonia'
// });

// connection.connect();

var getDistance = function(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
};

var hitDecision = function(socket, bullet, source_player) {
  var dis, id, p;
  for (id in online_players) {
    p = online_players[id];
    dis = getDistance(bullet.x, bullet.y, p.x, p.y);
    if (dis < 20 && source_player.id != p.id) {
      if (p.health>0) {
        p.health -= 1;
      }
      else{
        source_player.score += p.score;
        p.score = 0;
        users[source_player.id].score=source_player.score;
        socket.emit("update score", source_player);
        socket.emit("update leaderboard", getTopTen(users)); 
      }
      socket.broadcast.emit("update health", p);
      return true;
    }
  }
  return false;
};

var updateSituation = function(socket){
  var sp, id;
  for (id in online_players) {
    sp = online_players[id];
    for (var j = 0; j < sp.bullets.length; j++) {
      hitDecision(socket, sp.bullets[j], sp);
    };
  };
};

io.on('connection', (function(socket) {
  var user;
  user = {};
  user.id = gb_uname;
  user.score = init_score;
  
  socket.on('validate', (function(user_data) {
    user = user_data;
    sockets[user.id] = socket;
    online_players[user.id] = user_data;
    io.emit('player join', online_players);

  }));
  socket.emit('init', user.id, user.score);
  socket.emit("update leaderboard", getTopTen(users)); 
  socket.on('disconnection', (function() {
    console.log("user " + user.id + " left");
    delete online_players[user.id];
    socket.broadcast.emit('player left', online_players);
  }));

  socket.on('update', (function(user_data) {
    updateSituation(socket);
    user_data.health = online_players[user_data.id].health;
    user_data.score = online_players[user_data.id].score;
    online_players[user_data.id] = user_data;
    socket.broadcast.emit('update users', user_data);
  }));
}));

server.listen(80);
