<?php
// Mulai session di awal file
session_start();

// --- Konfigurasi Database ---
// GANTI DENGAN DETAIL KONEKSI DATABASE ANDA
$servername = "localhost";
$username = "root"; // Username database Anda
$password = "";     // Password database Anda
$dbname = "veo3git_users"; // Nama database Anda

// --- Buat Koneksi ---
$conn = new mysqli($servername, $username, $password);

// Periksa koneksi
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi database gagal.']));
}

// Buat database jika belum ada
$sql = "CREATE DATABASE IF NOT EXISTS $dbname";
if (!$conn->query($sql)) {
    die(json_encode(['success' => false, 'message' => 'Gagal membuat database: ' . $conn->error]));
}

// Pilih database
$conn->select_db($dbname);

// Buat tabel users jika belum ada
$tableSql = "CREATE TABLE IF NOT EXISTS users (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

if (!$conn->query($tableSql)) {
    die(json_encode(['success' => false, 'message' => 'Gagal membuat tabel: ' . $conn->error]));
}


// --- Tangani Permintaan AJAX ---
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['action'])) {
    if ($data['action'] == 'register') {
        // --- Logika Pendaftaran ---
        $username = $conn->real_escape_string($data['username']);
        $email = $conn->real_escape_string($data['email']);
        $password = $data['password'];

        if (empty($username) || empty($email) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'Semua field harus diisi.']);
            exit();
        }

        $password_hash = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $username, $email, $password_hash);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Pendaftaran berhasil! Silakan login.']);
        } else {
            if ($conn->errno == 1062) {
                 echo json_encode(['success' => false, 'message' => 'Username atau email sudah digunakan.']);
            } else {
                 echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan saat mendaftar.']);
            }
        }
        $stmt->close();

    } elseif ($data['action'] == 'login') {
        // --- Logika Login ---
        $username = $conn->real_escape_string($data['username']);
        $password = $data['password'];

        if (empty($username) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'Username dan password harus diisi.']);
            exit();
        }

        $stmt = $conn->prepare("SELECT id, username, password_hash FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows == 1) {
            $user = $result->fetch_assoc();
            if (password_verify($password, $user['password_hash'])) {
                // Login berhasil, simpan data ke session
                $_SESSION['loggedin'] = true;
                $_SESSION['id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                echo json_encode(['success' => true, 'message' => 'Login berhasil! Mengalihkan...']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Password salah.']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Username tidak ditemukan.']);
        }
        $stmt->close();
    }
}

$conn->close();
?>
