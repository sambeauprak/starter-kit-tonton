<?php

$route = $_GET['route'] ?? 'products.index';


[$controller, $action] = array_pad(explode('.', $route), 2, null);

switch ($controller) {
    case 'products':
        require_once './api/products.php';
        break;
    case 'customers':
        require_once './api/customers.php';
        break;
    case 'orders':
        require_once './api/orders.php';
        break;
    case 'categories':
        require_once './api/categories.php';
        break;
    case 'stats':
        require_once './api/stats.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(["message" => "Not Found"]);
        break;
}
