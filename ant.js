function Ant(x, y, dna) {
  this.accleration = createVector();
  this.velocity = p5.Vector.random2D();
  this.position = createVector(x, y);
  this.r = 3;
  this.maxspeed = 3;
  this.maxforce = 0.5;
  this.velocity.setMag(this.maxspeed);

  this.health = 1;

  // is this a birth from parent?
  if (dna instanceof Array) {
    this.dna = [];
    // copy all of the DNA
    for (let i = 0; i < dna.length; i++) {
      // 10% chance mutation
      if (random(1) < 0.1) {
        if (i < 2) {
          // adjust steering force weights
          this.dna[i] = dna[i] + random(-0.2, 0.2);
        } else {
          // adjust perception radius
          this.dna[i] = dna[i] + random(-10, 10);
        }
      } else {
        // copy dna with no mutation
        this.dna[i] = dna[i];
      }
    }
  } else {
    let maxf = 3;
    // DNA
    // 0: Attraction/Repulsion to food
    // 1: Attraction/Repulsion to poison
    // 2: Radius to sense food
    // 3: Radius to sense poison
    this.dna = [random(-maxf, maxf), random(-maxf, maxf), random(5, 100), random(5, 100)];
  }
}

Ant.prototype.update = function () {
  // update velocity
  this.velocity.add(this.accleration);

  // limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);

  // Reset accleration to 0 each cycle
  this.accleration.mult(0);

  // Slowly die unless you eat
  this.health -= 0.002;
}

Ant.prototype.applyForce = function (force) {
  this.accleration.add(force);
}

Ant.prototype.behaviors = function (good, bad) {
  let steerG = this.eat(good, 0.2, this.dna[2]);
  let steerB = this.eat(bad, -0.5, this.dna[3]);

  steerG.mult(this.dna[0]);
  steerB.mult(this.dna[1]);

  this.applyForce(steerG);
  this.applyForce(steerB);
}

Ant.prototype.birth = function () {
  let r = random(1);
  if (r < 0.001) {
    return new Ant(this.position.x, this.position.y, this.dna);
  }
}

// index = 0 for food, index = 1 for poison
Ant.prototype.eat = function (list, index) {
  let closest = null;
  let closestD = Infinity;

  // look at everything
  for (let i = list.length - 1; i >= 0; i--) {
    // calculate distance
    let d = p5.Vector.dist(list[i], this.position);

    // if it's within perception radius and closer than previous
    if (d < this.dna[2 + index] && d < closestD) {
      closestD = d;

      // save it
      closest = list[i];

      // if we are within 5 pixels, eat it!
      if (d < 5) {
        list.splice(i, 1);
        // add or subtract health based on food or poison
        this.health += nutrition[index];
      }
    }
  }

  // if something was close
  if (closest) {
    // seek
    let seek = this.seek(closest);
    // weight according to DNA
    seek.mult(this.dna[index]);
    // limit
    seek.limit(this.maxforce);
    this.applyForce(seek);
  }
}

// method that calculates steering force
// STEER = DESIRED - VELOCITY
Ant.prototype.seek = function (target) {
  let desired = p5.Vector.sub(target, this.position);
  let d = desired.mag();

  // scale to max speed
  desired.setMag(this.maxspeed);

  // steering = desired - velocity
  let steer = p5.Vector.sub(desired, this.velocity);

  return steer;
}

Ant.prototype.dead = function () {
  return (this.health < 0);
}

Ant.prototype.show = function () {
  // color base on health
  let green = color(0, 255, 0);
  let red = color(255, 0, 0);
  let col = lerpColor(red, green, this.health);

  // draw triangle rotated in the direction
  let angle = this.velocity.heading() + PI / 2;
  push();
  translate(this.position.x, this.position.y);
  rotate(angle);

  // extra info
  if (debug.checked()) {
    noFill();

    // circle and line for food
    stroke(0, 255, 0);
    line(0, 0, 0, -this.dna[0] * 25);
    ellipse(0, 0, this.dna[2] * 2);

    // circle and line for poison
    stroke(255, 0, 0);
    line(0, 0, 0, -this.dna[1] * 25);
    ellipse(0, 0, this.dna[3] * 2);
  }
  fill(col);
  stroke(col);
  beginShape();
  vertex(0, -this.r * 2);
  vertex(-this.r, this.r * 2);
  vertex(this.r, this.r * 2);
  endShape(CLOSE);
  pop();
}

Ant.prototype.boundaries = function () {
  let d = 10;
  let desired = null;

  if (this.position.x < d) {
    desired = createVector(this.maxspeed, this.velocity.y);
  } else if (this.position.x > width - d) {
    desired = createVector(-this.maxspeed, this.velocity.y);
  }

  if (this.position.y < d) {
    desired = createVector(this.velocity.x, this.maxspeed);
  } else if (this.position.y > height - d) {
    desired = createVector(this.velocity.x, -this.maxspeed);
  }

  if (desired !== null) {
    desired.setMag(this.maxspeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce);
    this.applyForce(steer);
  }
}
