import axios from 'axios';

export const sendSMS = async (to, text) => {
    const token = process.env.SPARROW_TOKEN;
    const identity = process.env.SPARROW_IDENTITY || 'Demo'; // Default identity if not set

    if (!token) {
        console.log("⚠️ SPARROW_TOKEN not found in env.");
        console.log("📱 [DEV MODE] SMS to", to, ":", text);
        return { success: true, message: "SMS logged to console (Dev Mode)" };
    }

    try {
        // Sparrow SMS API Endpoint
        const url = "http://api.sparrowsms.com/v2/sms/";

        const response = await axios.get(url, {
            params: {
                token: token,
                from: identity,
                to: to,
                text: text
            }
        });

        if (response.status === 200) {
            console.log("✅ SMS sent successfully to", to);
            return { success: true, response: response.data };
        } else {
            throw new Error(`SMS API returned status ${response.status}`);
        }

    } catch (error) {
        console.error("❌ Error sending SMS:", error.message);
        // In production, you might want to throw this error or handle it gracefully
        // For now, we'll log it and fallback to console for continuity if API fails
        console.log("📱 [FALLBACK] SMS to", to, ":", text);
        return { success: false, error: error.message };
    }
};
