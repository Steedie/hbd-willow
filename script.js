const giftBox = document.getElementById("gift-box");
const canvas = document.getElementById("canvas");

const { Engine, Render, Runner, World, Bodies, Body, Composite } = Matter;

let engine;
let world;
let render;

// Adjust canvas size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

giftBox.addEventListener("click", () => {
  giftBox.classList.add("opened");
  startPhysics();
});

function startPhysics() {

    // iOS requires permission to access gyroscope
if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
        }
      })
      .catch(console.error);
  } else {
    // Non iOS
    window.addEventListener('deviceorientation', handleOrientation);
  }
  
  function handleOrientation(event) {
    let gamma = event.gamma;
    let beta = event.beta;
  
    if (gamma === null || beta === null) return;
  
    const gravityX = gamma / 90;
    const gravityY = beta / 90;
  
    engine.world.gravity.x = gravityX;
    engine.world.gravity.y = gravityY;
  }
  

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
  
    // Create ground and walls
    const floor = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, { isStatic: true });
    const leftWall = Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true });
    const rightWall = Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true });
  
    World.add(world, [floor, leftWall, rightWall]);
  
    let catImages = [];
    for (let i = 1; i <= 11; i++) {
      catImages.push(`images/w${i}.webp`);
    };
  
    const cats = []; // 🐱 Array to keep track of all cats!
  
    catImages.forEach((src, index) => {
      const radius = 30 + Math.random() * 20;
  
      const x = window.innerWidth / 2 + (Math.random() - 0.5) * 100;
      const y = window.innerHeight / 2 + (Math.random() - 0.5) * 100;
  
      const cat = Bodies.circle(x, y, radius, {
        restitution: 1.5, // Super bouncy initially
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
      cats.push(cat); // Save cat into array
    });
  
    // 🧹 Gradually reduce bounce
    const reduceBounce = setInterval(() => {
      let allAtTarget = true;
  
      cats.forEach(cat => {
        if (cat.restitution > 0.8) {
          cat.restitution -= 0.05;
          if (cat.restitution < 0.8) cat.restitution = 0.8; // Clamp
          allAtTarget = false;
        }
      });
  
      if (allAtTarget) {
        clearInterval(reduceBounce); // Stop once all are settled
      }
    }, 500); // Every 0.5s for a smoother slow-down

    // 📱 Mobile Gyro Gravity!
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', event => {
      let gamma = event.gamma; // Left-right tilt [-90,90]
      let beta = event.beta;   // Front-back tilt [-180,180]
  
      // Normalize gamma and beta
      if (gamma === null || beta === null) return;
  
      // Map to a range that makes sense
      const gravityX = gamma / 90; // Tilt left/right
      const gravityY = beta / 90;  // Tilt front/back
  
      engine.world.gravity.x = gravityX;
      engine.world.gravity.y = gravityY;
    });
  }
  
  }
  