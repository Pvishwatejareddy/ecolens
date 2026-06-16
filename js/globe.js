/* ============================================
   ECOLENS — REALISTIC 3D GLOBE (Three.js)
   ============================================ */

   (function () {
    const canvas = document.getElementById('globe-canvas') || 
               document.getElementById('dash-globe');
    if (!canvas) return;
  
    // ── SCENE SETUP ──
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.shadowMap.enabled = true;
  
    const scene = new THREE.Scene();
  
    const camera = new THREE.PerspectiveCamera(
      45,
      canvas.offsetWidth / canvas.offsetHeight,
      0.1,
      1000
    );
    camera.position.z = 2.4;
  
    // ── TEXTURE LOADER ──
    const loader = new THREE.TextureLoader();
  
    // We use publicly available NASA-style textures via CDN
    const TEXTURES = {
      earth:   'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg',
      bump:    'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_normal_2048.jpg',
      spec:    'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_specular_2048.jpg',
      clouds:  'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_clouds_1024.png',
    };
  
    // ── EARTH ──
    const earthGeo  = new THREE.SphereGeometry(1, 64, 64);
    const earthMat  = new THREE.MeshPhongMaterial({
      map:          loader.load(TEXTURES.earth),
      bumpMap:      loader.load(TEXTURES.bump),
      bumpScale:    0.05,
      specularMap:  loader.load(TEXTURES.spec),
      specular:     new THREE.Color(0x4488aa),
      shininess:    18,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);
  
    // ── CLOUDS ──
    const cloudGeo = new THREE.SphereGeometry(1.012, 64, 64);
    const cloudMat = new THREE.MeshPhongMaterial({
      map:         loader.load(TEXTURES.clouds),
      transparent: true,
      opacity:     0.38,
      depthWrite:  false,
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(clouds);
  
    // ── ATMOSPHERE GLOW ──
    const atmosGeo = new THREE.SphereGeometry(1.06, 64, 64);
    const atmosMat = new THREE.MeshPhongMaterial({
      color:       0x4fc3f7,
      transparent: true,
      opacity:     0.08,
      side:        THREE.FrontSide,
      depthWrite:  false,
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosphere);
  
    // Outer glow ring
    const glowGeo = new THREE.SphereGeometry(1.12, 64, 64);
    const glowMat = new THREE.MeshPhongMaterial({
      color:       0x48cae4,
      transparent: true,
      opacity:     0.04,
      side:        THREE.BackSide,
      depthWrite:  false,
    });
    scene.add(new THREE.Mesh(glowGeo, glowMat));
  
    // ── STARS ──
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1800;
    const starPositions = new Float32Array(starCount * 3);
  
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 120;
    }
  
    starGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(starPositions, 3)
    );
  
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size:  0.12,
      transparent: true,
      opacity: 0.7,
    });
  
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
  
    // ── CO2 PARTICLES ──
    const particleGeo  = new THREE.BufferGeometry();
    const particleCount = 120;
    const pPositions   = new Float32Array(particleCount * 3);
    const pSpeeds      = [];
  
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 1.1 + Math.random() * 0.6;
  
      pPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPositions[i * 3 + 2] = r * Math.cos(phi);
  
      pSpeeds.push({
        speed:  0.002 + Math.random() * 0.004,
        theta,
        phi,
        r,
        drift: (Math.random() - 0.5) * 0.001,
      });
    }
  
    particleGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(pPositions, 3)
    );
  
    const particleMat = new THREE.PointsMaterial({
      color:       0x606c38,
      size:        0.025,
      transparent: true,
      opacity:     0.55,
    });
  
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
  
    // ── LIGHTING ──
    // Sunlight
    const sunLight = new THREE.DirectionalLight(0xfff5e0, 1.6);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);
  
    // Ambient
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
  
    // Hemisphere (sky/ground)
    const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 0.4);
    scene.add(hemiLight);
  
    // Rim light (blue from behind)
    const rimLight = new THREE.DirectionalLight(0x48cae4, 0.3);
    rimLight.position.set(-5, -2, -5);
    scene.add(rimLight);
  
    // ── CARBON SCORE COLOR OVERLAY ──
    // Changes globe tint based on user's carbon score
    window.updateGlobeScore = function (score) {
      // score: 0 (best) → 20 (worst) kg CO2/day
      const t = Math.min(score / 20, 1);
  
      // Green → Yellow → Red
      if (t < 0.5) {
        const t2 = t * 2;
        atmosMat.color.setRGB(t2 * 0.9, 1 - t2 * 0.3, 0);
      } else {
        const t2 = (t - 0.5) * 2;
        atmosMat.color.setRGB(1, 1 - t2, 0);
      }
      atmosMat.opacity = 0.06 + t * 0.14;
  
      // Particle density
      particleMat.opacity = 0.3 + t * 0.5;
      particleMat.size    = 0.02 + t * 0.04;
    };
  
    // ── DRAG TO ROTATE ──
    let isDragging  = false;
    let prevX = 0, prevY = 0;
    let rotX  = 0, rotY  = 0;
    let velX  = 0, velY  = 0;
  
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    });
  
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      velX = dy * 0.005;
      velY = dx * 0.005;
      rotX += velX;
      rotY += velY;
      prevX = e.clientX;
      prevY = e.clientY;
    });
  
    window.addEventListener('mouseup',   () => { isDragging = false; });
    window.addEventListener('mouseleave',() => { isDragging = false; });
  
    // Touch support
    canvas.addEventListener('touchstart', (e) => {
      isDragging = true;
      prevX = e.touches[0].clientX;
      prevY = e.touches[0].clientY;
    });
  
    canvas.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - prevX;
      const dy = e.touches[0].clientY - prevY;
      velX = dy * 0.005;
      velY = dx * 0.005;
      rotX += velX;
      rotY += velY;
      prevX = e.touches[0].clientX;
      prevY = e.touches[0].clientY;
      e.preventDefault();
    }, { passive: false });
  
    canvas.addEventListener('touchend', () => { isDragging = false; });
  
    // ── RESIZE HANDLER ──
    window.addEventListener('resize', () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
  
    // ── ANIMATE ──
    let frame = 0;
  
    function animate() {
      requestAnimationFrame(animate);
      frame++;
  
      // Auto rotation when not dragging
      if (!isDragging) {
        velX *= 0.95;
        velY *= 0.95;
        rotY += 0.0015 + velY;
        rotX += velX;
      }
  
      earth.rotation.y      = rotY;
      earth.rotation.x      = rotX * 0.3;
      clouds.rotation.y     = rotY * 1.02;
      clouds.rotation.x     = rotX * 0.3;
      atmosphere.rotation.y = rotY * 0.5;
  
      // Particle drift
      const pPos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const s = pSpeeds[i];
        s.theta += s.speed;
        s.phi   += s.drift;
        s.r      = 1.1 + 0.5 * Math.abs(Math.sin(frame * 0.01 + i));
  
        pPos[i * 3]     = s.r * Math.sin(s.phi) * Math.cos(s.theta);
        pPos[i * 3 + 1] = s.r * Math.sin(s.phi) * Math.sin(s.theta);
        pPos[i * 3 + 2] = s.r * Math.cos(s.phi);
      }
      particles.geometry.attributes.position.needsUpdate = true;
  
      // Star twinkle
      stars.rotation.y += 0.00008;
  
      renderer.render(scene, camera);
    }
  
    animate();
  
    // Set default score
    window.updateGlobeScore(5);
  
  })();