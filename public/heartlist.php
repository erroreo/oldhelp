<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <div style="position: fixed;" top="0px"><img src="house1.png" width="80" height="80" onclick="location.href = 'https://120.105.161.167:8000/partner'"/></div>
    <title>生理監測系統</title>
	<script type="text/javascript" src="heartlist2.html"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js" integrity="sha512-bLT0Qm9VnAYZDflyKcBaQ2gg0hSYNQrJ8RilYldYQ1FxQYoCLtUjuuRuZo+fjqhx/qtq/1itJ0C2ejDxltZVFg==" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.3/Chart.min.js" integrity="sha512-s+xg36jbIujB2S2VKfpGmlC3T5V2TF3lY48DX7u2r9XzGzgPsa6wTpOQA7J9iffvdeBN0q9tKzRxVxw1JviZPg==" crossorigin="anonymous"></script>
</head>
<body background="draw.png">
    <style>
        @import 'https://fonts.googleapis.com/css?family=Open+Sans+Condensed:300';


        @media screen and (min-width: 980px) {
            .heartcanvas{
                background-color:white;
                width:100%;
                height:10%;
                border:3px;
            }
            .heartclass{
                background-color:white;
                width:100%;
            }
        }
        @media screen and (min-width: 736px) and (max-width: 979px) {
            .heartcanvas{
                background-color:white;
                width:75%;
                height:10%;
                border:3px;
            }
            .heartclass{
                background-color:white;
                width:100%;
                height:30;
            }
        }
        @media screen and (min-width: 321px) and (max-width: 735px) {
            .heartcanvas{
                background-color:white;
                width:100%;
                height:10%;
                border:3px;
            }
            .heartclass{
                background-color:white;
                width:100%;
                height:100%;
            }
        }
    </style>
<center>
<?php
        header ("Content-type: text/html; charset=UTF-8");
        if($_GET['bdaymonth'] != ''){
            echo "<img src='heartp.png' height='200px'><br><br>";
            $monthsearch = $_GET['bdaymonth']."%";
            $link=mysqli_connect("localhost","root","4niufmNznRsXj1oT","jamesdatabase");
            if ($link->connect_error) {
                die('連線失敗：'.$link->connect_error);
            }
    
            $sql = "SELECT DISTINCT * FROM data_raw where fbdate like \"$monthsearch\" order by id DESC LIMIT 0,1";
            $result = $link->query($sql);
            if($result->num_rows>0){
                echo "<div class='heartcanvas' '>
            <canvas class='heartclass' id='myChart'></canvas>
                </div>";
                $count = 0;
                while($row=$result->fetch_row()){
                    $arr = json_decode($row[2],true);
                        
                    for($i = 0; $i < count($arr["activities-heart-intraday"]["dataset"]); $i++){
                        $date = $row[1];
                        $time[$i] = $arr["activities-heart-intraday"]["dataset"][$i]["time"];
                        $values[$i] = $arr["activities-heart-intraday"]["dataset"][$i]["value"];
                        $count++;
                    }
                }
                $heartbeat = $values;
            }else{
                echo "查無資料";
            }
        }else{
            echo "<img src='heartp.png' height='200px'><br><br>";
        }
        $allheartbeat = 0;
        $avg = 0;
        for($y = 0;$y < count($heartbeat);$y++){
            for($x = 0;$x < count($heartbeat[$y]) ;$x++){
                $allheartbeat = $allheartbeat+(int)$heartbeat[$y][$x];
            }
        }
        
        $avg = ceil($allheartbeat/$count);
        
        ?>



<script>
    var date = "<?php echo $date ?>" ;
    var time  = <?php echo json_encode($time);?> ;
    var values  = <?php echo json_encode($values);?> ;
    // console.log(time,time[0],values,values[0]);
    var data = {
        time:[],
        values:[]
    };

  for(var i = 0;i < time.length;i++){
    data.time.push(date+time[i]);
    data.values.push(values[i]);
  }  
  console.log(data.values);
  var ctx = document.getElementById('myChart').getContext('2d');
  var chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.time.map(x=>x.slice(10,15)),
      datasets: [{
        label: '心跳',
        data: data.values.map(x=>x),
        // Line
        lineTension: 0,
        backgroundColor: '#FF5376',
        borderColor: '#FF5376',
        fill: false,
        borderWidth: 2,
        // Point
        pointRadius: 0,
        pointHoverRadius: 7,
      }]
    },
  });
</script>

    <form action="heartlist.php" method="get">
	<h1>查看日期<br><input type="date"" name="bdaymonth" />
    <input type="submit" id="btn_look" value="查看" style="width:100px;height:40px;font-size:20px; background-color:#548C00; color:white"></h1>
    </form>
        <!-- <table class="blueTable" >
        <thead>
        <tr>
        <th><font size="6" face="標楷體" color="white">心跳</font></th>
        <th><font size="6" face="標楷體" color="white">日期</font></th>
        </tr>
        </thead>
            <tbody id="tbody1">
                <?php
                    // for($y = 0;$y < count($heartbeat);$y++){
                    //     for($x = 0;$x < count($heartbeat[$y]) ;$x++){
                    //         echo "<tr>";
                    //         echo "<td><font size='5' face='標楷體' color='black'>".$heartbeat[$y][$x]."</font></td>";
                    //         echo "<td><font size='6' face='標楷體' color='black'>".$date[$y][$x]." ".$time[$y][$x]."</font></td>";
                    //         echo "</tr>";
                    //     }
                    // }
                ?>
            </tbody>
        </table> -->
    <!-- <table cellpadding="10" WIDTH="600" HEIGHT="100" BORDER="10" BORDERCOLOR="#FFB7DD">
        <tbody id="tbody1">
            <tr>
                <td><font size="6" face="標楷體" color="white">
                    心跳
                </font></td>
				<td><font size="6" face="標楷體" color="white">
					日期
                </font></td>
            </tr>
             <?php
                // for($y = 0;$y < count($heartbeat);$y++){
                //     for($x = 0;$x < count($heartbeat[$y]) ;$x++){
                //         echo "<tr>";
                //         echo "<td><font size='5' face='標楷體' color='white'>".$heartbeat[$y][$x]."</font></td>";
                //         echo "<td><font size='6' face='標楷體' color='white'>".$date[$y][$x]." ".$time[$y][$x]."</font></td>";
                //         echo "</tr>";
                //     }
                // }
            ?> 
        </tbody>
    </table> -->
    <style>
        table.blueTable {
        border: 1px solid #1C6EA4;
        background-color: #EEEEEE;
        width: 100%;
        text-align: left;
        border-collapse: collapse;
        }
        table.blueTable td, table.blueTable th {
        border: 1px solid #AAAAAA;
        padding: 3px 2px;
        }
        table.blueTable tbody td {
        font-size: 13px;
        }
        table.blueTable tr:nth-child(even) {
        background: #D0E4F5;
        }
        table.blueTable thead {
        background: #1C6EA4;
        background: -moz-linear-gradient(top, #5592bb 0%, #327cad 66%, #1C6EA4 100%);
        background: -webkit-linear-gradient(top, #5592bb 0%, #327cad 66%, #1C6EA4 100%);
        background: linear-gradient(to bottom, #5592bb 0%, #327cad 66%, #1C6EA4 100%);
        border-bottom: 2px solid #444444;
        }
        table.blueTable thead th {
        font-size: 15px;
        font-weight: bold;
        color: #FFFFFF;
        border-left: 2px solid #D0E4F5;
        }
        table.blueTable thead th:first-child {
        border-left: none;
        }

        table.blueTable tfoot {
        font-size: 14px;
        font-weight: bold;
        color: #FFFFFF;
        background: #D0E4F5;
        background: -moz-linear-gradient(top, #dcebf7 0%, #d4e6f6 66%, #D0E4F5 100%);
        background: -webkit-linear-gradient(top, #dcebf7 0%, #d4e6f6 66%, #D0E4F5 100%);
        background: linear-gradient(to bottom, #dcebf7 0%, #d4e6f6 66%, #D0E4F5 100%);
        border-top: 2px solid #444444;
        }
        table.blueTable tfoot td {
        font-size: 14px;
        }
        table.blueTable tfoot .links {
        text-align: right;
        }
        table.blueTable tfoot .links a{
        display: inline-block;
        background: #1C6EA4;
        color: #FFFFFF;
        padding: 2px 8px;
        border-radius: 5px;
        }
}
 </style>
</body>
</html>