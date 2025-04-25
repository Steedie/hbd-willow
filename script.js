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
  const floor = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, {
    isStatic: true
  });

  const leftWall = Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true });
  const rightWall = Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true });

  World.add(world, [floor, leftWall, rightWall]);

  let catImages = [];

  for(let i = 1; i < 11; i++){
    catImages.push(`images/w${i}.webp`);
  };

  catImages.forEach((src, index) => {
    const size = 60 + Math.random() * 40;
    const x = window.innerWidth / 2 + (Math.random() - 0.5) * 100;
    const y = window.innerHeight / 2 + (Math.random() - 0.5) * 100;

    const cat = Bodies.rectangle(x, y, size, size, {
      restitution: 0.8,
      render: {
        sprite: {
          texture: src,
          xScale: size / 100,
          yScale: size / 100,
        }
      }
    });

    const forceMagnitude = 0.03 * cat.mass;
    Body.applyForce(cat, { x, y }, {
      x: (Math.random() - 0.5) * forceMagnitude,
      y: -Math.random() * forceMagnitude,
    });

    World.add(world, cat);
  });
}
