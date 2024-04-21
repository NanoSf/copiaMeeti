import { OpenStreetMapProvider } from "leaflet-geosearch";
import asistencia from './asistencia.js';
import eliminarComentario from './eliminarComentario.js';
const geocodeService = L.esri.Geocoding.geocodeService();

let map;
let markers;
let marker;

document.addEventListener("DOMContentLoaded", () => {
    

    

    if(document.querySelector('#mapa')){
        const lat = document.querySelector('#lat').value || 5.0823135 ;
        const lng = document.querySelector('#lng').value || -73.3635705;
        const direccion = document.querySelector('#direccion').value || '';

        map = L.map('mapa').setView([lat, lng], 15);
        markers = new L.FeatureGroup().addTo(map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        //* Agregar el Pin
        marker = new L.marker([lat,lng], {
            draggable: true,
            autoPan: true
        }).addTo(map)
            .bindPopup(direccion)
            .openPopup();
        
        //* Asignar al contenedor markers
        markers.addLayer(marker);

        //* Detectar movimiento del pin
        marker.on('moveend', function (e) {
            marker = e.target;
            
            const posicion = marker.getLatLng();

            map.panTo(new L.LatLng(posicion.lat, posicion.lng));

            //* Reverse geocoding, cuando el usuario reubica el pin
            geocodeService.reverse().latlng(posicion, 13).run(function(error, result){
                llenarInputs(result);

                //* Asigna los valores al popoup del markes
                marker.bindPopup(result.address.LongLabel);
            });
        });

        //* Buscar la direccion
        const buscador = document.querySelector('#formbuscador');
        if(buscador){
            buscador.addEventListener('input', buscarDireccion)
        }
    }
});

function buscarDireccion(e) {
    if (e.target.value.length > 6) {
        //* Limpiar marker previos
        markers.clearLayers();
        
        //* Utilizar el OpenStreetMapProvider y GeoCoder
        const provider = new OpenStreetMapProvider();

        provider.search({ query: e.target.value })
            .then((resultado) => {
                geocodeService.reverse().latlng(resultado[0].bounds[0], 15).run(function (error, result) {
                    llenarInputs(result);

                    //* Mostrar el mapa
                    map.setView(resultado[0].bounds[0], 15);

                    //* Agregar el Pin
                    marker = new L.marker(resultado[0].bounds[0], {
                        draggable: true,
                        autoPan: true
                    }).addTo(map)
                        .bindPopup(resultado[0].label)
                        .openPopup();

                    //* Asignar al contenedor markers
                    markers.addLayer(marker);

                    //* Detectar movimiento del pin
                    marker.on('moveend', function (e) {
                        marker = e.target;
                        const posicion = marker.getLatLng();

                        map.panTo(new L.LatLng(posicion.lat, posicion.lng));

                        //* Reverse geocoding, cuando el usuario reubica el pin
                        geocodeService.reverse().latlng(posicion, 13).run(function(error, result){
                            llenarInputs(result);

                            //* Asigna los valores al popoup del markes
                            marker.bindPopup(result.address.LongLabel);
                        });
                    });
                })
            });
    }
}

function llenarInputs(resultado){
    document.querySelector('#direccion').value = resultado.address.Address || '';
    document.querySelector('#ciudad').value = resultado.address.City || '';
    document.querySelector('#estado').value = resultado.address.Region || '';
    document.querySelector('#pais').value = resultado.address.CountryCode || '';
    document.querySelector('#lat').value = resultado.latlng.lat || '';
    document.querySelector('#lng').value = resultado.latlng.lng || '';
}






