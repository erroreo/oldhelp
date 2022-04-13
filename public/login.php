<?php
    $uname = $_POST['username'];
    $pwd = $_POST['password'];
    require_once("dbtools.inc.php");
        if($uname == "partner")
        {
                header("Location:https://120.105.161.167:8000/partner");
                
        }
        if($uname == "old")
        {
            header("Location:https://120.105.161.167:8000/old");
        }
?>
