/* Persistent pigment transport. No image assets or external dependencies. */
(() => {
  'use strict';
  const vertex = `
    attribute vec2 a_position;
    varying vec2 uv;
    void main() { uv = a_position * .5 + .5; gl_Position = vec4(a_position, 0., 1.); }
  `;
  const common = `
    precision highp float;
    varying vec2 uv;
    uniform vec2 u_size;
    uniform float u_seed;
    uniform float u_time;
    uniform float u_dt;
    uniform sampler2D u_ink;
    uniform sampler2D u_predict;
    uniform vec4 u_stirs[6];
    uniform vec3 u_palette[8];
    uniform vec4 u_drop;
    uniform vec3 u_color;
    uniform float u_variation;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)) + u_seed) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
      return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);
    }
    float fbm(vec2 p) {
      float n=0., a=.5;
      for(int i=0;i<5;i++) { n+=a*noise(p); p=mat2(.8,.6,-.6,.8)*p*2.04+7.3; a*=.5; }
      return n;
    }
    vec2 twist(vec2 p,vec2 center,float radius,float strength) {
      vec2 d=p-center; float a=strength*exp(-dot(d,d)/(radius*radius));
      return center+mat2(cos(a),-sin(a),sin(a),cos(a))*d;
    }
    vec2 metric() { return u_size/min(u_size.x,u_size.y); }
    vec2 velocity(vec2 p) {
      float t=u_time*.045, s=u_seed*.013;
      // Derivatives of smooth stream functions: divergence-free currents.
      vec2 v=vec2(cos(p.y*4.2+t)*sin(p.x*3.1+s)*4.2,
                 -cos(p.x*3.1+s)*sin(p.y*4.2+t)*3.1)*.00080;
      v+=vec2(cos(p.y*8.7-t)*sin(p.x*6.3-s)*8.7,
              -cos(p.x*6.3-s)*sin(p.y*8.7-t)*6.3)*.00022;
      vec2 a=p-vec2(.31,.49)*metric();
      vec2 b=p-vec2(.74,.37)*metric();
      vec2 c=p-vec2(.57,.79)*metric();
      v+=vec2(-a.y,a.x)*exp(-dot(a,a)/.15)*.052;
      v-=vec2(-b.y,b.x)*exp(-dot(b,b)/.09)*.074;
      v+=vec2(-c.y,c.x)*exp(-dot(c,c)/.052)*.060;
      for(int i=0;i<6;i++) {
        vec4 stir=u_stirs[i];
        float co=cos(stir.w),si=sin(stir.w);
        mat2 turn=mat2(co,-si,si,co);
        vec2 d=turn*(p-stir.xy*metric());
        float falloff=exp(-dot(d,d)/.020);
        // A compact stream-function strain stretches a deposit into a ribbon
        // while folding the neighboring pigment, with zero divergence.
        vec2 strain=vec2(d.x*(1.-2.*d.y*d.y/.020),-d.y*(1.-2.*d.x*d.x/.020));
        v+=mat2(co,si,-si,co)*strain*falloff*stir.z;
      }
      return v*.48;
    }
    vec2 departure(vec2 q,float dt) {
      vec2 p=q*metric();
      vec2 mid=p-velocity(p)*dt*.5;
      return clamp((p-velocity(mid)*dt)/metric(),.5/u_size,1.-.5/u_size);
    }
  `;
  const seedShader = common + `
    void main() {
      vec2 aspect=metric();
      vec2 p=(uv-.5)*aspect;
      float s=u_seed*.017;
      // Different scales of folding share a single material coordinate.
      p.x += .22*sin(p.y*3.8+s); p.y+=.13*sin(p.x*4.3-s);
      p=twist(p,vec2(-.30,.06)*aspect,.56,2.25);
      p=twist(p,vec2(.26,-.23)*aspect,.43,-2.75);
      p=twist(p,vec2(.35,.27)*aspect,.31,2.05);
      p=twist(p,vec2(-.24,-.30)*aspect,.27,-1.65);
      p=twist(p,vec2(.03,.02)*aspect,.20,1.48);
      vec2 q=p+vec2(fbm(p*3.2+vec2(s,2.)),fbm(p*3.2+vec2(8.,s)))*.14;
      q=twist(q,vec2(.23,.13),.18,-1.65);
      q=twist(q,vec2(-.18,-.10),.13,1.8);
      float f=q.y*.84+q.x*.32+.09*sin(q.x*7.2)+.07*fbm(q*5.4);
      f+=(fbm(q*13.)-.5)*.010;
      float wide=.5+.5*sin(f*21.+s);
      vec3 color=mix(u_palette[0],u_palette[2],smoothstep(.03,.65,wide));
      color=mix(color,u_palette[3],smoothstep(.67,.95,wide)*.88);
      float strata=.5+.5*sin(f*235.+sin(f*51.)*1.8);
      float finer=.5+.5*sin(f*690.+sin(f*117.)*.9);
      color=mix(color,mix(u_palette[1],u_palette[3],strata),.25);
      color=mix(color,u_palette[3],pow(finer,14.)*.24);
      color=mix(color,u_palette[0],pow(1.-strata,24.)*.19);
      // Mineral seams arise inside the same warped field, never on an overlay.
      float seamRegion=smoothstep(.01,.24,-q.y+q.x*.36)*smoothstep(.40,.84,wide);
      float vein=.5+.5*sin(f*330.+sin(f*67.));
      vec3 mineral=mix(u_palette[5],u_palette[7],smoothstep(.2,.7,vein));
      mineral=mix(mineral,u_palette[6],smoothstep(.72,.95,vein));
      color=mix(color,mineral,seamRegion*pow(.5+.5*sin(f*170.),5.)*.76);
      float grain=hash(gl_FragCoord.xy)-.5;
      color+=(fbm(q*72.)-.5)*.025+grain*.013;
      gl_FragColor=vec4(color,1.);
    }
  `;
  const transportShader = common + `
    vec3 sampleInk(vec2 q) {
      // Nine-tap Catmull–Rom transport retains thin veins under repeated
      // subpixel motion. Bilinear feedback progressively blurs the painting.
      vec2 p=q*u_size,base=floor(p-.5)+.5,f=p-base;
      vec2 w0=f*(-.5+f*(1.-.5*f));
      vec2 w1=1.+f*f*(-2.5+1.5*f);
      vec2 w2=f*(.5+f*(2.-1.5*f));
      vec2 w3=f*f*(-.5+.5*f), w12=w1+w2;
      vec2 p0=(base-1.)/u_size,p12=(base+w2/w12)/u_size,p3=(base+2.)/u_size;
      vec3 c=texture2D(u_ink,vec2(p0.x,p0.y)).rgb*w0.x*w0.y;
      c+=texture2D(u_ink,vec2(p12.x,p0.y)).rgb*w12.x*w0.y;
      c+=texture2D(u_ink,vec2(p3.x,p0.y)).rgb*w3.x*w0.y;
      c+=texture2D(u_ink,vec2(p0.x,p12.y)).rgb*w0.x*w12.y;
      c+=texture2D(u_ink,p12).rgb*w12.x*w12.y;
      c+=texture2D(u_ink,vec2(p3.x,p12.y)).rgb*w3.x*w12.y;
      c+=texture2D(u_ink,vec2(p0.x,p3.y)).rgb*w0.x*w3.y;
      c+=texture2D(u_ink,vec2(p12.x,p3.y)).rgb*w12.x*w3.y;
      c+=texture2D(u_ink,p3).rgb*w3.x*w3.y;
      return clamp(c,0.,1.);
    }
    void main() {
      vec2 q=uv;
      float coverage=0.;
      if(u_drop.z>0.) {
        vec2 d=(uv-u_drop.xy)*metric();
        float r2=dot(d,d);
        // The inverse area map moves every older pigment out of the incoming
        // ink's footprint. Repeated increments accumulate into a colored pool.
        float influence=exp(-r2/.19);
        float angle=atan(d.y,d.x);
        float contour=1.+u_variation*(.28*sin(angle*2.+u_seed)+.12*sin(angle*3.-u_seed*.7));
        float inserted=u_drop.z*influence*contour;
        float r=sqrt(r2);
        float from=sqrt(max(0.,r2-inserted));
        q=u_drop.xy+d*(from/max(r,.00001))/metric();
        float edge=1.4/min(u_size.x,u_size.y);
        coverage=1.-smoothstep(sqrt(inserted)-edge,sqrt(inserted)+edge,r);
      }
      vec3 color=sampleInk(departure(clamp(q,.5/u_size,1.-.5/u_size),u_dt));
      if(coverage>0.) {
        float dilution=.055+.035*sin(u_drop.w*19.+u_seed)+.018*sin(u_drop.w*71.);
        vec3 ink=mix(u_color,u_palette[3],dilution);
        ink+=(noise(uv*u_size*.37)-.5)*.012;
        color=mix(color,ink,coverage);
      }
      gl_FragColor=vec4(color,1.);
    }
  `;
  const displayShader = common + `
    void main() {
      vec3 c=texture2D(u_ink,uv).rgb;
      // Light is diffuse; pigment carries the structure without a glossy bevel.
      c+=(hash(gl_FragCoord.xy)-.5)*.006;
      gl_FragColor=vec4(c,1.);
    }
  `;

  window.createMarblingSurface = (canvas) => {
    const gl=canvas.getContext('webgl',{alpha:false,depth:false,stencil:false,antialias:false,preserveDrawingBuffer:true});
    if(!gl) return createFallback(canvas);
    // Small movements need floating-point storage: rounding on every frame
    // creates false color bands and eventually destroys the pigment detail.
    const full=gl.getExtension('OES_texture_float');
    const fullLinear=gl.getExtension('OES_texture_float_linear');
    const fullColor=gl.getExtension('WEBGL_color_buffer_float');
    const half=gl.getExtension('OES_texture_half_float');
    const halfLinear=gl.getExtension('OES_texture_half_float_linear');
    gl.getExtension('EXT_color_buffer_half_float');
    const storageType=full && fullLinear && fullColor ? gl.FLOAT : half && halfLinear ? half.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
    const buffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    function program(fragment) {
      const p=gl.createProgram();
      for(const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]) {
        const shader=gl.createShader(type); gl.shaderSource(shader,source); gl.compileShader(shader);
        if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(shader));
        gl.attachShader(p,shader); gl.deleteShader(shader);
      }
      gl.linkProgram(p);
      if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(p));
      const uniforms={};
      ['size','seed','time','dt','ink','stirs[0]','palette[0]','drop','color','variation'].forEach(n=>uniforms[n]=gl.getUniformLocation(p,'u_'+n));
      return {p,uniforms,position:gl.getAttribLocation(p,'a_position')};
    }
    const programs={seed:program(seedShader),transport:program(transportShader),display:program(displayShader)};
    let targets=[],front=0,w=1,h=1,seed=1,palette=[],elapsed=0,stirs=[],lastDrop=null;
    function target() {
      const texture=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,storageType,null);
      const framebuffer=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
      if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE) throw Error('Pigment framebuffer unavailable');
      return {texture,framebuffer};
    }
    function draw(name,destination,dt=0,drop=null) {
      const item=programs[name],u=item.uniforms;
      gl.useProgram(item.p); gl.bindFramebuffer(gl.FRAMEBUFFER,destination?.framebuffer||null);
      gl.viewport(0,0,w,h); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.enableVertexAttribArray(item.position); gl.vertexAttribPointer(item.position,2,gl.FLOAT,false,0,0);
      gl.uniform2f(u.size,w,h); gl.uniform1f(u.seed,seed); gl.uniform1f(u.time,elapsed); gl.uniform1f(u.dt,dt);
      gl.uniform3fv(u['palette[0]'],palette);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,targets[front].texture); gl.uniform1i(u.ink,0);
      const currents=new Float32Array(24);
      stirs.forEach((stir,index)=>currents.set([stir.x,stir.y,stir.strength*Math.exp(-(elapsed-stir.time)/14),stir.angle],index*4));
      gl.uniform4fv(u['stirs[0]'],currents);
      gl.uniform4f(u.drop,drop?.x||0,1-(drop?.y||0),drop?.area||0,drop?.progress||0);
      gl.uniform3fv(u.color,drop?.color||[0,0,0]); gl.uniform1f(u.variation,drop?.variation||0);
      gl.drawArrays(gl.TRIANGLES,0,6);
    }
    return {
      reset(nextSeed,colors) {
        w=canvas.width; h=canvas.height; seed=(nextSeed%10000)/113; elapsed=0; front=0; stirs=[]; lastDrop=null;
        palette=new Float32Array(colors.flat());
        targets.forEach(t=>{gl.deleteTexture(t.texture);gl.deleteFramebuffer(t.framebuffer);});
        targets=[target(),target()];
        draw('seed',targets[0]); draw('display',null);
      },
      step(dt,drop=null) {
        elapsed+=dt;
        if(drop && drop.id!==lastDrop) {
          lastDrop=drop.id;
          stirs.push({x:drop.x,y:1-drop.y,strength:.54,angle:seed+drop.id*2.4,time:elapsed});
          if(stirs.length>6) stirs.shift();
        }
        draw('transport',targets[1-front],dt,drop);
        front=1-front;
      },
      display() { draw('display',null); },
      get kind() { return 'webgl'; }
    };
  };

  // Small CPU surface for browsers with WebGL disabled. It obeys the same
  // persistent-pigment and displacement rules, at a lower spatial resolution.
  function createFallback(canvas) {
    const ctx=canvas.getContext('2d',{alpha:false});
    const field=document.createElement('canvas'), fctx=field.getContext('2d',{alpha:false});
    let w,h,pixels,elapsed=0;
    return {
      reset(seed,colors) {
        w=320;h=Math.max(160,Math.round(320*canvas.height/canvas.width)); field.width=w;field.height=h;
        pixels=fctx.createImageData(w,h);elapsed=0;
        for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
          let px=x/w,py=y/h;
          for(let k=0;k<4;k++) { const dx=px-.25-k*.13,dy=py-.30-k*.1;const a=2.8*Math.exp(-(dx*dx+dy*dy)*8)*(k%2?1:-1);px=.25+k*.13+dx*Math.cos(a)-dy*Math.sin(a);py=.30+k*.1+dx*Math.sin(a)+dy*Math.cos(a); }
          const phase=py*10+px*3+Math.sin(px*8+seed*.01)*.7;
          const t=(Math.sin(phase*2)+1)*.5, shade=colors[t>.78?3:t>.3?2:0];
          const thread=.91+.09*Math.sin(phase*63);
          const off=(y*w+x)*4;for(let c=0;c<3;c++)pixels.data[off+c]=shade[c]*255*thread;pixels.data[off+3]=255;
        }
      },
      step(dt,drop) {
        elapsed+=dt;const next=fctx.createImageData(w,h),m=Math.min(w,h);
        for(let y=0;y<h;y++)for(let x=0;x<w;x++) {
          let sx=x-Math.sin(y/h*7+elapsed*.05)*dt*2, sy=y-Math.sin(x/w*6)*dt*2;
          let inside=false;
          if(drop) {const dx=x-drop.x*w,dy=y-drop.y*h,r2=dx*dx+dy*dy,a=drop.area*m*m*Math.exp(-r2/(m*m*.19));inside=r2<a;const scale=Math.sqrt(Math.max(0,r2-a)/Math.max(1,r2));sx=drop.x*w+dx*scale;sy=drop.y*h+dy*scale;}
          sx=Math.max(0,Math.min(w-1,sx));sy=Math.max(0,Math.min(h-1,sy));
          const x0=Math.floor(sx),y0=Math.floor(sy),x1=Math.min(w-1,x0+1),y1=Math.min(h-1,y0+1),tx=sx-x0,ty=sy-y0;
          const off=(y*w+x)*4;
          for(let c=0;c<3;c++)next.data[off+c]=inside?drop.color[c]*255:(pixels.data[(y0*w+x0)*4+c]*(1-tx)+pixels.data[(y0*w+x1)*4+c]*tx)*(1-ty)+(pixels.data[(y1*w+x0)*4+c]*(1-tx)+pixels.data[(y1*w+x1)*4+c]*tx)*ty;
          next.data[off+3]=255;
        }
        pixels=next;
      },
      display() { fctx.putImageData(pixels,0,0);ctx.drawImage(field,0,0,canvas.width,canvas.height); },
      get kind() {return 'canvas';}
    };
  }
})();
