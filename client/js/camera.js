var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

var Camera = (function() {
  function Camera(canvas, context, x, y) {
    this.canvas = canvas;
    this.context = context;
    this.x = x;
    this.y = y;
    this.startUILayer = bind(this.startUILayer, this);
    this.getOuterBounds = bind(this.getOuterBounds, this);
    this.getInnerBounds = bind(this.getInnerBounds, this);
    this.getBounds = bind(this.getBounds, this);
    this.update = bind(this.update, this);
    this.setupContext = bind(this.setupContext, this);
    this.min_zoom = 1.3;
    this.max_zoom = 1.8;
    this.zoom = this.min_zoom;
    this.bgcolor = 0 * 360;

  }

  Camera.prototype.setupContext = function() {
    var bgd = new Image();
    bgd.src = "imgs/bgd.jpg";
      this.context.drawImage(bgd,0,0);   
    var trans_x, trans_y;
    trans_x = this.canvas.width / 2 - this.x * this.zoom;
    trans_y = this.canvas.height / 2 - this.y * this.zoom;
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    // this.context.fillStyle = 'hsl(' + this.bgcolor + ',0%,0%)';
    //this.context.fillStyle = 'hsl(' + this.bgcolor + ',0%,0%)';

    //this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.translate(trans_x, trans_y);

    return this.context.scale(this.zoom, this.zoom);
  };

  Camera.prototype.update = function(scene) {
    var delta, i, len, ref, t_zoom, wp;
    this.bgcolor += 0.08;
    if (this.bgcolor > 360) {
      this.bgcolor = 0;
    }
    t_zoom = scene.camera.max_zoom + (scene.camera.min_zoom - scene.camera.max_zoom) * Math.min(scene.user.speed, scene.user.max_speed) / scene.user.max_speed;
    scene.camera.zoom += (t_zoom - scene.camera.zoom) / 60;
    delta = {
      x: (scene.user.x - scene.camera.x) / 30,
      y: (scene.user.y - scene.camera.y) / 30
    };
    if (Math.abs(delta.x) + Math.abs(delta.y) > 0.1) {
      scene.camera.x += delta.x;
      scene.camera.y += delta.y;
    }
    ref = scene.stars;
    for (i = 0, len = ref.length; i < len; i++) {
      wp = ref[i];
      wp.x -= (wp.z - 1) * delta.x;
      wp.y -= (wp.z - 1) * delta.y;
    }
  };

  Camera.prototype.getBounds = function() {
    return [
      {
        x: this.x - this.canvas.width / 2 / this.zoom,
        y: this.y - this.canvas.height / 2 / this.zoom
      }, {
        x: this.x + this.canvas.width / 2 / this.zoom,
        y: this.y + this.canvas.height / 2 / this.zoom
      }
    ];
  };

  Camera.prototype.getInnerBounds = function() {
    return [
      {
        x: this.x - this.canvas.width / 2 / this.max_zoom,
        y: this.y - this.canvas.height / 2 / this.max_zoom
      }, {
        x: this.x + this.canvas.width / 2 / this.max_zoom,
        y: this.y + this.canvas.height / 2 / this.max_zoom
      }
    ];
  };

  Camera.prototype.getOuterBounds = function() {
    return [
      {
        x: this.x - this.canvas.width / 2 / this.min_zoom,
        y: this.y - this.canvas.height / 2 / this.min_zoom
      }, {
        x: this.x + this.canvas.width / 2 / this.min_zoom,
        y: this.y + this.canvas.height / 2 / this.min_zoom
      }
    ];
  };

  Camera.prototype.startUILayer = function() {
    return this.context.setTransform(1, 0, 0, 1, 0, 0);
  };

  return Camera;

})();
