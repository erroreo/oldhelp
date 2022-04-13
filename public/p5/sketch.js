// const { raw } = require("mysql");

function preload(){
    //img = loadImage("testpic.jpg")
}
function readURL(evt) {
  var tgt = evt.target || window.event.srcElement,
  files = tgt.files;

  // FileReader support
  if (FileReader && files && files.length) {
    var fr = new FileReader();
    fr.onload = function () {
      signaling_socket.emit('imgfilechange',{"imgbase64":fr.result});
    }
    fr.readAsDataURL(files[0]);
  }
}


function setup() {
  var left = window.innerWidth/2;
  let cnv = createCanvas(400, 300);
  var x = (parent.document.body.clientWidth - width)/2; 
  var y = (parent.document.body.clientWidth - height)/2;
  var a = select('#buttonlist');
  var divbott = a.style.top+a.style.height;
  console.log(parent.document.body.clientWidth);
  cnv.position(x,divbott);
  //image(img, 0, 0, 600, 600);
  fill(255, 255, 250, 30);
  push();
  stroke(255, 204, 0);
  strokeWeight(2);
  rect(0, 0, 400, 300);
  pop();
  signaling_socket.on('imgchange',function(data){
    raw = new Image();
    raw.src = data.imgbase64;
    raw.onload = function(){
      var img2 = createImage(raw.width, raw.height);
      img2.drawingContext.drawImage(raw, 0, 0);
      clear();
      var scale = 1;
      imageMode(CENTER);
      image(img2, 0.5*width, 0.5*height, scale*width, scale*img2.width/img2.width*height); // to fit width
      fill(255, 255, 250, 30);
      push();
      stroke(255, 204, 0);
      strokeWeight(3);
      rect(0, 0, 400, 300);
      pop();
    }
  });
  signaling_socket.on('drawcanvas',function(data){
    if (data.clear == 1) {
      clear();
      createCanvas(400, 300);
      imageMode(CENTER);
      //image(img, 0, 0, 600, 600);
      fill(255, 255, 250, 30);
      push();
      stroke(255, 204, 0);
      strokeWeight(2);
      rect(0, 0, 400, 300);
      pop();
      data.clear = 0;
    }else {
      strokeWeight(data.size);
      stroke(data.color);
      line(data.sX,data.sY,data.psX,data.psY);
    }
    });
}

function draw() {
//  var test = $('#selWidth').val();






}

function mouseDragged(){
  strokeWeight($('#selWidth').val());
  stroke($('#selColor').val());
  line(mouseX,mouseY,pmouseX,pmouseY);
  signaling_socket.emit('draw',{"sX":mouseX,"sY":mouseY,"psX":pmouseX,"psY":pmouseY,"color":$('#selColor').val(),"clear":0,"size":$('#selWidth').val()});
}

function mousePressed(){
  //clear();
}

function clearArea() {
  clear();
  imageMode(CORNER);
  //image(img, 0, 0, 600, 600);
  fill(255, 255, 250, 30);
  push();
  stroke(255, 204, 0);
  strokeWeight(2);
  rect(0, 0, 400, 300);
  pop();
  signaling_socket.emit('draw',{"sX":'',"sY":'',"psX":'',"psY":'',"color":$('#selColor').val(),"clear":1});
}
