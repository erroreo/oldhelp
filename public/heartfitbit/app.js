// get the url 
var url = window.location.href;
//getting the access token from url 
var access_token = url.split("#")[1].split("=")[1].split("&")[0]; 
// get the userid 
var userId = url.split("#")[1].split("=")[2].split("&")[0]; 
// console.log(access_token); 
// console.log(userId);
var xhr = new XMLHttpRequest();
var socket = "https://120.105.161.167:8000";
xhr.open('GET', 'https://api.fitbit.com/1/user/' + userId + '/activities/heart/date/today/1d.json');
xhr.setRequestHeader("Authorization", 'Bearer ' + access_token);
xhr.onload = function () {
    if (xhr.status === 200) {
        var result = JSON.parse(xhr.responseText);
        console.log(result);
        console.log(result['activities-heart'][0].dateTime);
        signaling_socket = io(socket);
        signaling_socket.emit("heartinsert",{"date":result['activities-heart'][0].dateTime,"data":xhr.responseText})
    }
};
xhr.send()