var bind = function(fn, me) {
  return function() {
    return fn.apply(me, arguments);
  };
};
var App = function() {
  function App(canvas, bullet_canvas) {
    this.canvas = canvas;
    this.bullet_canvas = bullet_canvas;
    this.setMaxSpeed = bind(this.setMaxSpeed, this);
    this.resizeCanvas = bind(this.resizeCanvas, this);
    this.getMouseWorldPosition = bind(this.getMouseWorldPosition, this);
    this.resize = bind(this.resize, this);
    this.keyup = bind(this.keyup, this);
    this.keydown = bind(this.keydown, this);
    this.mousemove = bind(this.mousemove, this);
    this.mouseup = bind(this.mouseup, this);
    this.mousedown = bind(this.mousedown, this);
    this.sync = bind(this.sync, this);
    this.draw = bind(this.draw, this);
    this.update = bind(this.update, this);
    this.context = this.canvas.getContext("2d");
    this.bullet_context = this.bullet_canvas.getContext("2d");
    this.resizeCanvas();
    this.scene = new Scene;
    this.scene.user = new Player(-1);
    this.scene.users[-1] = this.scene.user;
    this.socket = io();
    initSocket(this.socket, this.scene);
    this.scene.camera = new Camera(this.canvas, this.context, this.scene.user.x, this.scene.user.y);
    this.mouse = {x:0, y:0, worldx:0, worldy:0, player:null};
    this.key_nav = {x:0, y:0};
    for (i = 0; i <= 50;i++) {
      this.scene.stars.push(new Star);
    }
  }
  App.prototype.update = function() {
    var i, j, len, mouse_p, ref, ref1, star;
    if (this.key_nav.x !== 0 || this.key_nav.y !== 0) {
      this.scene.user.userUpdate(this.scene.user.x + this.key_nav.x, this.scene.user.y + this.key_nav.y);
    } else {
      mouse_p = this.getMouseWorldPosition();
      this.mouse.worldx = mouse_p.x;
      this.mouse.worldy = mouse_p.y;
      this.scene.user.userUpdate(this.mouse.worldx, this.mouse.worldy);
    }
    this.scene.camera.update(this.scene);
    this.scene.user.update(this.mouse);
    ref = this.scene.stars;
    for (j = 0, len = ref.length;j < len;j++) {
      star = ref[j];
      star.update(this.scene.camera.getOuterBounds(), this.scene.camera.zoom);
    }
  };
  App.prototype.draw = function() {
    var star, user;
    this.scene.camera.setupContext();
    this.bullet_context.bgcolor__ = this.scene.camera.bgcolor;
    for (var j = 0;j < this.scene.stars.length;j++) {
      star = this.scene.stars[j];
      star.draw(this.context);
    }
    for (var i in this.scene.users) {
      user = this.scene.users[i];
      user.draw(this.context, this.scene.camera.getOuterBounds(), this.context);
    }
    this.scene.camera.startUILayer();
    this.drawBoard(this.context);
  };
  App.prototype.drawBoard = function(cxt) {
    var opacity, width;
    cxt.fillStyle = "rgba(226,219,226, 0.5)";
    cxt.font = 20 + "px 'proxima-nova-1','proxima-nova-2', arial, sans-serif";
    cxt.textBaseline = "hanging";
    width = 200;
    cxt.fillText("LEADER BOARD", 10, 0);
    for (var i = 0;i < this.scene.leaderboard.length;i++) {
      this.scene.leaderboard[i];
      cxt.fillText(this.scene.leaderboard[i].name + " " + this.scene.leaderboard[i].score, 10, (i + 1) * 20);
    }
  };
  App.prototype.sync = function() {
    if (this.scene.user.id === -1) {
      return;
    }
    if (this.scene.user.health === 0) {
      this.scene.user.speed = 0;
    }
    return this.socket.emit("update", this.scene.user);
  };
  App.prototype.mousedown = function(e) {
    if (this.scene.user.health) {
      this.scene.user.speed = 2.5;
      this.scene.user.shoot();
    } else {
      var r = confirm("Game Over! \u70b9\u51fb\u786e\u8ba4\u91cd\u65b0\u767b\u5f55");
      if (r == true) {
        window.location.replace("./login");
      } else {
        window.location.replace("./login");
      }
    }
  };
  App.prototype.mouseup = function(e) {
    if (this.scene.user.health) {
      this.scene.user.speed = 3;
    }
  };
  App.prototype.mousemove = function(e) {
    if (this.scene.user.health) {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      return this.scene.user.speed = this.scene.user.target_speed = this.scene.user.max_speed;
    } else {
      this.scene.user.speed = 0;
    }
  };
  App.prototype.keydown = function(e) {
    if (this.scene.user.health) {
      switch(e.keyCode) {
        case keys.up:
          this.key_nav.y = -1;
          this.setMaxSpeed(this.scene.user);
          break;
        case keys.down:
          this.key_nav.y = 1;
          this.setMaxSpeed(this.scene.user);
          break;
        case keys.left:
          this.key_nav.x = -1;
          this.setMaxSpeed(this.scene.user);
          break;
        case keys.right:
          this.key_nav.x = 1;
          this.setMaxSpeed(this.scene.user);
          break;
        case keys.space:
          this.scene.user.shoot();
          this.scene.user.speed = 2.5;
          break;
        default:
          console.log("keydown error!");
      }
    }
    return e.preventDefault();
  };
  App.prototype.keyup = function(e) {
    if (this.scene.user.health) {
      switch(e.keyCode) {
        case keys.up:
        ;
        case keys.down:
          this.key_nav.y = 0;
          break;
        case keys.left:
        ;
        case keys.right:
          this.key_nav.x = 0;
      }
      this.setMaxSpeed(this.scene.user);
    }
    return e.preventDefault();
  };
  App.prototype.resize = function(e) {
    return this.resizeCanvas();
  };
  App.prototype.getMouseWorldPosition = function() {
    var res;
    return res = {x:(this.mouse.x + (this.scene.camera.x * this.scene.camera.zoom - this.canvas.width / 2)) / this.scene.camera.zoom, y:(this.mouse.y + (this.scene.camera.y * this.scene.camera.zoom - this.canvas.height / 2)) / this.scene.camera.zoom};
  };
  App.prototype.resizeCanvas = function() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.bullet_canvas.width = window.innerWidth;
    return this.bullet_canvas.height = window.innerHeight;
  };
  App.prototype.setMaxSpeed = function(p) {
    return p.speed = p.target_speed = p.max_speed;
  };
  return App;
}();
var initSocket = function(socket, scene) {
  var update_scene_single_user, update_scene_users;
  socket.in_connection = false;
  socket.game_scene = scene;
  update_scene_single_user = function(_this) {
    return function(data) {
      var b, bp, d_bp, i, j, k, len, len1, ref, ref1, u;
      scene.users[data.id] = new Player(data.id);
      u = scene.users[data.id];
      copyAttributes(u, data);
    };
  }(this);
  update_scene_users = function(_this) {
    return function(data) {
      var u, uid;
      scene.users = {};
      for (uid in data) {
        u = data[uid];
        update_scene_single_user(u);
      }
      return scene.user = scene.users[scene.user.id];
    };
  }(this);
  socket.on("update leaderboard", function(board) {
    scene.leaderboard = board;
  });
  socket.on("init score", function(score) {
    scene.user.score = score;
  });
  socket.on("update score", function(data) {
    scene.users[data.id].score = data.score;
  });
  socket.on("update health", function(data) {
    scene.users[data.id].health = data.health;
    scene.users[data.id].score = data.score;
  });
  socket.on("init", function(id, score) {
    socket.in_connection = true;
    scene.user = new Player(id);
    scene.user.score = score;
    scene.users[id] = scene.user;
    delete scene.users[-1];
    return socket.emit("validate", scene.user);
  });
  socket.on("player join", function(data) {
    update_scene_users(data);
  });
  socket.on("player left", function(data) {
    update_scene_users(data);
  });
  socket.on("update users", function(user_data) {
    return update_scene_single_user(user_data);
  });
  return socket.on("disconnection", function() {
    return socket.in_connection = false;
  });
};
var keys = {esc:27, enter:13, space:32, up:38, down:40, left:37, right:39};
var drawRotatedImage = function(cxt, image, x, y, angle) {
  cxt.save();
  cxt.translate(x, y);
  cxt.rotate(angle);
  cxt.drawImage(image, -image.width / 2, -image.height / 2);
  return cxt.restore();
};
var copyAttributes = function(a, b) {
  var d, key;
  for (key in b) {
    d = b[key];
    a[key] = d;
  }
};
var renderElements = function() {
  function ImageRepo() {
    this.bullet = {width:2, height:14};
    this.user_ship = new Image;
    this.user_ship.src = "imgs/knight.png";
  }
  return ImageRepo;
}();

var renderElements = new renderElements;

var Scene = function() {
  function Scene() {
    this.users = {};
    this.leaderboard = [];
    this.user = null;
    this.camera = null;
    this.stars = [];
  }
  return Scene;
}();


var Star = (function() {
  function Star() {
    this.draw = bind(this.draw, this);
    this.update = bind(this.update, this);
    this.x = 0;
    this.y = 0;
    this.z = Math.random() * 1 + 0.3;
    this.size = 1.2;
    // this.opacity = 0.9
    this.opacity = Math.random() * 0.9 + 0.1;
  }

  Star.prototype.update = function(bounds) {
    if (this.x === 0 || this.y === 0) {
      this.x = Math.random() * (bounds[1].x - bounds[0].x) + bounds[0].x;
      this.y = Math.random() * (bounds[1].y - bounds[0].y) + bounds[0].y;
    }
    this.x = this.x < bounds[0].x ? bounds[1].x : this.x;
    this.y = this.y < bounds[0].y ? bounds[1].y : this.y;
    this.x = this.x > bounds[1].x ? bounds[0].x : this.x;
    return this.y = this.y > bounds[1].y ? bounds[0].y : this.y;
  };

  Star.prototype.draw = function(context) {
    context.fillStyle = 'rgba(255,255,255,' + this.opacity + ')';
    context.beginPath();
    context.arc(this.x, this.y, this.z * this.size, 0, Math.PI * 2, true);
    context.closePath();
    return context.fill();
  };

  return Star;

})();
