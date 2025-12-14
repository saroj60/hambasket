import axios from 'axios';

const testLogin = async () => {
    try {
        console.log("Testing Login...");
        const response = await axios.post('http://127.0.0.1:5000/api/auth/login', {
            email: 'sarojbhagat666@gmail.com',
            password: 'admin123'
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log("✅ Status:", response.status);
        console.log("✅ Data:", response.data);
    } catch (error) {
        console.error("❌ Error:", error.message);
        if (error.response) {
            console.error("❌ Response Status:", error.response.status);
            console.error("❌ Response Data:", error.response.data);
        }
    }
};

testLogin();
