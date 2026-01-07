
const url = 'https://hambasket-backend.onrender.com/api/setup/seed-admin';

console.log("Fetching: " + url);

fetch(url)
    .then(async (res) => {
        console.log('Status Code:', res.status);
        const text = await res.text();
        console.log('Body:', text);
    })
    .catch((err) => {
        console.log('Error: ', err.message);
    });
