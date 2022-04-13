let localStream;
let videoTrack;
let audioTrack;
const joinBtn = document.querySelector('.joinBtn');
let pc;
var constraints = {audio: true, video: true};
var video = document.querySelector("video");


function successCallback(stream) {
  window.stream = stream;
  video.srcObject = stream;
  video.play();
  localStream = stream;
  // 取得裝置名稱
  videoTrack = stream.getVideoTracks();
  console.log(`使用影像裝置 => ${videoTrack[0].label}`);

  audioTrack = stream.getAudioTracks();
  console.log(`使用聲音裝置 => ${audioTrack[0].label}`);
}

function errorCallback(error){
  console.log("navigator.getUserMedia error: ", error);
}

navigator.getUserMedia(constraints, successCallback, errorCallback);

// 連線到 Server Port
const socket = io('http://localhost:3000');

// 建立 P2P 連接
function createPeerConnection() {
  const configuration = {
    iceServers: [{
      urls: 'stun:stun.l.google.com:19302' // Google's public STUN server
    }],
    url: "turn:120.105.161.178:3478",
    credential: "0000",
    username: "james"
   };
  pc = new RTCPeerConnection(configuration);
};

// 增加本地流
function addLocalStream() {
  pc.addStream(localstream)
};

function joinRoom() {
  socket.emit('joinRoom' , 'secret room');
};

joinBtn.addEventListener('click', joinRoom);

const remoteVideo = document.querySelector('#remoteVideo');

// 監聽 ICE Server
function onIceCandidates() {
  // 找尋到 ICE 候選位置後，送去 Server 與另一位配對
  pc.onicecandidate = ({ candidate }) => {
    if (!candidate) { return; }
    console.log('onIceCandidate => ', candidate);
    socket.emit("peerconnectSignaling", { candidate });
  };
};

// 監聽 ICE 連接狀態
function onIceconnectionStateChange() {
  pc.oniceconnectionstatechange = (evt) => {
    console.log('ICE 伺服器狀態變更 => ', evt.target.iceConnectionState);
  };
}

// 監聽是否有流傳入，如果有的話就顯示影像
function onAddStream() {
  pc.onaddstream = (event) => {
    if(!remoteVideo.srcObject && event.stream){
      remoteVideo.srcObject = event.stream;
      console.log('接收流並顯示於遠端視訊！', event);
    }
  }
}

const initialBtn = document.querySelector('.initialBtn');

function initPeerConnection() {
  createMedia();
  getAudioVideo();
  createPeerConnection();
  addLocalStream();
  onIceCandidates();
  onIceconnectionStateChange();
  onAddStream();
}

initialBtn.addEventListener('click', initPeerConnection);

const btnCall = document.querySelector('.btnCall');
let offer;

const signalOption = {
  offerToReceiveAudio: 1, // 是否傳送聲音流給對方
  offerToReceiveVideo: 1, // 是否傳送影像流給對方
};

async function createSignal(isOffer) {
  try {
    if (!pc) {
      console.log('尚未開啟視訊');
      return;
    }
    // 呼叫 peerConnect 內的 createOffer / createAnswer
    offer = await pc[`create${isOffer ? 'Offer' : 'Answer'}`](signalOption);

    // 設定本地流配置
    await pc.setLocalDescription(offer);
    sendSignalingMessage(pc.localDescription, isOffer ? true : false)
  } catch(err) {
    console.log(err);
  }
};

function sendSignalingMessage(desc, offer) {
  const isOffer = offer ? "offer" : "answer";
  console.log(`寄出 ${isOffer}`);
  socket.emit("peerconnectSignaling", { desc });
};

btnCall.addEventListener('click', createSignal(true));