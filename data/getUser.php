<?php
    header('Content-Type: application/json');
    $user=[
        "name"=>"John Doe",
        "email"=>"JoeDoe@gmail.com",
        "avatar"=>"./images/user-avatar.png"
    ];

    echo json_encode($user);
?>