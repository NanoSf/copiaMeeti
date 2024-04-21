document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector("#ubicacion-meeti")) {
    mostrarMapa();
  }
});

function mostrarMapa() {
    const [lat, lng, dir] = [
        document.querySelector("#lat").value,
        document.querySelector("#lng").value,
        document.querySelector('#direccion').value
    ];

    let map = L.map("ubicacion-meeti", {
        center: [lat, lng],
        zoom: 15,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
        foo: "bar",
        attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker([lat, lng]).addTo(map)
        .bindPopup(dir)
        .openPopup();
}
