var SportsMath = function(car,x,y,w,h)
{
  var self = this;

  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;

  self.times = [];
  self.t = 0;
  self.best = 9999999;

  self.tick = function()
  {
    self.t++;
  }
  self.lap = function()
  {
    if(self.t < 20) { self.reset(); return; } //bad lap reading
    if(self.t < self.best)
      self.best = self.t;

    self.times.push(self.t);
    self.t = 0;
  }
  self.reset = function()
  {
    self.t = 0;
  }
  self.draw = function(canv)
  {
    if(car.on) canv.context.fillStyle = "#000000";
    else       canv.context.fillStyle = "#FF0000";
    canv.context.fillText("Time: "+self.t,self.x,self.y);
    canv.context.fillText("Best: "+self.best,self.x,self.y+20);
    var y = self.y+40;
    canv.context.fillStyle = "#000000";
    for(var i = 0; i < self.times.length; i++)
    {
      canv.context.fillText((self.times.length-i)+": "+self.times[self.times.length-i-1],self.x,y);
      y+=20;
    }
  }
}

