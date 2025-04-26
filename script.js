const giftBox = document.getElementById("gift-box");
const canvas = document.getElementById("canvas");

const { Engine, Render, Runner, World, Bodies, Body, Composite } = Matter;

let engine;
let world;
let render;
let floor, leftWall, rightWall;

// Adjust canvas size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (world) {
    // Remove old walls
    Composite.remove(world, [leftWall, rightWall, floor]);

    // Recreate updated walls
    floor = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, { isStatic: true });
    leftWall = Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true });
    rightWall = Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true });

    World.add(world, [floor, leftWall, rightWall]);
  }
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let started = false;
giftBox.addEventListener("click", () => {
  if (started) return;
  started = true;
  giftBox.classList.add("opened");
  startPhysics();
});

function startPhysics() {
  // Initialize matter.js
  engine = Engine.create();
  world = engine.world;

  render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      width: window.innerWidth,
      height: window.innerHeight,
      background: 'transparent',
      wireframes: false,
    }
  });

  Render.run(render);
  Runner.run(Runner.create(), engine);

  // Create ground and walls (initial)
  floor = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, { isStatic: true });
  leftWall = Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true });
  rightWall = Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true });

  World.add(world, [floor, leftWall, rightWall]);

  // Load cat images
  let catImages = [];
  for (let i = 1; i <= 11; i++) {
    catImages.push(`images/w${i}.webp`);
  }

  const cats = [];

  catImages.forEach((src) => {
    const radius = 30 + Math.random() * 20;

    const x = window.innerWidth / 2 + (Math.random() - 0.5) * 100;
    const y = window.innerHeight / 2 + (Math.random() - 0.5) * 100;

    const cat = Bodies.circle(x, y, radius, {
      restitution: 1,
      render: {
        sprite: {
          texture: src,
          xScale: (radius * 2) / 100,
          yScale: (radius * 2) / 100,
        }
      }
    });

    const forceMagnitude = 0.03 * cat.mass;
    Body.applyForce(cat, { x, y }, {
      x: (Math.random() - 0.5) * forceMagnitude,
      y: -Math.random() * forceMagnitude,
    });

    World.add(world, cat);
    cats.push(cat);
  });

  // Gradually reduce bounce
  const reduceBounce = setInterval(() => {
    let allAtTarget = true;

    cats.forEach(cat => {
      if (cat.restitution > 0.8) {
        cat.restitution -= 0.05;
        if (cat.restitution < 0.8) cat.restitution = 0.8;
        allAtTarget = false;
      }
    });

    if (allAtTarget) {
      clearInterval(reduceBounce);
    }
  }, 500);

  // Mobile gyro gravity (with smoothing)
  let currentGravityX = 0;
  let currentGravityY = 1;

  function handleOrientation(event) {
    let gamma = event.gamma;
    let beta = event.beta;

    if (gamma === null || beta === null) return;

    let targetX = gamma / 90;
    let targetY = beta / 90;

    targetX = Math.max(-1, Math.min(1, targetX));
    targetY = Math.max(-1, Math.min(1, targetY));

    currentGravityX += (targetX - currentGravityX) * 0.1;
    currentGravityY += (targetY - currentGravityY) * 0.1;

    engine.world.gravity.x = currentGravityX;
    engine.world.gravity.y = currentGravityY;
  }

  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
        }
      })
      .catch(console.error);
  } else {
    window.addEventListener('deviceorientation', handleOrientation);
  }
}
