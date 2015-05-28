var Car = function(spline)
{
  var self = this;

  var pt = [];
  self.spline_t = 0;
  self.spline = spline;
  self.on_track = true;

  self.pos = [0,0]; self.posd = [0,0]; //last position delta
  self.ppo = [0,0]; //projected position
  self.map = [0,0]; //map of projection back to spline
  self.dir = [0,0]; self.spd = 0;
  self.vel = [0,0]; //derivable from dir+spd
  self.pve = [0,0]; //projected vel
  self.acc = [0,0]; self.cacc = [0,0]; //cached accel for logging
  self.frc = [0,0]; self.cfrc = [0,0]; //cached frc for logging
  self.ffr = [0,0]; self.cffr = [0,0]; //cached ffr for logging //force of friction

  self.x = self.pos[0];
  self.y = self.pos[1];
  self.r = 10; //radius (const)
  self.m = 10; //mass   (const)
  self.e = 0;  //energy
  self.danger = 0; //about-to-fall-off-ness
  self.maxdanger = 0.9; //when you fall off

  self.applyEnergy = function(e)
  {
    //?
  }
  self.applyForce = function(f)
  {
    self.frc[0] += f*self.dir[0];
    self.frc[1] += f*self.dir[1];
  }

  self.collidesCar = function(ob)
  {
    return (Math.abs(self.pos[0]-ob.x) < self.r &&
        Math.abs(self.pos[1]-ob.y) < self.r);
  }
  self.collidesInRect = function(x,y,w,h)
  {
    return(self.pos[0]+self.r > x && self.pos[0]-self.r < x+w &&
        self.pos[1]+self.r > y && self.pos[1]-self.r < y+h);
  }
  self.collidesOutRect = function(x,y,w,h)
  {
    return(self.pos[0]-self.r < x || self.pos[0]+self.r > x+w ||
        self.pos[1]-self.r < y || self.pos[1]+self.r > y+h);
  }

  var prinall = function(canv)
  {
    canv.context.fillStyle = "#000000";
    canv.context.strokeStyle = "#000000";
    drawPt(canv,self.pos,2);
    //prin(canv,"pos",self.posd,10);

    canv.context.strokeStyle = "#0000FF";
    drawPt(canv,self.ppo,2);
    //prin(canv,"ppo",self.ppo,30);

    canv.context.strokeStyle = "#00FF00";
    drawPt(canv,self.map,5);
    //prin(canv,"map",self.map,50);

    canv.context.strokeStyle = "#00FFFF";
    drawVec(canv,self.pos,add(self.pos,scalmul(copy(self.dir,[0,0]),100)));
    //prin(canv,"dir",self.dir,70);

    canv.context.strokeStyle = "#FF0000";
    drawVec(canv,self.pos,add(self.pos,scalmul(copy(self.vel,[0,0]),10)));
    //prin(canv,"vel",self.vel,90);

    canv.context.strokeStyle = "#FF00FF";
    drawVec(canv,self.pos,add(self.pos,scalmul(copy(self.pve,[0,0]),10)));
    //prin(canv,"pve",self.pve,110);

    canv.context.strokeStyle = "#FFFF00";
    drawVec(canv,self.pos,add(self.pos,scalmul(copy(self.cacc,[0,0]),10)));
    //prin(canv,"acc",self.cacc,130);

    canv.context.strokeStyle = "#000000";
    drawVec(canv,self.pos,add(self.pos,scalmul(copy(self.frc,[0,0]),10)));
    //prin(canv,"frc",self.frc,150);

    canv.context.strokeStyle = "#000000";
    drawVec(canv,self.pos,add(self.pos,scalmul(copy(self.ffr,[0,0]),500)));
    //prin(canv,"ffr",self.ffr,170);
  }
  self.tick = function()
  {
    self.resolveForces();
    self.resolveAccelleration();
    self.resolveVelocity();
  }
  self.resolveForces = function()
  {
    self.frc[0] += self.ffr[0];
    self.frc[1] += self.ffr[1];
    self.acc[0] += self.frc[0]/self.m;
    self.acc[1] += self.frc[1]/self.m;

    copy(self.ffr,self.cffr);
    copy(self.frc,self.cfrc);
    self.ffr[0] = 0;
    self.ffr[1] = 0;
    self.frc[0] = 0;
    self.frc[1] = 0;
  }
  self.resolveAccelleration = function()
  {
    self.vel[0] += self.acc[0];
    self.vel[1] += self.acc[1];

    self.e = self.m*lensqr(self.vel)/2;

    copy(self.acc,self.cacc);
    self.acc[0] = 0;
    self.acc[1] = 0;
  }
  self.resolveVelocity = function()
  {
    copy(self.pos,self.posd);
    if(self.vel[0] == 0 && self.vel[1] == 0) return;
    if(self.on_track)
    {
      var vlen = len(self.vel);
      copy(add(self.pos,self.vel),self.ppo);                       //pos+vel -> ppo
      var tmp_t = self.spline.tForPt(self.ppo,self.spline_t,vlen/100,10);      //find closest t for ppo
      copy(self.spline.ptForT(tmp_t),self.map);                         //nearest ppo -> map
      if(iseq(self.map,self.pos)) return;                          //(if map is pos [no movement] return)
      self.danger = len(sub(self.map,self.ppo));
      if(self.danger > self.maxdanger) self.on_track = false;
      else
      {
        copy(proj(self.vel,sub(self.map,self.pos)),self.pve);      //project velocity onto pos2map -> pve
        copy(sub(self.pve,self.vel),self.ffr);                     //vel2pve -> ffr
        copy(self.pve,self.vel);                                   //pve -> vel
        scalmul(self.vel,0.995);

        copy(add(self.pos,self.vel),self.pos);                     //pos+vel -> pos

        self.spline_t = self.spline.tForPt(self.pos,tmp_t,vlen,10);            //find closest t to resulting pos
        copy(self.spline.ptForT(self.spline_t),self.pos);                      //nearest pos -> pos
        copy(sub(self.spline.ptForT(self.spline_t+0.0001),self.pos),self.dir); //pos2pos(next t) -> dir
        norm(self.dir);                                            //normalize d

        copy(proj(self.vel,self.dir),self.vel);                    //project vel onto dir -> vel
      }
    }
    if(!self.on_track)
    {
      self.pos[0] += self.vel[0];
      self.pos[1] += self.vel[1];
      scalmul(self.vel,0.8);
    }
    copy(sub(self.pos,self.posd),self.posd);
  }

  self.draw = function(canv)
  {
    var d = self.danger/self.maxdanger;
    canv.context.strokeStyle = "rgba("+Math.floor(d*255)+",0,0,1)";
    canv.context.lineWidth = 3;
    drawPt(canv,self.pos,self.r);
    canv.context.lineWidth = 1;
  }

  self.resetOnSpline = function()
  {
    self.spline_t = 0;
    copy(self.spline.ptForT(self.spline_t),self.pos);
    copy(sub(self.spline.ptForT(self.spline_t+0.0001),self.pos),self.dir);
    norm(self.dir);
    self.danger = 0;
    self.on_track = true;

    self.vel = [0,0];
    self.acc = [0,0];
    self.frc = [0,0];
    self.ffr = [0,0];
    self.applyForce(1);
  }
  self.resetOnSpline();
};
