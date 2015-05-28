var GamePlayScene = function(game, stage)
{
  var self = this;

  var keyer;
  var dragger;

  var spline;
  var track;
  var track_editor;
  var cars = [];
  var sportsmath = [];
  var controllers = [];
  var uis = [];

  self.ready = function()
  {
    keyer = new Keyer({source:stage.dispCanv.canvas});

    track_editor = new TrackEditor(stage.drawCanv.canvas.width-200, stage.drawCanv.canvas.height-40);
    track_editor.tick(); //generate first track
    spline = track_editor.spline;
    track_editor.updated = false; //re-set

    track = new Track(spline,100,20,stage.drawCanv.canvas.width-200,stage.drawCanv.canvas.height-40);
    for(var i = 0; i < 2; i++)
    {
      cars[i] = new Car(track,(i == 0 ? "#FF0000" : "#0000FF"));
      controllers[i] = new Controller(cars[i], (i == 0 ? 81 : 80));
      keyer.register(controllers[i]);
      sportsmath[i] = new SportsMath(cars[i], controllers[i], stage.drawCanv.canvas.width-100, 120, 100, 500);
      uis[i] = new UI(cars[i], controllers[i], sportsmath[i], i*(stage.drawCanv.canvas.width-200),0,200,400);
    }

    var pt = spline.ptForT(0);
    for(var i = 0; i < cars.length; i++)
    {
      cars[i].x = pt[0];
      cars[i].y = pt[1];
    }
  };

  self.tick = function()
  {
    keyer.flush();
    for(var i = 0; i < cars.length; i++)
    {
      controllers[i].tick();
      cars[i].tick();
      sportsmath[i].tick();
    }
  };

  self.draw = function()
  {
    var canv = stage.drawCanv;
    track.draw(canv);
    for(var i = 0; i < cars.length; i++)
    {
      cars[i].draw(canv);
      uis[i].draw(canv);
    }
  };

  self.cleanup = function()
  {
  };
};

