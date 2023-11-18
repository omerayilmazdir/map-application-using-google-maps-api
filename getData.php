<?php
$servername = "localhost";
$username = "root"; // MySQL kullanıcı adınız
$password = ""; // MySQL şifreniz (varsayılan olarak boş)
$dbname = "my_company_db"; // Oluşturduğunuz veritabanının adı

// MySQL veritabanına bağlanma
$conn = new mysqli($servername, $username, $password, $dbname);

// Bağlantı hatası kontrolü
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT * FROM companies";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // Verileri JSON formatında ekrana yazdır
    $data = array();
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
} else {
    echo "0 results";
}

$conn->close();
?>
