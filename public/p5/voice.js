var r,g,b;


var img;

function preload(){
    img=loadImage("mic2.png");
}
function setup() {
  p5canvas = createCanvas(100, 100);
  background(220);
  r=255;
  g=0;
  b=0;
  mic = new p5.AudioIn();
  open= false;
  getAudioContext().resume()
}

function draw() {
    clear();
    if(open){ 
        
        var micLevel = mic.getLevel(); //獲取聲音大小
        noStroke();
        fill(r,g,b);
        imageMode(CENTER);
        ellipse(51,50,50 + micLevel * 150); 
        
        image(img,width/2,50,100,100);
    }else if(!open){
        imageMode(CENTER);
        image(img,width/2,50,100,100);
    }

}

function mouseClicked(){
    
    if(open && mouseX<100 && mouseX>0 && mouseY<100 && mouseY>0){
        mic.stop();
        recognition.stop();
        open=false;
      }else if(!open && mouseX<100 && mouseX>0 && mouseY<100 && mouseY>0){
        startt()
        mic = new p5.AudioIn();
        mic.start();
        open = true;
      }
}

function touchStarted() {
    if (getAudioContext().state !== 'running') {
      getAudioContext().resume();
    }
  }