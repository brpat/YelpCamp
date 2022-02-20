mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'cluster-map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: campground.geometry.coordinates, // centerstarting position [lng, lat]
    zoom: 4 // starting zoom
});

new mapboxgl.Marker()
.setLngLat(campground.geometry.coordinates)
.setPopup(
    new mapboxgl.Popup({offset:25})
    .setHTML(
        `<h3>${campground.title}</h3><p>${campground.location}</p>`
    )
)
.addTo(map)