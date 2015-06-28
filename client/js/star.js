var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

var Star = (function() {
  function Star() {
    this.x = 0;
    this.y = 0;
    this.z = Math.random() * 1 + 0.3;
    this.size = 1.2;
    this.opacity = Math.random() * 0.9 + 0.1;
    this.draw = bind(this.draw, this);
    this.update = bind(this.update, this);
  }

  Star.prototype.update = function(bounds) {
    if (this.x === 0 || this.y === 0) {
      this.x = Math.random() * (bounds[1].x - bounds[0].x) + bounds[0].x;
      this.y = Math.random() * (bounds[1].y - bounds[0].y) + bounds[0].y;
    }
    this.x = this.x < bounds[0].x ? bounds[1].x : this.x;
    this.y = this.y < bounds[0].y ? bounds[1].y : this.y;
    this.x = this.x > bounds[1].x ? bounds[0].x : this.x;
    this.y = this.y > bounds[1].y ? bounds[0].y : this.y;
  };

  Star.prototype.draw = function(context) {
    context.fillStyle = 'rgba(255,255,255,' + this.opacity + ')';
    context.beginPath();
    context.arc(this.x, this.y, this.z * this.size, 0, Math.PI * 2, true);
    context.closePath();
    context.fill();
  };

  return Star;

})();
