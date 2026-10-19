
   mapboxgl.accessToken = mapToken;

// Fallback to New Delhi [77.209, 28.6139] if an old listing has empty coordinates []
const coordinates =
  listing.geometry &&
  listing.geometry.coordinates &&
  listing.geometry.coordinates.length === 2
    ? listing.geometry.coordinates
    : [77.209, 28.6139];

const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v12",
  center: coordinates, // starting position [lng, lat]
  zoom: 9, // starting zoom
});

const marker = new mapboxgl.Marker({ color: "red" })
  .setLngLat(coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h4>${listing.location}</h4><p>Exact Location provided after booking</p>`
    )
  )
  .addTo(map);