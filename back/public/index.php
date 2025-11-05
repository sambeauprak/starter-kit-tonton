<?php

$route = $_GET['route'] ?? 'notes.index';


[$controller, $action] = array_pad(explode('.', $route), 2, null);

switch ($controller) {
    case 'notes':
        require_once './api/notes.php';
        break;
    case 'products':
        require_once './api/products.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(["message" => "Not Found"]);
        break;
}
