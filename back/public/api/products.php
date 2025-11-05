<?php
require_once __DIR__ . '/../../src/controllers/productsController.php';

switch ($action) {
    case 'index':
        productsIndex($pdo);
        break;
    case 'create':
        productsCreate($pdo);
        break;
    case 'edit':
        productsEdit($pdo, $_GET['id'] ?? null);
        break;
    case 'delete':
        productsDelete($pdo, $_GET['id'] ?? null);
        break;
    default:
        http_response_code(404);
        echo json_encode(['message' => 'Not Found']);
}
