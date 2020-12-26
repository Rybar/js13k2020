function RetroBuffer(width, height){

    this.WIDTH =     width;
    this.HEIGHT =    height;
    this.PAGESIZE = this.WIDTH *  this.HEIGHT;
    this.PAGES = 3;
  
    this.SCREEN = 0;
    this.PAGE_1= this.PAGESIZE;
    this.PAGE_2= this.PAGESIZE*2;
  
    //relative drawing position and pencolor, for drawing functions that require it.
    this.cursorX = 0;
    this.cursorY = 0;
    this.cursorColor = 23;
    this.cursorColor2 = 25;
  
    //default palette index
    this.palDefault = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
                        32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63];
  
  
    this.c = document.createElement('canvas');
    this.c.width = this.WIDTH;
    this.c.height = this.HEIGHT;
    this.ctx =             this.c.getContext('2d');
    this.renderTarget =    0x00000;
    this.renderSource =    this.PAGESIZE; //buffer is ahead one screen's worth of pixels
  
    this.colors =
    [
    0x00000000,
    0xff131014,
    0xff25173B,
    0xff2D1773,
    0xff2A20B4,
    0xff233EDF,
    0xff0A6AFA,
    0xff1BA3F9,
    0xff41D5FF,
    0xff40FCFF,
    0xff64F2D6,
    0xff43DB9C,
    0xff35C159,
    0xff2EA014,
    0xff3E7A1A,
    0xff3B5224,
  
    0xff202012,
    0xff643414,
    0xffC45C28,
    0xffDE9F24,
    0xffC7D620,
    0xffDBFCA6,
    0xffFFFFFF,
    0xffC0F3FE,
    0xffB8D6FA,
    0xff97A0F5,
    0xff736AE8,
    0xff9B4ABC,
    0xff803A79,
    0xff533340,
    0xff342224,
    0xff1A1C22,
  
    0xff282b32,
    0xff3b4171,
    0xff4775bb,
    0xff63a4db,
    0xff9cd2f4,
    0xffeae0da,
    0xffd1b9b3,
    0xffaf938b,
    0xff8d756d,
    0xff62544a,
    0xff413933,
    0xff332442,
    0xff38315b,
    0xff52528e,
    0xff6a75ba,
    0xffa3b5e9,
  
    0xffffe6e3,
    0xfffbbfb9,
    0xffe49b84,
    0xffbe8d58,
    0xff857d47,
    0xff4e6723,
    0xff648432,
    0xff8daf5d,
    0xffbadc92,
    0xffe2f7cd,
    0xffaad2e4,
    0xff8bb0c7,
    0xff6286a0,
    0xff556779,
    0xff444e5a,
    0xff343942,
    ]
    this.pal = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
               32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64];

    this.dither = [
                0b1111111111111111,
                0b1111111111110111,
                0b1111110111110111,
                0b1111110111110101,
                0b1111010111110101,
                0b1111010110110101,
                0b1110010110110101,
                0b1110010110100101,
                0b1010010110100101,
                0b1010010110100001,
                0b1010010010100001,
                0b1010010010100000,
                0b1010000010100000,
                0b1010000000100000,
                0b1000000000100000,
                0b1000000000000000,
                0b0000000000000000,
                0b1111100110011111,
                0b0000011001100000,
                0b1111100010001000,
                ];
        
        this.pat = 0b1111111111111111;
        
  
    this.ctx.imageSmoothingEnabled = false;
  
    this.imageData =   this.ctx.getImageData(0, 0, this.WIDTH, this.HEIGHT),
    this.buf =             new ArrayBuffer(this.imageData.data.length),
    this.buf8 =            new Uint8Array(this.buf),
    this.data =            new Uint32Array(this.buf),
    this.ram =             new Uint8Array(this.WIDTH * this.HEIGHT * this.PAGES);
  
    return this;
  }
  
  //--------------graphics functions----------------
 
  RetroBuffer.prototype.clear = function clear(color = 0){
    this.ram.fill(color, this.renderTarget, this.renderTarget + this.PAGESIZE);
  }

  RetroBuffer.prototype.setPen = function(color=22, color2=0, dither=0){
    this.cursorColor = color;
    this.cursorColor2 = color2;
    this.pat=dither;
  }
  
  RetroBuffer.prototype.pset = function pset(x,y, color) { 
    color = color|this.cursorColor;
    x = x|0;
    y = y|0;
    let px = (y % 4) * 4 + (x% 4);
    let mask = this.pat & Math.pow(2, px);
    let pcolor = mask ? color : this.cursorColor2;
    if(pcolor == 64)return;
    if(pcolor > 64)pcolor = 0;
    if(x < 0 | x > this.WIDTH-1) return;
    if(y < 0 | y > this.HEIGHT-1) return;

    this.ram[this.renderTarget + y * this.WIDTH + x] = pcolor;
  }
  
  RetroBuffer.prototype.pget = function pget(x=cursorX, y=cursorY, page=0){
    return this.ram[page + x + y * this.WIDTH];
  }
  
  RetroBuffer.prototype.moveTo = function moveTo(x,y){
    cursorX = x;
    cursorY = y;
  }
  
  RetroBuffer.prototype.lineTo = function lineTo(x,y, color){
    color = color|this.cursorColor;
    this.line(this.cursorX, this.cursorY, x, y, color);
    cursorX = x;
    cursorY = y;
  }
  
  RetroBuffer.prototype.line = function line(x1, y1, x2, y2, color) {
    color = color | this.cursorColor;
    x1 = x1|0,
    x2 = x2|0,
    y1 = y1|0,
    y2 = y2|0;
  
    var dy = (y2 - y1);
    var dx = (x2 - x1);
    var stepx, stepy;
  
    if (dy < 0) {
      dy = -dy;
      stepy = -1;
    } else {
      stepy = 1;
    }
    if (dx < 0) {
      dx = -dx;
      stepx = -1;
    } else {
      stepx = 1;
    }
    dy <<= 1;        // dy is now 2*dy
    dx <<= 1;        // dx is now 2*dx
  
  this.pset(x1, y1, color);
    if (dx > dy) {
      var fraction = dy - (dx >> 1);  // same as 2*dy - dx
      while (x1 != x2) {
        if (fraction >= 0) {
          y1 += stepy;
          fraction -= dx;          // same as fraction -= 2*dx
        }
        x1 += stepx;
        fraction += dy;              // same as fraction -= 2*dy
        this.pset(x1, y1, color);
      }
      ;
    } else {
      fraction = dx - (dy >> 1);
      while (y1 != y2) {
        if (fraction >= 0) {
          x1 += stepx;
          fraction -= dy;
        }
        y1 += stepy;
        fraction += dx;
        this.pset(x1, y1, color);
      }
    }
  
  }
  
  RetroBuffer.prototype.circle = function circle(xm=cursorX, ym=cursorY, r=5, color) {
    color = color|this.cursorColor;
    xm = xm|0;
    ym = ym|0;
    r = r|0;
    color = color|0;
    var x = -r, y = 0, err = 2 - 2 * r;
    /* II. Quadrant */
    do {
      this.pset(xm - x, ym + y, color);
      /*   I. Quadrant */
      this.pset(xm - y, ym - x, color);
      /*  II. Quadrant */
      this.pset(xm + x, ym - y, color);
      /* III. Quadrant */
      this.pset(xm + y, ym + x, color);
      /*  IV. Quadrant */
      r = err;
      if (r <= y) err += ++y * 2 + 1;
      /* e_xy+e_y < 0 */
      if (r > x || err > y) err += ++x * 2 + 1;
      /* e_xy+e_x > 0 or no 2nd y-step */
  
    } while (x < 0);
  }
  
  RetroBuffer.prototype.fillCircle = function fillCircle(xm, ym, r=5, color) {
    color = color|this.cursorColor;
    xm = xm|0;
    ym = ym|0;
    r = r|0;
    color = color|0;
  
    if(r < 0) return;
    xm = xm|0; ym = ym|0, r = r|0; color = color|0;
    var x = -r, y = 0, err = 2 - 2 * r;
    /* II. Quadrant */
    do {
      this.line(xm-x, ym-y, xm+x, ym-y, color);
      this.line(xm-x, ym+y, xm+x, ym+y, color);
      r = err;
      if (r <= y) err += ++y * 2 + 1;
      if (r > x || err > y) err += ++x * 2 + 1;
    } while (x < 0);
  }
  
  RetroBuffer.prototype.rect = function rect(x, y, w=16, h=16, color) {
    color = color|this.cursorColor;
    //let { line } = this;
    let
    x1 = x|0,
    y1 = y|0,
    x2 = (x+w)|0,
    y2 = (y+h)|0;
  
  
    this.line(x1,y1, x2, y1, color);
    this.line(x2, y1, x2, y2, color);
    this.line(x1, y2, x2, y2, color);
    this.line(x1, y1, x1, y2, color);
  }
  
  RetroBuffer.prototype.fillRect = function fillRect(x, y, w=16, h=16, color) {
    
    let
    x1 = x|0,
    y1 = y|0,
    x2 = ( (x+w)|0 )-1,
    y2 = ((y+h)|0 )-1;
    color = color|this.cursorColor;
  
    var i = Math.abs(y2 - y1);
    this.line(x1, y1, x2, y1, color);
  
    if(i > 0){
      while (--i) {
        this.line(x1, y1+i, x2, y1+i, color);
      }
    }
  
    this.line(x1,y2, x2, y2, color);
  }
  
  
  
  RetroBuffer.prototype.outline = function outline(renderSource, renderTarget, color=cursorColor, color2=color, color3=color, color4=color){
  
    for(let i = 0; i <= WIDTH; i++ ){
      for(let j = 0; j <= HEIGHT; j++){
        let left = i-1 + j * WIDTH;
        let right = i+1 + j * WIDTH;
        let bottom = i + (j+1) * WIDTH;
        let top = i + (j-1) * WIDTH;
        let current = i + j * WIDTH;
  
        if(ram[renderSource + current]){
          if(!ram[renderSource + left]){
            ram[renderTarget + left] = color;
          };
          if(!ram[renderSource + right]){
            ram[renderTarget + right] = color3;
          };
          if(!ram[renderSource + top]){
            ram[renderTarget + top] = color2;
          };
          if(!ram[renderSource + bottom]){
            ram[renderTarget + bottom] = color4;
          };
        }
      }
    }
  }
  
  RetroBuffer.prototype.triangle = function triangle(x1, y1, x2, y2, x3, y3, color=cursorColor) {
    this.line(x1,y1, x2,y2, color);
    this.line(x2,y2, x3,y3, color);
    this.line(x3,y3, x1,y1, color);
  }
  
  //from https://www-users.mat.uni.torun.pl//~wrona/3d_tutor/tri_fillers.html
  RetroBuffer.prototype.fillTriangle = function fillTriangle( p1, p2, p3, color) {
    color = color | this.cursorColor;
    //sort vertices by y, top first
    let P = [p1, p2, p3].sort((a,b) => a.y - b.y);
    let A = P[0], B = P[1], C = P[2],
        dx1 = 0, dx2 = 0, dx3 = 0,
        S, E;
    if(B.y-A.y > 0) dx1=(B.x-A.x)/(B.y-A.y);
    if(C.y-A.y > 0) dx2=(C.x-A.x)/(C.y-A.y);
    if(C.y-B.y > 0) dx3=(C.x-B.x)/(C.y-B.y);

    S=E=A;
    if(dx1 > dx2) {
      for(;S.y<=B.y;S.y++,E.y++,S.x+=dx2, E.x+=dx1){
        this.line(S.x, E.x, S.y, color);
      }
        E=B;
        for( ; S.y<=C.y; S.y++, E.y++, S.x+=dx2, E.x+=dx3 )
			  horizline(S.x, S.y, E.x, S.y, color);
	  } else {
		  for( ; S.y<=B.y; S.y++, E.y++, S.x+=dx1, E.x+=dx2) {
        this.line(S.x, S.y, E.x, S.y, color);
      }
      S=B;
      for( ; S.y<=C.y; S.y++, E.y++, S.x+=dx3, E.x+=dx2){
        this.line(S.x, S.y, E.x, S.y, color);
      }
	  }
  }
  
  RetroBuffer.prototype.imageToRam = function imageToRam(image, address) {
  
         //var image = E.smallcanvas.toDataURL("image/png");
          let tempCanvas = document.createElement('canvas');
         tempCanvas.width = WIDTH;
         tempCanvas.height = HEIGHT;
         let context = tempCanvas.getContext('2d');
         //draw image to canvas
         context.drawImage(image, 0, 0);
  
         //get image data
         var imageData = context.getImageData(0,0, WIDTH, HEIGHT);
  
         //set up 32bit view of buffer
         let data = new Uint32Array(imageData.data.buffer);
  
         //compare buffer to palette (loop)
         for(var i = 0; i < data.length; i++) {
  
             ram[address + i] = colors.indexOf(data[i]);
         }
  }
  
  RetroBuffer.prototype.render = function render() {
  
    var i = this.PAGESIZE;  // display is first page of ram
  
    while (i--) {
      /*
      data is 32bit view of final screen buffer
      for each pixel on screen, we look up it's color and assign it
      */
     if(i > 0) this.data[i] = this.colors[this.pal[this.ram[i]]];
  
    }
  
    this.imageData.data.set(this.buf8);
  
    this.ctx.putImageData(this.imageData, 0, 0);
  
  }
  
  export default RetroBuffer;
  
  //--------END Engine.js-------------------
  