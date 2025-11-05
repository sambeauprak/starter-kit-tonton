<?php
require_once __DIR__ . '/../../src/controllers/customersController.php';

switch ($action) {
    case 'index':
        customersIndex($pdo);
        break;
    case 'create':
        customersCreate($pdo);
        break;
    case 'edit':
        customersEdit($pdo, $_GET['id'] ?? null);
        break;
    case 'delete':
        customersDelete($pdo, $_GET['id'] ?? null);
        break;
    default:
        http_response_code(404);
        echo json_encode(['message' => 'Not Found']);
}
