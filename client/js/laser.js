var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

var Bullet = (function() {
  function Bullet(x1, y1) {
    this.x = x1;
    this.y = y1;
    this.initX = 0;
    this.initY = 0;
    this.user_id = 0;
    this.traveled_dist = 0;
    this.reset = bind(this.reset, this);
    this.draw = bind(this.draw, this);
    this.set = bind(this.set, this);
    this.speed = 0;
    this.angle = 0;
    this.width = renderElements.bullet.width;
    this.height = renderElements.bullet.height;
  }

  Bullet.prototype.set = function(x, y, angle, speed) {
    this.x = this.initX = x;
    this.y = this.initY = y;
    this.speed = speed != null ? speed : 10;
    return this.angle = angle != null ? angle : 0;
  };

  Bullet.prototype.draw = function(cxt, bounds) {
    var x, y;
    this.y += this.speed * Math.sin(this.angle);
    this.x += this.speed * Math.cos(this.angle);
    this.traveled_dist =Math.sqrt((this.x - this.initX) * (this.x - this.initX) +
                                  (this.y - this.initY) * (this.y - this.initY));

    if (this.y <= bounds[0].y - this.height || this.y >= bounds[1].y + this.height || this.x <= bounds[0].x - this.width || this.x >= bounds[1].x + this.width) {
      return true;
    }
    x = this.x + renderElements.user_ship.width / 2;
    y = this.y + renderElements.user_ship.height / 2;
    cxt.save();
    cxt.translate(x, y);
    cxt.rotate(this.angle + Math.PI / 2);
    cxt.fillStyle = 'rgba(80,163,162, 0.5)';
    cxt.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    cxt.restore();
    return false;
  };

  Bullet.prototype.reset = function() {
    return this.x = this.y = this.speed = 0;
  };

  return Bullet;

})();
