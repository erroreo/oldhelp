var b;
var bt1;
var bt2;
var barx=this.x;
var barx2=300;

function setup() {
  let cnv = createCanvas(600, 600);
  var x = (windowWidth - width)/2; 
  var y = (windowHeight - height)/2;
  var a = select('#MyBlog');
  var divbott = a.style.top+a.style.height;
  cnv.position(x,divbott);
  b = new Ball(200, 200, 20);
  bt1 = new Bat(200, 580);
  bt2 = new Bat(200,20);
}

function draw() {
  background(220);
  b.move();
  b.checkEdge();
  b.show();
  let c = color(255, 155, 255);
  fill(c);
  bt1.show();
  bt2.show2();
  
  if (b.y >= 570 || b.y <= 30) {
  if (b.x <= mouseX + (this.width / 2) && b.x >= mouseX - (this.width / 2)) {
    b.bounce();
  }
}
}
class Ball {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.xSpeed = 3.2;
    this.ySpeed = 2.3;
  }

  show() {
    let c = color(255, 204, 0);
      fill(c);
    ellipse(this.x, this.y, this.r);
  }

  move() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
  }

  checkEdge() {
    if (this.x >= width || this.x <= 0) {
      this.xSpeed *= -1;
    }

    // if (this.y >= height || this.y <= 0) {
    //   this.ySpeed *= -1;
    // }
  }
  
  bounce() {
    this.ySpeed *= -1;
  }
}

class Bat {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 180;
    this.height = 30;
  }

  show() {
    rectMode(CENTER);
    if (mouseIsPressed) {
        barx = mouseX;
      }
    rect(barx, this.y, this.width, this.height);
  }
  
  show2() {
    rectMode(CENTER);
    if (keyIsDown(37)) {
        barx2-=10;
      }
      if (keyIsDown(39)) {
        barx2+=10;
      }
    rect(barx2, this.y, this.width, this.height);
  }
}