var mysql  = require('mysql');
var connection = mysql.createConnection({
    host     : 'http://120.105.161.167/',
    user     : 'root',    
    password : '12345678',    //你的密碼（就是這個該死的密碼坑死我了）
    database : 'jamesdatabase'    //你的資料庫
});

connection.connect();

connection.query('SELECT * from notification', function (error, results, fields) {
if (error) throw error;
    for(var i=0;i<results.length;i++){
        console.log('The results is: '+results[i].ID+' '+results[i].Name+' '+results[i].Population);
    }
});