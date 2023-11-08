const dataUrl = 'data.json';
let map;
let markerClusterer;
let infoWindow;
let selectedEmployeeRange = null;
let selectedCiroRange = '0';

// JSON verilerini getiren fonksiyon
async function getData() {
    const response = await fetch(dataUrl);
    return await response.json();
}

// Filtreleme işlemini uygulayan fonksiyon
async function applyFilters() {
    selectedCiroRange = document.getElementById('ciro-filter').value;
    selectedEmployeeRange = document.querySelector('input[name="employee-filter"]:checked')?.value || null;
    
    const data = await getData();

    const filteredData = data.filter(company => {
        const annualRevenue = company.annualRevenue;
        const employeeCount = company.employeeCount;

        const ciroFilterPassed = (selectedCiroRange === '0' || (annualRevenue >= Number(selectedCiroRange.split('-')[0]) && (selectedCiroRange.split('-')[1] === "" || annualRevenue <= Number(selectedCiroRange.split('-')[1]))));
        
        const employeeFilterPassed = !selectedEmployeeRange || (
            (selectedEmployeeRange === '10-20' && employeeCount >= 10 && employeeCount <= 20) ||
            (selectedEmployeeRange === '20-50' && employeeCount >= 20 && employeeCount <= 50) ||
            (selectedEmployeeRange === '50+' && employeeCount >= 50)
        );

        return ciroFilterPassed && employeeFilterPassed;
    });

    updateMarkers(filteredData);
}

// Tüm şirketleri gösteren fonksiyon
async function showAllLocations() {
    const data = await getData();
    updateMarkers(data);
}

// Haritadaki işaretçileri güncelleyen fonksiyon
function updateMarkers(filteredData) {
    markerClusterer.clearMarkers();

    // Yıllık ciroya göre renk skalasını belirle
    const minRevenue = Math.min(...filteredData.map(company => company.annualRevenue));
    const maxRevenue = Math.max(...filteredData.map(company => company.annualRevenue));

    filteredData.forEach(company => {
        const address = company.address;
        const category = company.category;
        const employeeCount = company.employeeCount;
        const annualRevenue = company.annualRevenue;

        const revenuePercentage = (annualRevenue - minRevenue) / (maxRevenue - minRevenue);
        const color = getColorFromPercentage(revenuePercentage);

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK') {
                const location = results[0].geometry.location;
                // icon kısmını boş bıraktık, sadece istediğimiz şekiller gözüksün
                const icon = {
                    url: "", // url
                    scaledSize: new google.maps.Size(50, 50), // scaled size
                    // origin: new google.maps.Point(0,0), // origin
                    // anchor: new google.maps.Point(0, 0) // anchor
                };
                const marker = new google.maps.Marker({
                    position: location,
                    map: map,
                    title: company.name,
                    label: {
                        text: getMarkerIcon(category),
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

// Yıllık ciroya göre renk skalasından renk al
function getColorFromPercentage(percentage) {
    const r = Math.floor(255 * (1 - percentage));
    const g = Math.floor(255 * percentage);
    const b = 0;
    return `rgb(${r},${g},${b})`;
}


// Kategoriye göre işaretçi ikonunu döndüren fonksiyon
function getMarkerIcon(category) {
    let icon = '';
    switch (category) {
        case 'Kategori 1':
            icon = '\uef4a';
            break;
        case 'Kategori 2':
            icon = '\ue86b';
            break;
        case 'Kategori 3':
            icon = '\ueb36';
            break;
        default:
            icon = '\ue5c9';
            break;
    }

    return icon;
}

// Tüm filtreleri sıfırlayan fonksiyon
function resetFilters() {
    document.getElementById('ciro-filter').selectedIndex = 0;
    document.getElementById('employee-10-20').checked = false;
    document.getElementById('employee-20-50').checked = false;
    document.getElementById('employee-50+').checked = false;

    selectedCiroRange = '0';
    selectedEmployeeRange = null;

    applyFilters();
}

// Harita başlatma fonksiyonu
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 41.007153284784536, lng: 28.94157527696257 },
        zoom: 11
    });

    // MarkerClusterer nesnesini oluştur
    markerClusterer = new MarkerClusterer(map, [], { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });

    applyFilters(); // Başlangıçta filtreleme işlemini uygula
}
