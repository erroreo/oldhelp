<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>生理監測系統</title>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js" integrity="sha512-bLT0Qm9VnAYZDflyKcBaQ2gg0hSYNQrJ8RilYldYQ1FxQYoCLtUjuuRuZo+fjqhx/qtq/1itJ0C2ejDxltZVFg==" crossorigin="anonymous"></script>
</head>
<body background="heartback.jpg">
    <?php
        header ("Content-type: text/html; charset=UTF-8");

        $link=mysqli_connect("localhost","root","12345678","jamesdatabase");
        if ($link->connect_error) {
            die('連線失敗：'.$link->connect_error);
        }

        $sql = "SELECT * FROM data_raw order by id DESC";
        $result = $link->query($sql);
        
        $row=$result->fetch_row();
        $avg='';
        $arr = json_decode($row[2], true);
    
        for($i = 0; $i < count($arr["activities-heart-intraday"]["dataset"]); $i++){
            $time[$i] = $arr["activities-heart-intraday"]["dataset"][$i]["time"];
            $values[$i] = $arr["activities-heart-intraday"]["dataset"][$i]["value"];
        }
        $count=0;
        $heartbeat=0;
        for($x = 0;$x < count($values) ;$x++){
            $count+=(int)$values[$x];
            if($x == count($values) - 1){
                $heartbeat = (int)$values[$x];
            }
        }
        (int)$avg = $count/count($values);
        ?>
<center>
<img src="heartp.png" height="200px"><br><br>

    <table cellpadding="10" WIDTH="100%" HEIGHT="100" BORDER="5" BORDERCOLOR="#FFB7DD">
        <tbody id="tbody1">
            <tr>
                <td><font size="6" face="標楷體" color="white">
                    心跳
                </font></td>
                <td><font size="6" face="標楷體" color="white">
                    130
                </font></td>
			</tr>
			<tr>
				<td><font size="6" face="標楷體" color="white">
                    平均心跳
                </font></td>
                <td><font size="6" face="標楷體" color="white">
                    98
                </font></td>
			</tr>
            <tr>
			<tr>
				<td COLSPAN=2 ALIGN=CENTER> <input type="button" value="查看歷史紀錄" id="btn_haert" onclick="location.href='heartlist.php'" style="width:300px;height:40px;font-size:20px; background-color:	#FF7744; color:white"></td>
            </tr>
        </tbody>
    </table>
    <script src="../fitbit-master/app.js"></script>
    </center>
</body>
</html>