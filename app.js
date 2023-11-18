let map;
let markerClusterer;
let infoWindow;

// Harita başlatma fonksiyonu
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 41.007153284784536, lng: 28.94157527696257 },
        zoom: 11
    });

    // MarkerClusterer nesnesini oluştur
    markerClusterer = new MarkerClusterer(map, [], { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
    getDataFromDatabase(); // Verileri çek ve işle
}
// MySQL verilerini çeken fonksiyon
async function getDataFromDatabase() {
    const response = await fetch('getData.php');
    const data = await response.json();
    updateMarkers(data);
}
// Haritadaki işaretçileri güncelleyen fonksiyon
function updateMarkers(data) {
    markerClusterer.clearMarkers();

    // Yıllık ciroya göre renk skalasını belirle
    const minRevenue = Math.min(...data.map(company => company.annualRevenue));
    const maxRevenue = Math.max(...data.map(company => company.annualRevenue));
    
    data.forEach(company => {
        const address = company.address;
        const category = company.category;
        const employeeCount = company.employeeCount;
        const annualRevenue = company.annualRevenue;
        const shapeCode = company.shapeCode;
        
        const revenuePercentage = (annualRevenue - minRevenue) / (maxRevenue - minRevenue);
        const color = getColorFromPercentage(revenuePercentage);

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK') {
                const location = results[0].geometry.location;

                const icon = {
                    url: "", // isteğe bağlı: özel bir ikon kullanmak isterseniz burayı doldurun
                    scaledSize: new google.maps.Size(50, 50),
                };
                const marker = new google.maps.Marker({
                    position: location,
                    map: map,
                    title: company.name,
                    label: {
                        text: getMarkerIcon(shapeCode),
                        fontFamily: "Material Icons",
                        color: color, // Renk skalasından alınan renk
                        fontSize: "28px",
                    },
                    icon : icon,
                });

                marker.addListener('click', () => {
                    if (infoWindow) {
                        infoWindow.close();
                    }
                    infoWindow = new google.maps.InfoWindow({
                        content: `
                            <h3>${company.name}</h3>
                            <p>Adres: ${address}</p>
                            <p>Kategori: ${category}</p>
                            <p>Çalışan Sayısı: ${employeeCount}</p>
                            <p>Yıllık Ciro: ${annualRevenue}</p>
                        `
                    });
                    infoWindow.open(map, marker);
                });

                markerClusterer.addMarker(marker);
            }
        });
    });
}
// Kategoriye göre işaretçi ikonunu döndüren fonksiyon
function getMarkerIcon(shapeCode) {
    return shapeCode; // shapeCode'u doğrudan ikon olarak kullan
}
// Yıllık ciroya göre renk skalasından renk al
function getColorFromPercentage(percentage) {
    const r = Math.floor(255 * (1 - percentage));
    const g = Math.floor(255 * percentage);
    const b = 0;
    return `rgb(${r},${g},${b})`;
}

