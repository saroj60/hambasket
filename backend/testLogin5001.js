import axios from 'axios';

const testLogin = async () => {
    try {
        console.log("Testing Login on Port 5001...");
        const response = await axios.post('http://127.0.0.1:5001/api/auth/login', {
            email: 'admin@gmail.com',
            password: 'password' // Trying a generic password, but mainly checking if server responds
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log("✅ Status:", response.status);
    } catch (error) {
        console.error("❌ Error Message:", error.message);
        if (error.response) {
            console.error("❌ Response Data:", JSON.stringify(error.response.data, null, 2));
        }
    }
};

testLogin();
