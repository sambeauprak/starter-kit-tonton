<?php

// Path database from root
$root_dir = dirname(__DIR__);

$sql_path = $root_dir . '/database.sqlite';
try {
    $pdo = new PDO("sqlite:" . $sql_path);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    die("Erreur de connexion : " . $e->getMessage());
}