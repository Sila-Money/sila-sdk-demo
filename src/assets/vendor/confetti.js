/* eslint-disable */

let before, after, pressure, confetti;

let themeColor = ['#009688', '#eeeeee', '#78909c', '#ffab40', '#3f63f7', '#eeff41', '#4dd0e1'];

class Particles {
  constructor(p5, parent) {
    this.p5 = p5;
    this.parent = parent;
    this.gravity = parent.gravity;
    this.reinit();
    this.form = p5.round(p5.random(0, 1));
    this.steps = 0;
    this.taken = 0;
    this.takenElement = p5.random(-0.02, 0.02);
    this.multElement = p5.random(0.01, 0.08);
    this.takenAngle = 0;
    this.takenSpeed = 0.05;
  }

  reinit() {
    this.position = this.parent.position.copy();
    this.position.y = this.p5.random(-20, -100);
    this.position.x = this.p5.random(0, this.parent.ref.offsetWidth);
    this.speed = this.p5.createVector(this.p5.random(-6, 6), this.p5.random(-10, 2));
    this.friction = this.p5.random(0.995, 0.98);
    this.cut = this.p5.round(this.p5.random(5, 15));
    this.half = this.cut / 2;
    this.color = this.p5.color(this.p5.random(themeColor));
  }

  draw() {
    this.steps = 0.5 + Math.sin(this.speed.y * 20) * 0.5;
    this.taken = this.takenElement + Math.cos(this.takenAngle) * this.multElement;
    this.takenAngle += this.takenSpeed;
    this.p5.translate(this.position.x, this.position.y);
    this.p5.rotate(this.speed.x * 2);
    this.p5.scale(1, this.steps);
    this.p5.noStroke();
    this.p5.fill(this.color);
    if (this.form === 0) {
      this.p5.rect(-this.half, -this.half, this.cut, this.cut);
    } else {
      this.p5.ellipse(0, 0, this.cut, this.cut);
    }
    this.p5.resetMatrix();
  }

  integration() {
    this.speed.add(this.gravity);
    this.speed.x += this.taken;
    this.speed.mult(this.friction);
    this.position.add(this.speed);
    if (this.position.y > this.parent.ref.offsetHeight) {
      this.reinit();
    }

    if (this.position.x < 0) {
      this.reinit();
    }
    if (this.position.x > this.parent.ref.offsetWidth + 10) {
      this.reinit();
    }
  }

  render() {
    this.integration();
    this.draw();
  }
}

class SystemOfParticles {
  constructor(p5, ref, max, position, gravity) {
    this.position = position.copy();
    this.max = max;
    this.gravity = p5.createVector(0, gravity);
    this.friction = 0.98;
    // le tableau 
    this.particules = [];
    this.ref = ref;
    for (var i = 0; i < this.max; i++) {
      this.particules.push(new Particles(p5, this));
    }
  }
  render() {
    if (pressure) {
      var force = p5.Vector.sub(before, after);
      this.gravity.x = force.x / 20;
      this.gravity.y = force.y / 20;
    }
    this.particules.forEach(particules => particules.render());
  }
}

const setup = (p5, canvasParentRef) => {
  p5.createCanvas(canvasParentRef.offsetWidth, canvasParentRef.offsetHeight).parent(canvasParentRef);
  p5.frameRate(60);
  after = p5.createVector(0, 0);
  before = p5.createVector(0, 0);
  confetti = new SystemOfParticles(p5, canvasParentRef, 100, p5.createVector(canvasParentRef.offsetWidth / 2, -20), 0.05);
}

const draw = (p5) => {
  p5.background(p5.color("#FFF"));
  before.x = p5.mouseX;
  before.y = p5.mouseY;
  confetti.render();
  after.x = before.x;
  after.y = before.y;
}

const windowResized = (p5) => {
  window.addEventListener('resize', () =>  {
    p5.resizeCanvas(confetti.ref.offsetWidth, confetti.ref.offsetHeight);
    confetti.position = p5.createVector(confetti.ref.offsetWidth / 2, -40);
  });
}

const mousePressed = () => {
  pressure = true;
}

const mouseReleased = () => {
  pressure = false;
  confetti.gravity.y = 0.1;
  confetti.gravity.x = 0;
}

export { 
  setup, 
  draw, 
  windowResized, 
  mousePressed, 
  mouseReleased
};