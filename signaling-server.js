var https = require('https');
var teacher = "";
var connectCounter = 0;
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');

var path = require('path');
var mime = require('mime');
var mysql = require('mysql');
let config = require('./public/sqlConfig.js');
var connection = mysql.createConnection(config);
connection.connect();
var args = process.argv.slice(2); //去除前兩個參數
var PORT = 8000;
var cache = {};
    const options = {  
	  key: fs.readFileSync('./key.pem'),  
	  cert: fs.readFileSync('./cert.pem'),  
	  passphrase: '0000'  
	};  
	  
	var server = https.createServer(options, function(request, response) {  
	    var filePath = false;  
        
	    if (request.url == '/partner') {  
	        filePath = './public/partner.html';  
        }
        else if (request.url == '/paint') {  
            filePath = './public/paint.html';  
        } 
        else if (request.url == '/old') {  
            filePath = './public/old.html';  
        } 
        else {  
 	        filePath = 'public' + request.url;  
        }  
        
	    var absPath = './' + filePath;  
	    serveStatic(response, cache, absPath);  
 	});  
	  
	var io  = require('socket.io').listen(server);  
	  
	server.listen(PORT, null, function() {  
	    console.log("Listening on port " + PORT);  
     });  
     
     function serveStatic(response, cache, absPath) {
        // console.log('serveStatic is called. absPath=' +absPath);
        if (cache[absPath]) {
            sendFile(response, absPath, cache[absPath]);
        } else {
            fs.exists(absPath, function(exists) {
                if (exists) {
                    fs.readFile(absPath, function(err, data) {
                        if (err) {
                            send404(response);
                        } else {
                            cache[absPath] = data;
                            sendFile(response, absPath, data);
                        }
                    });
                } else {
                    send404(response);
                }
            });
        }
    }

    function sendFile(response, filePath, fileContents) {
        console.log('sendFile is called. filePath=' + filePath);
        response.writeHead(200, {'Content-Type': mime.getType(path.basename(filePath))});
     
        response.end(fileContents);
    }

    function send404(response) {
        console.log('send404 is called.');
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.write('Error 404: resource not found.');
        response.end();
    }
    var channels = {};
var sockets = {};

io.sockets.on('connection', function (socket) {

    socket.channels = {};
    sockets[socket.id] = socket;
    
    
    socket.on('clientid', function(data){
        console.log("[" + socket.id + "] "+data.id+" connection accepted");

		//***********判斷老師
		if(data.id == "partner"){
			teacher = socket.id;
			console.log("partner's socket.id is: " + teacher);
        }
        for(x in sockets){
            if(sockets[x] != socket)
            sockets[x].emit('phonecall');
        }
    });

    socket.on('disconnect', function () {
        for (var channel in socket.channels) {
            part(channel);
        }
        console.log("["+ socket.id + "] disconnected");
        delete sockets[socket.id];

    });
    socket.on('disconnectLocal', function () {
        for (var channel in socket.channels) {
            partLocal(channel);
        }
        console.log("["+ socket.id + "] disconnected");
        delete sockets[socket.id];

    });
    
    socket.on('draw',function (request){
        for(x in sockets){
            if(sockets[x] != socket)
            sockets[x].emit('drawcanvas',request);
        }
        
    });

    socket.on('iotcontrol',function (request){ //物聯網控制
        for(x in sockets){
            if(sockets[x] != socket)
            sockets[x].emit('iot',{"status1":request.status1,"status2":request.status2,"status3":request.status3});
        }
        console.log({"status1":request.status1,"status2":request.status2,"status3":request.status3});
    });

    socket.on('sqlselct',function (request) { //資料庫搜尋
        var sql = "SELECT * FROM notification";
        connection.query(sql, function (err, result){
            if (err) throw err;
            for(i in result){
                var now = new Date();
                var thatday = new Date(result[i].update_date);
                var year = thatday.getFullYear().toString();
                var month = (thatday.getMonth()+1).toString();
                var day = thatday.getDate().toString();
                var alrm = new Date(year+"-"+month+"-"+day+" "+result[i].notificationTime);
                if(result[i].repeatday == '0' && result[i].update_date < now && request.login == 1){
                    console.log("現在time:"+now);
                    console.log("資料庫時間:"+alrm);
                    if(alrm < now)
                        sql = "DELETE FROM `notification` WHERE `notification`.`id` = "+result[i].id;
                        connection.query(sql, function (err, result){
                            if (err) throw err;
                        });
                }
            }
            console.log("已傳送資料給"+socket.id);
             setTimeout(function(){
                socket.emit('sqlreturn',{"result":result});
             } ,1000);
            
        });
    });

    socket.on('heartselect',function (){
        var sql = "SELECT * FROM `heartdata` order by id DESC LIMIT 0,1";
        connection.query(sql,function(err, result){
            if (err) throw err;
            console.log("send heart beat imformation "+result+"to "+socket.id);
            if (result.length > 0)
                socket.emit('sqlreturnheart',result[0].heartbeat);
            else
            socket.emit('sqlreturnheart',"null");
        });
    });

    socket.on('heartinitialization',function(){
        var sql = "TRUNCATE `jamesdatabase`.`heartdata`";
        connection.query(sql,function(err){
            if(err) throw err;
        });
    });
    socket.on('heartinsert',function(data){
        var sql = "INSERT INTO data_raw (fbdate,fbjsondata) VALUES ('"+data.date+"','"+data.data+"')";
        connection.query(sql,function(err, result){
            if(err) throw err;
            console.log(sql);
            console.log("1 record inserted");
        })
    });

    socket.on('imgfilechange', function (data) {
        for(x in sockets){
            sockets[x].emit("imgchange",data);
        }
        console.log("已傳送照片");
    });
    socket.on('sqlInput', function (data) {
        var day = data.days;
        var repeat;
        if(day == ""){
            repeat = 0;
        }else{
            repeat = 1;
        }
        if(data.time == ""){
            console.log("時間格式錯誤")
        }
        var sql = "INSERT INTO notification (notificationName, notificationTime, day, repeatday) VALUES ('"+data.notification+"','" +data.time+":00','"+day+"','"+repeat+"')";
        connection.query(sql, function (err, result) {
            if (err) throw err;
            console.log(sql);
            console.log("1 record inserted");
          });
    });

    socket.on('sqlOutput', function (data) {
        connection.connect();

        var sql = "INSERT INTO notification (notificationName, notificationTime) VALUES ('"+data.notification+"','"+data.date + " " +data.time+":00')";
        connection.query(sql, function (err, result) {
            if (err) throw err;
            console.log(sql);
            console.log("1 record inserted");
          });
    });

    socket.on('join', function (config) {
        console.log("["+ socket.id + "] join ", config);
        var channel = config.channel;
        var userdata = config.userdata;
        

        if (channel in socket.channels) {
            console.log("["+ socket.id + "] ERROR: already joined ", channel);
            return;
        }

        if (!(channel in channels)) {
            channels[channel] = {};
        }

        for (id in channels[channel]) {
            channels[channel][id].emit('addPeer', {'peer_id': socket.id, 'should_create_offer': false});
            socket.emit('addPeer', {'peer_id': id, 'should_create_offer': true, 'teacherID': teacher});
        }
        channels[channel][socket.id] = socket;
        socket.channels[channel] = channel;
    });

    function part(channel) {
        console.log("["+ socket.id + "] part ");

        if (!(channel in socket.channels)) {
            console.log("["+ socket.id + "] ERROR: not in ", channel);
            return;
        }

        delete socket.channels[channel];
        delete channels[channel][socket.id];

        for (id in channels[channel]) {
            channels[channel][id].emit('removePeer', {'peer_id': socket.id});
            socket.emit('removePeer', {'peer_id': id});
        }
    }

    function partLocal(channel) {
        console.log("["+ socket.id + "] part ");

        if (!(channel in socket.channels)) {
            console.log("["+ socket.id + "] ERROR: not in ", channel);
            return;
        }

        delete socket.channels[channel];
        delete channels[channel][socket.id];

        for (id in channels[channel]) {
            channels[channel][id].emit('removePeerLocal', {'peer_id': socket.id});
            socket.emit('removePeerLocal', {'peer_id': id});
        }
    }
    socket.on('part', function(channel) {
        console.log("["+ socket.id + "] part ");
        if (!(channel in socket.channels)) {
            console.log("["+ socket.id + "] ERROR: not in ", channel);
            return;
        }

        delete socket.channels[channel];
        delete channels[channel][socket.id];

        for (id in channels[channel]) {
            channels[channel][id].emit('removePeer', {'peer_id': socket.id});
            socket.emit('removePeer', {'peer_id': id});
        }
    });

    socket.on('relayICECandidate', function(config) { //ICE的relay
        var peer_id = config.peer_id;
        var ice_candidate = config.ice_candidate;
        console.log("["+ socket.id + "] relaying ICE candidate to [" + peer_id + "] ", ice_candidate);

        if (peer_id in sockets) {
            sockets[peer_id].emit('iceCandidate', {'peer_id': socket.id, 'ice_candidate': ice_candidate});
        }
    });

    socket.on('relaySessionDescription', function(config) {
        var peer_id = config.peer_id;
        var session_description = config.session_description;
        console.log("["+ socket.id + "] relaying session description to [" + peer_id + "] ", session_description);

        if (peer_id in sockets) {
            sockets[peer_id].emit('sessionDescription', {'peer_id': socket.id, 'session_description': session_description});
        }
    });

		// function detectFaces(req) {
		// 	return new Promise((resolve, reject) => {
		// 		rekognition.detectFaces(req, function(err, data) {
		// 			if (err) console.log(err.stack); // an error occurred
		// 			else{  // successful response
		// 				 resolve(data);
		// 			 }
		// 		});
		// 	});
		// }

    // var totalPeoeple = 0;
		// socket.on('facedetect', function(img){
		// 	let arraybuffer = _base64ToArrayBuffer(img.buffer);
		// 	const request = {
		// 		Image: { /* required */
		// 			Bytes: arraybuffer,
		// 		},
		// 		Attributes: ["ALL", "DEFAULT"]
		// 	};
		// 	if(socket.id!=teacher){
		// 		detectFaces(request)
		// 		.then((data) => {

		// 		  const faces = data.FaceDetails;
		// 			var emotion = '';
		// 			var value = 0.0;
		// 			var caution = '';
		// 			var count = 0;

		// 		  faces.forEach((face) => {
		// 				count++;
		// 				let emotions = face.Emotions;
		// 				emotions.forEach((emo) => {
		// 					if(value < emo.Confidence){
		// 						value = emo.Confidence;
		// 						emotion = emo.Type;
		// 					}
		// 				});

		// 				score[emotion]++;

		// 				console.log('now', emotion);
		// 				console.log('score', score[emotion]);

		// 				if( (face.Pose.Yaw>=30) || (face.Pose.Yaw<=-30)){
		// 					console.log('注意!!!小學伴左顧右盼');
		// 					caution = "distract";
		// 				}else if( face.Pose.Pitch<=-30 ){
		// 					console.log('注意!!!小學伴低頭');
		// 					caution = "bow";
		// 				}else{
		// 					caution = "good";
		// 				}

		// 		  });
		// 			totalPeoeple++;
		// 			console.log('人數: ', count);
		// 			console.log('total: ', totalPeoeple);
		// 			io.to(teacher).emit('detectResult', {
		// 				emotion: emotion,
		// 				caution: caution,
		// 				count: count
		// 			});

		// 			switch(emotion) {
		// 				case "HAPPY":
		// 					emoRecord += "1";
		// 					break;
		// 				case "SAD":
		// 					emoRecord += "2";
		// 				  break;
		// 				case "ANGRY":
		// 					emoRecord += "3";
		// 				  break;
		// 				case "DISGUSTED":
		// 					emoRecord += "4";
		// 				  break;
		// 				case "FEAR":
		// 					emoRecord += "5";
		// 					break;
		// 				default:
		// 					emoRecord += "0";
		// 			};
		// 		});
		// 	} // end if (socket=學生)
        // });
        ////連機遊戲開始
});
          
      
    