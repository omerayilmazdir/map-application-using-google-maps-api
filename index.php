<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
    <title>Google Haritalar API Projesi</title>
    <style>
        #map {
            height: 650px;
            width: 100%;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="./app.js"></script>
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBDVW9mT99EX1A0DKI5MZrSBlbsjnEdn7I&callback=initMap" async defer></script>
    <script src="./markerclusterer.js"></script>
</body>
</html>
