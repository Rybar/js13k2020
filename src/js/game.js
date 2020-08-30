import RetroBuffer from './retrobuffer.js';
import MusicPlayer from './musicplayer.js';
import song from './song.js';
import cellComplete from './cellComplete.js';
import { playSound } from './utils.js';

const c = document.getElementById('c')
const ctx = c.getContext('2d')
const w = window.innerWidth/4|0;
const h = window.innerHeight/4|0;
const mw = w/2; const mh = h/2;
c.width = w; c.height = h;

audioCtx = new AudioContext;
audioMaster = audioCtx.createGain();
audioMaster.connect(audioCtx.destination);

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
                gameSong = playSound(sounds.song, 1, 0, 0.7, true);
              })
            }
          },0)
    })

ctx.fillStyle = "#505";
ctx.fillRect(0,0,w,h);
ctx.fillStyle = "#909";

const r = new RetroBuffer(w,h);
document.body.appendChild(r.c);
var t = 1;

function loop(){
  t+=1;
  r.fillRect(0,0,w,h,0);
  r.fillCircle( mw + Math.sin(t/20)*20, mh + Math.cos(t/20)*20, 10, Date.now()/100%64);
  
  let i = 30000;
  while(--i){
    r.pset(Math.random()*w, Math.random()*h, 0);
  }

  r.render();
  requestAnimationFrame(loop);
}
loop();