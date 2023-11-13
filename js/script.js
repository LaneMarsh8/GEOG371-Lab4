var map = L.map('map').setView([40, -120], 5);

L.tileLayer('https://api.mapbox.com/styles/v1/laner/clonityzn003d01rb4tjc36s7/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibGFuZXIiLCJhIjoiY2xvaXlxNHJoMDR5eDJqcGRoOXZ4N2ZkMCJ9.2A_uhFX6ce_YdyI-9Aqh_A', {
    maxZoom: 19,
}).addTo(map);




// Fetch GeoJSON data
fetch('https://raw.githubusercontent.com/LaneMarsh8/firestations/main/Fire_Stations.geojson')
    .then(response => response.json())
    .then(data => {
        // Create an array for heatmap points
        var heatmapData = [];

        // Create a GeoJSON layer with hover popups
        var geojsonLayer = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                // Style the points as small black dots
                return L.circleMarker(latlng, {
                    radius: 5,
                    color: 'black',
                    fillOpacity: 1 // Make the points fully opaque
                });
            },
            onEachFeature: function (feature, layer) {
                // Add GeoJSON points to the heatmap array
                var coordinates = feature.geometry.coordinates.reverse();
                heatmapData.push(coordinates);

                // Bind a popup to each feature (fire station) on hover
                layer.on({
                    mouseover: function (event) {
                        var popupContent = '<strong>Fire Station</strong><br>' +
                                           'Name: ' + feature.properties.NAME + '<br>' +
                                           'Address: ' + feature.properties.ADDRESS;

                        // Open the popup on hover
                        layer.bindPopup(popupContent).openPopup();
                    },
                    mouseout: function (event) {
                        // Close the popup when the mouse leaves the feature
                        layer.closePopup();
                    }
                });
            }
        });

        // Create a heatmap layer with a gradient
        var heatLayer = L.heatLayer(heatmapData, {
            radius: 20,
            gradient: {
                0.0: 'rgba(0, 0, 255, 0.9)',    // blue
                0.02: 'rgba(0, 255, 255, 0.9)', // cyan
                0.05: 'rgba(0, 255, 0, 0.9)',    // lime
                0.1: 'rgba(255, 255, 0, 0.9)',  // yellow
                0.2: 'rgba(255, 165, 0, 0.9)',  // orange
                0.3: 'rgba(255, 0, 0, 0.9)'     // red
            }
        }).addTo(map);

        // Add an event listener for map zoom
        map.on('zoomend', function () {
            var currentZoom = map.getZoom();

            // Show points at higher zoom levels
            if (currentZoom >= 10) {
                map.addLayer(geojsonLayer);
            } else {
                map.removeLayer(geojsonLayer);
            }
        });
    })
    .catch(error => console.error('Error fetching GeoJSON:', error));