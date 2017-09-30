let ants = [];
let food = [];
let poison = [];

let nutrition = [0.1, -1];

let debug;

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent('canvascontainer');
  debug = select('#debug');

  for (let i = 0; i < 10; i++) {
    ants[i] = new Ant(width / 2, height / 2);
  }
  for (let i = 0; i < 10; i++) {
    food.push(createVector(random(width), random(height)));
  }
  for (let i = 0; i < 5; i++) {
    poison.push(createVector(random(width), random(height)));
  }
}

function mouseDragged() {
  ants.push(new Ant(mouseX, mouseY));
}

function draw() {
  background(0);

  // 10% chance new food
  if (random(1) < 0.1) {
    food.push(createVector(random(width), random(height)));
  }

  // 1% chance of new poison
  if (random(1) < 0.01) {
    poison.push(createVector(random(width), random(height)));
  }

  // go through all ants
  for (let i = ants.length - 1; i >= 0; i--) {
    let v = ants[i];

    // eat the food (index 0)
    v.eat(food, 0);
    // eat the poison
    v.eat(poison, 1);
    // check boundaries
    v.boundaries();

    // update and draw
    v.update();
    v.show();

    // if the ant has died, remove it
    if (v.dead()) {
      ants.splice(i, 1);
      //food.push(createVector(v.position.x, v.position.y));
    } else {
      // every ant has a chance of cloning itself
      let child = v.birth();
      if (child != null) {
        ants.push(child);
      }
    }
  }

  // draw all food and poison
  for (let i = 0; i < food.length; i++) {
    fill(0, 255, 0);
    noStroke();
    ellipse(food[i].x, food[i].y, 4);
  }
  for (let i = 0; i < poison.length; i++) {
    fill(255, 0, 0);
    noStroke();
    ellipse(poison[i].x, poison[i].y, 4);
  }
}
