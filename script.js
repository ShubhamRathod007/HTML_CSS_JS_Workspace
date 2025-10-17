
  // Simple dodge game: move a player left/right to avoid falling obstacles
  (function(){
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const levelEl = document.getElementById('level');
    const livesEl = document.getElementById('lives');
    const highEl = document.getElementById('high');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');

    const W = canvas.width, H = canvas.height;

    let player, obstacles, keys, running, paused, lastSpawn, score, level, lives, highScore;

    function reset(){
      player = {x: W/2 - 25, y: H - 70, w:50, h:50, speed:6};
      obstacles = [];
      keys = {};
      running = false;
      paused = false;
      lastSpawn = 0;
      score = 0;
      level = 1;
      lives = 3;
      highScore = Number(localStorage.getItem('dodge_high')||0);
      highEl.textContent = highScore;
      updateHUD();
      drawSplash();
    }

    function updateHUD(){
      scoreEl.textContent = score;
      levelEl.textContent = level;
      livesEl.textContent = lives;
      highEl.textContent = highScore;
    }

    function start(){
      if(!running){
        running = true; paused = false; lastSpawn = performance.now();
        requestAnimationFrame(loop);
      }
    }

    function togglePause(){
      if(!running) return;
      paused = !paused;
      if(!paused) requestAnimationFrame(loop);
    }

    function endGame(){
      running = false;
      if(score > highScore){
        highScore = score; localStorage.setItem('dodge_high', String(highScore));
      }
      updateHUD();
      drawGameOver();
    }

    function spawnObstacle(now){
      // spawn faster with level; obstacles get wider at higher levels
      const gap = Math.max(600 - level*60, 160);
      if(now - lastSpawn < gap) return;
      lastSpawn = now;
      const w = 30 + Math.random()*60 + Math.min(level*5,60);
      const x = Math.random()*(W - w);
      const speed = 1.5 + Math.random()*1.5 + level*0.4;
      obstacles.push({x,w,y:-60,h:20+Math.random()*40,speed,passed:false});
    }

    function loop(now){
      if(!running || paused) return;
      // clear
      ctx.clearRect(0,0,W,H);

      // background stars
      drawBackground();

      // input
      if(keys['ArrowLeft'] || keys['a'] || keys['A']) player.x -= player.speed;
      if(keys['ArrowRight'] || keys['d'] || keys['D']) player.x += player.speed;
      // clamp
      player.x = Math.max(0, Math.min(W - player.w, player.x));

      // spawn
      spawnObstacle(now);

      // update obstacles
      for(let i=obstacles.length-1;i>=0;i--){
        const ob = obstacles[i];
        ob.y += ob.speed;
        // if passed bottom
        if(ob.y > H){
          obstacles.splice(i,1);
          score += 10;
          if(score % 100 === 0) levelUp();
        }
      }

      // collision
      for(const ob of obstacles){
        if(collide(player, ob)){
          // lose life, remove block, brief invulnerability could be added
          lives -= 1;
          obstacles = obstacles.filter(o=>o!==ob);
          if(lives <= 0) return endGame();
        }
      }

      // draw player
      drawPlayer();

      // draw obstacles
      for(const ob of obstacles) drawObstacle(ob);

      // draw HUD on canvas
      drawHUD();

      updateHUD();

      requestAnimationFrame(loop);
    }

    function levelUp(){
      level += 1;
    }

    function collide(a,b){
      return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
    }

    function drawBackground(){
      // gradient is set by CSS, add some subtle moving elements
      ctx.save();
      // moving grid lines
      ctx.globalAlpha = 0.06;
      for(let i=0;i<20;i++){
        ctx.fillStyle = '#ffffff';
        ctx.fillRect((i*73 + Date.now()/50) % W, 0, 1, H);
      }
      ctx.restore();
    }

    function drawPlayer(){
      ctx.save();
      // player rectangle with subtle glow
      const grad = ctx.createLinearGradient(player.x, player.y, player.x+player.w, player.y+player.h);
      grad.addColorStop(0,'#60a5fa'); grad.addColorStop(1,'#3b82f6');
      ctx.fillStyle = grad;
      roundRect(ctx, player.x, player.y, player.w, player.h, 8, true, false);
      // eyes
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(player.x + 12, player.y + 18, 6, 6);
      ctx.fillRect(player.x + player.w - 20, player.y + 18, 6, 6);
      ctx.restore();
    }

    function drawObstacle(o){
      ctx.save();
      // color based on speed
      const t = Math.min(1, (o.speed-1)/4);
      const r = Math.floor(255 * (0.9 - 0.6*t));
      const g = Math.floor(100 + 100*t);
      const b = Math.floor(150 + 80*t);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      roundRect(ctx, o.x, o.y, o.w, o.h, 6, true, false);
      ctx.restore();
    }

    function drawHUD(){
      ctx.save();
      ctx.font = '18px system-ui,Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText('Score: '+score, 12, 22);
      ctx.fillText('Level: '+level, 12, 44);
      ctx.fillText('Lives: '+lives, W - 110, 22);
      ctx.restore();
    }

    function roundRect(ctx,x,y,w,h,r,fill,stroke){
      if(typeof r==='undefined') r=5;
      ctx.beginPath();
      ctx.moveTo(x+r,y);
      ctx.arcTo(x+w,y,x+w,y+h,r);
      ctx.arcTo(x+w,y+h,x,y+h,r);
      ctx.arcTo(x,y+h,x,y,r);
      ctx.arcTo(x,y,x+w,y,r);
      ctx.closePath();
      if(fill) ctx.fill();
      if(stroke) ctx.stroke();
    }

    function drawSplash(){
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(0,0,W,H);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '28px system-ui,Arial';
      ctx.textAlign = 'center';
      ctx.fillText('DODGE', W/2, H/2 - 20);
      ctx.font = '14px system-ui,Arial';
      ctx.fillText('Avoid falling blocks — use ← → or A D to move', W/2, H/2 + 10);
      ctx.restore();
    }

    function drawGameOver(){
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0,0,W,H);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = '36px system-ui,Arial';
      ctx.fillText('Game Over', W/2, H/2 - 20);
      ctx.font = '18px system-ui,Arial';
      ctx.fillText('Score: '+score + '   High: '+highScore, W/2, H/2 + 20);
      ctx.restore();
    }

    // keyboard
    window.addEventListener('keydown', e=>{ keys[e.key]=true; if(e.key===' '){ e.preventDefault(); if(!running) start(); else togglePause(); } });
    window.addEventListener('keyup', e=>{ keys[e.key]=false; });

    // start/pause buttons
    startBtn.addEventListener('click', ()=>{ reset(); start(); });
    pauseBtn.addEventListener('click', ()=>{ togglePause(); });

    // touch controls: tap left/right
    canvas.addEventListener('touchstart', (ev)=>{
      ev.preventDefault();
      const t = ev.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = t.clientX - rect.left;
      if(x < rect.width/2) keys['ArrowLeft'] = true; else keys['ArrowRight']=true;
    }, {passive:false});
    canvas.addEventListener('touchend', (ev)=>{ keys['ArrowLeft']=false; keys['ArrowRight']=false; }, {passive:false});

    // small demo AI to add variety: obstacles shift width a bit over time
    setInterval(()=>{
      for(const ob of obstacles) ob.x += Math.sin(Date.now()/1000 + ob.x) * 0.2;
    }, 50);

    // initial
    reset();

  })();
  