<?php
// Mulai session
session_start();

// Hancurkan semua data session
session_destroy();

// Alihkan ke halaman login
header('Location: login.html');
exit;
?>
