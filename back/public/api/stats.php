<?php

require_once __DIR__ . '/../../src/controllers/noteController.php';
switch ($action) {
    case 'index':
        listNotes($pdo);
        break;
    case 'create':
        createNote($pdo, $_POST['title'] ?? '', $_POST['content'] ?? '');
        break;
    case 'edit':
        if (isset($_GET['id'])) {
            editNote($pdo, $_GET['id'], $_POST['title'] ?? '', $_POST['content'] ?? '');
        }
        break;
    case 'delete':
        if (isset($_GET['id'])) {
            removeNote($pdo, $_GET['id']);
        }
        break;
}
