<?php

    if(isset($_POST['send'])){
        http_response_code(201);
        echo json_encode([]);
    }