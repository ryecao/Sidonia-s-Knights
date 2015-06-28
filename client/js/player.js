var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

var Player = (function() {
  function Player(id) {
    this.id = id;
    this.gdis = bind(this.gdis, this);
    this.drawName = bind(this.drawName, this);
    this.shoot = bind(this.shoot, this);
    this.draw = bind(this.draw, this);
    this.userUpdate = bind(this.userUpdate, this);
    this.onclick = bind(this.onclick, this);
    this.update = bind(this.update, this);
    this.x = Math.random() * 300 - 150;
    this.y = Math.random() * 300 - 150;
    this.size = 5;
    this.width = renderElements.user_ship.width;
    this.height = renderElements.user_ship.height;
    this.name = null;
    this.health = 100;
    this.level = 0;
    this.hover = false;
    this.speed = 0;
    this.max_speed = 3;
    this.angle = 0;
    this.target_x = 0;
    this.target_y = 0;
    this.target_speed = 0;
    this.time_since_last_avt = 0;
    this.time_since_last_ser = 0;
    this.changed = 0;
    //this.bullet_pool = new BulletPool(50);
    this.shoot_cnt = 0;
    this.bullets = [];
    this.score;
  }

  Player.prototype.update = function(mouse) {
    ++this.time_since_last_ser;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    if (this.target_x !== 0 || this.target_y !== 0) {
      this.x += (this.target_x - this.x) / 20;
      this.y += (this.target_y - this.y) / 20;
    }
    if (this.gdis(this.x, this.y, mouse.worldx, mouse.worldy) < this.size + 2) {
      this.hover = true;
      return mouse.player = this;
    } else {    
      return this.hover = false;
    }
  };

  Player.prototype.onclick = function(mouse) {
    if (mouse.which === 1) {
      if (mouse.ctrlKey && this.hover) {
        console.log('on click!');
      }
    } else if (mouse.which === 2) {
      mouse.preventDefault();
      return true;
    }
    return false;
  };

  Player.prototype.userUpdate = function(angle_tx, angle_ty) {
    var angle_delta, prestate;
    prestate = {
      angle: this.angle,
      speed: this.speed
    };
    angle_delta = Player.calAngle(this.x, this.y, angle_tx, angle_ty) - this.angle;
    angle_delta = Player.normalAngle(angle_delta);
    this.angle += angle_delta / 5;
    if (this.target_speed !== this.speed) {
      this.speed += (this.target_speed - this.speed) / 20;
    }
    this.speed = Math.max(this.speed, 0);
    this.changed += Math.abs(3 * (prestate.angle - this.angle)) + this.speed;
    if (this.changed > 1) {
      return this.time_since_last_ser = 0;
    }
  };

  Player.prototype.draw = function(cxt, bounds, b_cxt) {
    var opacity;
    // opacity = Math.max(Math.min(20 / Math.max(this.time_since_last_ser - 300, 1), 1), 0.2).toFixed(3);
    //ctx.globalAlpha = this.health/100;
    if (this.hover) {
      cxt.fillStyle = 'rgba(192, 253, 247,' + opacity + ')';
    } else {
      cxt.fillStyle = 'rgba(226,219,226,' + opacity + ')';
    }
    cxt.shadowOffsetX = 0;
    cxt.shadowOffsetY = 0;
    drawRotatedImage(cxt, renderElements.user_ship, this.x + this.width / 2, this.y + this.height / 2, this.angle + Math.PI / 2);
    cxt.shadowBlur = 0;
    cxt.shadowColor = '';
    this.drawName(cxt);

    this.drawBullets(cxt, bounds);

    //return this.bullet_pool.draw(b_cxt, bounds);
  };

  Player.prototype.shoot = function() {
    this.shoot_cnt++;
    console.log(this.id + " "+ "shoots")
    var new_bullet = new Bullet(0, 0);
    new_bullet.set(this.x, this.y, this.angle);
    if(this.bullets.length < 10){
      this.bullets.push(new_bullet);
    }
   // console.log(this.bullets);
    else{
      this.bullets.shift();
      this.bullets.push[new_bullet];
    }
    // return this.bullet_pool.get(this.x, this.y, this.angle);
  };

  Player.prototype.drawBullets = function(cxt, bounds){
    for (var i = this.bullets.length - 1; i >= 0; i--) {
      if (this.bullets[i].traveled_dist <720) {
          this.drawOneBullet(this.bullets[i], cxt, bounds);
      }
      else{
        this.bullets.splice(i, 1);
      }
    };
  };

  Player.prototype.drawName = function(cxt) {
    var opacity, width;
    opacity = Math.max(Math.min(20 / Math.max(this.time_since_last_ser - 300, 1), 1), 0.2).toFixed(3);
    cxt.fillStyle = 'rgba(226,219,226,' + opacity + ')';
    cxt.font = 12 + "px 'proxima-nova-1','proxima-nova-2', arial, sans-serif";
    cxt.textBaseline = 'hanging';
    width = cxt.measureText(this.bullets.length + " " +this.health + "/" + this.id).width;
    return cxt.fillText(this.score+ " " +this.health+ "/" + this.id, this.x - width / 2, this.y + 8);
  };

  Player.prototype.drawOneBullet = function(bullet, cxt, bounds){
    var x, y;
    bullet.y += bullet.speed * Math.sin(bullet.angle);
    bullet.x += bullet.speed * Math.cos(bullet.angle);
    bullet.traveled_dist =Math.sqrt((bullet.x - bullet.initX) * (bullet.x - bullet.initX) +
                                  (bullet.y - bullet.initY) * (bullet.y - bullet.initY));

    if (bullet.y <= bounds[0].y - bullet.height || bullet.y >= bounds[1].y + bullet.height || bullet.x <= bounds[0].x - bullet.width || bullet.x >= bounds[1].x + bullet.width) {
      return true;
    }
    x = bullet.x + renderElements.user_ship.width / 2;
    y = bullet.y + renderElements.user_ship.height / 2;
    cxt.save();
    cxt.translate(x, y);
    cxt.rotate(bullet.angle + Math.PI / 2);
    cxt.fillStyle = "rgba(80,163,162, 0.8)";
    cxt.fillRect(-bullet.width / 2, -bullet.height / 2, bullet.width, bullet.height);
    cxt.restore();
  };

  Player.calAngle = function(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  };

  Player.normalAngle = function(x) {
    while (x < -Math.PI) {
      x += 2 * Math.PI;
    }
    while (x > Math.PI) {
      x -= 2 * Math.PI;
    }
    return x;
  };

  Player.prototype.gdis = function(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  };

  return Player;

})();
