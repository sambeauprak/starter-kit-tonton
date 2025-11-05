<?php
require_once __DIR__ . '/../../src/controllers/categoriesController.php';

switch ($action) {
    case 'index':
        categoriesIndex($pdo);
        break;
    case 'create':
        categoriesCreate($pdo);
        break;
    case 'edit':
        categoriesEdit($pdo, $_GET['id'] ?? null);
        break;
    case 'delete':
        categoriesDelete($pdo, $_GET['id'] ?? null);
        break;
    default:
        http_response_code(404);
        echo json_encode(['message' => 'Not Found']);
}
