// cosmic-bg.js
// Three.js background: Earth, Moon, Saturn, Jupiter, Milky Way, Nebula, Starfield

// Scene & Camera
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.z = 18;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Attach renderer to #cosmic-bg
document.getElementById("cosmic-bg").appendChild(renderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(10, 10, 10);
scene.add(sun);

// Texture Loader
const loader = new THREE.TextureLoader();
function loadTexture(url) {
  return loader.load(url, () => console.log("✅ Loaded:", url));
}

// Milky Way background sphere
const milkyWay = new THREE.Mesh(
  new THREE.SphereGeometry(4000, 64, 64),
  new THREE.MeshStandardMaterial({
    map: loadTexture("images/background-images/8k_stars_milky_way.jpg"),
    side: THREE.BackSide,
    emissive: new THREE.Color(0x222222),
    emissiveIntensity: 0.6,
  })
);
scene.add(milkyWay);

// Earth
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(2, 128, 128),
  new THREE.MeshStandardMaterial({
    map: loadTexture("images/background-images/earth.jpg"),
    normalMap: loadTexture("images/background-images/earth_normal.jpg"),
    roughness: 0.8,
    metalness: 0.1,
  })
);
scene.add(earth);

// Moon orbit
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 64, 64),
  new THREE.MeshStandardMaterial({
    map: loadTexture("images/background-images/moon.jpg"),
  })
);
const moonGroup = new THREE.Group();
moonGroup.add(moon);
scene.add(moonGroup);
moon.position.set(0, 1.2, 0);

// Starfield
let starGeometry = new THREE.BufferGeometry();
let starMaterial, stars;
(function createStarfield() {
  const starCount = 3500;
  const positions = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 2000;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    sizes[i] = 0.2 + Math.random() * 1.2;
  }
  starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  starGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1,
    transparent: true,
    depthWrite: true,
  });
  stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
})();

// Nebula
function createNebulaTexture(color) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  if (color === "red") {
    grad.addColorStop(0, "rgba(255,80,80,0.8)");
    grad.addColorStop(1, "rgba(80,10,40,0)");
  } else if (color === "blue") {
    grad.addColorStop(0, "rgba(80,120,255,0.8)");
    grad.addColorStop(1, "rgba(20,30,80,0)");
  } else {
    grad.addColorStop(0, "rgba(200,100,255,0.8)");
    grad.addColorStop(1, "rgba(60,20,80,0)");
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  return canvas;
}

const nebulaTextures = [
  new THREE.CanvasTexture(createNebulaTexture("red")),
  new THREE.CanvasTexture(createNebulaTexture("blue")),
  new THREE.CanvasTexture(createNebulaTexture("purple")),
];

for (let i = 0; i < 6; i++) {
  const tex = nebulaTextures[i % nebulaTextures.length];
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
    })
  );
  const baseScale = window.innerWidth > 768 ? 250 : 120;
  const scale = baseScale + Math.random() * (baseScale * 0.7);

  sprite.scale.set(scale, scale, 1);
  sprite.position.set(
    (Math.random() - 0.5) * 300,
    (Math.random() - 0.5) * 300,
    -250 - Math.random() * 200
  );
  scene.add(sprite);
}

// Jupiter
const jupiter = new THREE.Mesh(
  new THREE.SphereGeometry(1.6, 64, 64),
  new THREE.MeshStandardMaterial({
    map: loadTexture("images/background-images/jupiter.jpg"),
  })
);
scene.add(jupiter);

// Saturn + rings
const saturn = new THREE.Mesh(
  new THREE.SphereGeometry(1.2, 64, 64),
  new THREE.MeshStandardMaterial({
    map: loadTexture("images/background-images/saturn.jpg"),
  })
);
const ring = new THREE.Mesh(
  new THREE.RingGeometry(1.6, 3.2, 64),
  new THREE.MeshBasicMaterial({
    map: loadTexture("images/background-images/saturnring.png"),
    side: THREE.DoubleSide,
    transparent: true,
  })
);
ring.rotation.x = Math.PI / 2.3;
ring.position.z = -0.01;

const saturnGroup = new THREE.Group();
saturnGroup.add(saturn);
saturnGroup.add(ring);
scene.add(saturnGroup);

// Scroll tracking
let scrollY = 0;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});

// Helpers
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  // Earth rotation
  earth.rotation.y += 0.002;

  // Moon orbit
  const moonAngle = elapsed * 0.5;
  moonGroup.position.set(Math.cos(moonAngle) * 3, 0.8, Math.sin(moonAngle) * 3);

  // Camera zoom on scroll
  const targetZ = 18 - scrollY * 0.002;
  camera.position.z += (targetZ - camera.position.z) * 0.01;

  const progress = clamp(scrollY / 1000, 0, 1);

  // Star twinkle
  const sizes = starGeometry.attributes.size.array;
  for (let i = 0; i < sizes.length; i++) {
    sizes[i] *= 0.99 + Math.random() * 0.02;
  }
  starGeometry.attributes.size.needsUpdate = true;

  // Milky Way rotation
  milkyWay.rotation.y += 0.00005;

  // Starfield drift
  const positions = starGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i + 2] += scrollY * 0.0005;
  }
  starGeometry.attributes.position.needsUpdate = true;

  // Jupiter motion
  jupiter.position.x = -window.innerWidth / 60;
  jupiter.position.y = -window.innerHeight / 60;
  jupiter.position.z = lerp(-30, -10, progress);
  jupiter.scale.setScalar(lerp(1, 1.5, progress));

  // Saturn motion
  saturnGroup.position.x = window.innerWidth / 60;
  saturnGroup.position.y = window.innerHeight / 60;
  saturnGroup.position.z = lerp(-10, 5, progress);
  saturnGroup.scale.setScalar(lerp(1, 2.5, progress));

  renderer.render(scene, camera);
}
animate();

// Resize handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
