// === Basic Three.js Setup ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 40, 0);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// === Lights ===
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(50, 100, 50);
sun.castShadow = true;
scene.add(sun);

const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// === Field ===
const textureLoader = new THREE.TextureLoader();
const grassTexture = textureLoader.load('assets/grass.jpg');
grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(20, 20);

const fieldGeometry = new THREE.PlaneGeometry(100, 60);
const fieldMaterial = new THREE.MeshStandardMaterial({ map: grassTexture });
const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
field.rotation.x = -Math.PI / 2;
field.receiveShadow = true;
scene.add(field);

// === Players ===
function createPlayer(color, x) {
  const geometry = new THREE.CapsuleGeometry(1, 2, 4, 8);
  const material = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, 2, 0);
  mesh.castShadow = true;
  return mesh;
}

const player1 = createPlayer(0x0066ff, -10);
const player2 = createPlayer(0xff3333, 10);
scene.add(player1, player2);

// === Ball ===
const ballGeometry = new THREE.SphereGeometry(1, 32, 32);
const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.set(0, 1, 0);
ball.castShadow = true;
scene.add(ball);

let ballVelocity = new THREE.Vector3();

// === Goals ===
const goalWidth = 10, goalHeight = 4, goalDepth = 2;
const goalMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const goalGeometry = new THREE.BoxGeometry(goalWidth, goalHeight, goalDepth);

const goal1 = new THREE.Mesh(goalGeometry, goalMaterial);
goal1.position.set(-48, goalHeight / 2, 0);
const goal2 = new THREE.Mesh(goalGeometry, goalMaterial);
goal2.position.set(48, goalHeight / 2, 0);
scene.add(goal1, goal2);

// === Score System ===
let p1Score = 0;
let p2Score = 0;
const p1ScoreEl = document.getElementById('p1Score');
const p2ScoreEl = document.getElementById('p2Score');

// === Controls ===
const keys = {};
document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

const moveSpeed = 0.6;

// === Audio ===
const kickSound = document.getElementById('kickSound');

function resetPositions() {
  player1.position.set(-10, 2, 0);
  player2.position.set(10, 2, 0);
  ball.position.set(0, 1, 0);
  ballVelocity.set(0, 0, 0);
}

// === Game Loop ===
function animate() {
  requestAnimationFrame(animate);

  // Player 1 movement (WASD)
  if (keys['w']) player1.position.z -= moveSpeed;
  if (keys['s']) player1.position.z += moveSpeed;
  if (keys['a']) player1.position.x -= moveSpeed;
  if (keys['d']) player1.position.x += moveSpeed;

  // Player 2 movement (Arrow keys)
  if (keys['arrowup']) player2.position.z -= moveSpeed;
  if (keys['arrowdown']) player2.position.z += moveSpeed;
  if (keys['arrowleft']) player2.position.x -= moveSpeed;
  if (keys['arrowright']) player2.position.x += moveSpeed;

  // Kicks
  if (keys['k'] && player1.position.distanceTo(ball.position) < 3) {
    ballVelocity.x = (ball.position.x - player1.position.x) * 0.5;
    ballVelocity.z = (ball.position.z - player1.position.z) * 0.5;
    kickSound.currentTime = 0;
    kickSound.play();
  }

  if (keys['x'] && player2.position.distanceTo(ball.position) < 3) {
    ballVelocity.x = (ball.position.x - player2.position.x) * 0.5;
    ballVelocity.z = (ball.position.z - player2.position.z) * 0.5;
    kickSound.currentTime = 0;
    kickSound.play();
  }

  // Ball movement
  ball.position.add(ballVelocity);
  ballVelocity.multiplyScalar(0.96); // friction

  // Goal detection
  if (ball.position.x < -48 && Math.abs(ball.position.z) < 5) {
    p2Score++;
    p2ScoreEl.textContent = p2Score;
    resetPositions();
  }
  if (ball.position.x > 48 && Math.abs(ball.position.z) < 5) {
    p1Score++;
    p1ScoreEl.textContent = p1Score;
    resetPositions();
  }

  // Camera
  camera.position.set(0, 40, 0);
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
