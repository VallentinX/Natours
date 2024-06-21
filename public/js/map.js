export const displayMap = locationsData => {
  const [longStart, latStart] = locationsData[0].coordinates;

  const map = L.map('map', {
    center: [latStart, longStart],
    zoom: 10,
    minZoom: 8,
    maxZoom: 4,
    zoomControl: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    maxBounds: [
      [-90, -180],
      [90, 180],
    ],
    maxBoundsViscosity: 1.0,
  });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    noWrap: true,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  for (let i = locationsData.length - 1; i >= 0; i--) {
    const currLocation = locationsData[i];

    const [long, lat] = currLocation.coordinates;

    const marker = L.marker([lat, long]).addTo(map);

    marker
      .bindPopup(
        `<h1>Arrive on Day ${currLocation.day}</h1><br><h1>Location: ${currLocation.description}.</h1>`
      )
      .openPopup();
  }
};
