// console.log("hello from main.js");


document.getElementById('search-form').addEventListener('submit', e => {
    e.preventDefault();
    const city = document.getElementById('city-input').value;
    // console.log(city);
    searchCity(city);
})

const searchCity = async (city) => {
    try {
        location.assign(`/${city}`);
    } catch (error) {
        console.log(error);
        alert("city cannot be found!");
    }
}

// d = new Date()
// localTime = d.getTime()
// localOffset = d.getTimezoneOffset() * 60000
// utc = localTime + localOffset
// var atlanta = utc + (1000 * 19800)
// nd = new Date(atlanta)
// console.log(nd);