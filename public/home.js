
document.getElementById('search-form').addEventListener('submit', e => {
    e.preventDefault();
    const city = document.getElementById('search').value;
    console.log(city);
    try {
        location.assign(`/${city}`);
    } catch (error) {
        console.log('City cannot find!');
    }
})