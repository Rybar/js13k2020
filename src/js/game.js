import RetroBuffer from './retrobuffer.js';
import MusicPlayer from './musicplayer.js';
import song from './song.js';
import cellComplete from './cellComplete.js';
import { playSound, Key } from './utils.js';
import SimplexNoise from './simplexperlin.js';

const c = document.getElementById('c')
const ctx = c.getContext('2d')
const w = 320;
const h = 180;
const mw = w/2; const mh = h/2; 
c.width = w; c.height = h;
p = {
  x: 100,
  y: 100
}

audioCtx = new AudioContext;
audioMaster = audioCtx.createGain();
audioMaster.connect(audioCtx.destination);

const r = new RetroBuffer(w,h);
const perlin = new SimplexNoise();
document.body.appendChild(r.c);
var t = 1;

sounds = {};
window.playSound = playSound;
soundsReady = 0;
  sndData = [
    {name:'song', data: song},
    {name:'cellComplete', data: cellComplete},
    ]
  //music stuff-----------------------------------------------------
      sndData.forEach(function(o){
          var sndGenerator = new MusicPlayer();
          sndGenerator.init(o.data);
          var done = false;
          setInterval(function () {
            if (done) {
              return;
            }
            done = sndGenerator.generate() == 1;
            if(done){
              let wave = sndGenerator.createWave().buffer;
              audioCtx.decodeAudioData(wave, function(buffer) {
                sounds[o.name] = buffer;
                soundsReady++;
                //gameSong = playSound(sounds.song, 1, 0, 0.7, true);
              })
            }
          },0)
    })




r.renderTarget=r.PAGE_1;
for(let x = 0; x < w; x+=2){
  for(let y = 0; y < h; y+=2){

    r.setPen(12,13,8);
    //r.pat = r.dither[ Math.floor( ( ( Math.sin(x/20 + y/41 + Math.random()) + 1) / 2 * 15 ) ) ] ;
    let noise =(perlin.noise(x/20 + t/100, y/70 + t/100));
    let gradient = Math.floor( ((noise + 1)/2) * 31 );
    if(gradient > 15){
      gradient = gradient - 15;
      r.setPen(13,14,8);
      
    }
    r.pat = r.dither[gradient];
    r.fillRect(x,y,2,2);
  }
}

function step(){
  t+=1;
  if(Key.isDown(Key.LEFT)){ p.x -= 1}
  else if(Key.isDown(Key.RIGHT)){p.x += 1}
  if(Key.isDown(Key.UP)){p.y -= 1}
  else if(Key.isDown(Key.DOWN)){p.y += 1}
  if(Key.justReleased(Key.d)){playSound(sounds.cellComplete)}
}

function draw(){
  
  r.renderTarget = r.SCREEN;
  r.ram.copyWithin(0, r.PAGE_1, r.PAGE_1+r.PAGESIZE)

  

  r.pat = r.dither[Math.floor( ( ( Math.sin(t/50)+1) / 2 ) * 15 )];
  r.cursorColor = 4; r.cursorColor2 = 64;
  r.fillCircle( p.x + Math.sin(t/20)*20, p.y + Math.cos(t/20)*20, 10, 4);
  r.pat = r.dither[0];
  r.fillCircle( p.x, p.y, 3, 1)

  let p1 = {x: 16, y: 16},
      p2 = {x: 64, y: 16},
      p3 = {x: 16, y: 64};

  r.fillTriangle(p1, p2, p3, 16);
  r.render();
}

//initialize  event listeners--------------------------
window.addEventListener('keyup', function (event) {
  Key.onKeyup(event);
}, false);
window.addEventListener('keydown', function (event) {
  Key.onKeydown(event);
}, false);
window.addEventListener('blur', function (event) {
  paused = true;
}, false);
window.addEventListener('focus', function (event) {
  paused = false;
}, false);

//main game loop---------------------------------------
function loop(){
  step();
  draw();
  requestAnimationFrame(loop);
}
loop();