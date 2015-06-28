var app = null;

var gameLoop = function() {
  app.update();
  app.sync();
  return app.draw();
};

var animate = function() {
  requestAnimFrame(animate);
  return gameLoop();
};

window.requestAnimFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
    return window.setTimeout(callback, 1000 / 60);
  };
})();

var setListeners = function(app) {
  window.addEventListener('resize', app.resize, false);
  document.addEventListener('mousemove', app.mousemove, false);
  document.addEventListener('mousedown', app.mousedown, false);
  document.addEventListener('mouseup', app.mouseup, false);
  document.addEventListener('keydown', app.keydown, false);
  document.addEventListener('keyup', app.keyup, false);
  return document.body.onselectstart = function() {
    return false;
  };
};

var initApp = function() {
  if (app !== null) {
    return;
  }
  app = new App(document.getElementById('canvas'), document.getElementById('laser-canvas'));
  setListeners(app);
  return animate();
};

initApp();
