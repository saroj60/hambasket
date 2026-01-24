import axios from 'axios';
import * as turf from '@turf/turf';

// Default Delivery Zone (Polygon roughly covering 3km radius around store)
// Converted circular logic to a simple polygon for 'turf' demo, 
// or we can use turf.distance for radius check if polygon is too complex to hardcode right now.
// For now, let's stick to the 3km radius check using turf which is robust.
// Store Location: 27.666417, 85.354750
const STORE_LOCATION = [85.354750, 27.666417]; // Lng, Lat for Turf
const DELIVERY_RADIUS_KM = 3;

export const resolveLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ message: "Latitude and Longitude are required" });
        }

        // 1. Serviceability Check (Radius based for now, easy to upgrade to Polygon)
        const userPoint = turf.point([lng, lat]);
        const storePoint = turf.point(STORE_LOCATION);
        const distance = turf.distance(userPoint, storePoint, { units: 'kilometers' });

        const isServiceable = distance <= DELIVERY_RADIUS_KM;

        // 2. Reverse Geocoding via Nominatim (OpenStreetMap) - Free & No Key
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

        // Nominatim requires User-Agent
        const response = await axios.get(nominatimUrl, {
            headers: { 'User-Agent': 'HamBasketApp/1.0' }
        });

        const result = response.data;
        const address = result.address || {};

        // 3. Format Address Logic
        let addressComponents = {
            area: address.suburb || address.neighbourhood || address.residential || '',
            street: address.road || address.pedestrian || '',
            landmark: address.amenity || address.shop || address.tourism || '',
            city: address.city || address.town || address.village || address.municipality || '',
            state: address.state || address.province || '',
            pincode: address.postcode || ''
        };

        const parts = [];
        if (addressComponents.street) parts.push(addressComponents.street);
        if (addressComponents.area) parts.push(addressComponents.area);
        if (addressComponents.city) parts.push(addressComponents.city);

        // Friendly Display Address
        let friendlyAddress = result.display_name;
        // Construct a shorter version if Nominatim's is too long?
        // Nominatim's display_name is usually very good but long.
        // Let's use our constructed one if decent
        if (parts.length >= 2) {
            friendlyAddress = parts.join(', ');
        }

        res.json({
            formatted_address: friendlyAddress,
            original_formatted_address: result.display_name,
            components: addressComponents,
            serviceable: isServiceable,
            coordinates: { lat, lng },
            serviceability_details: {
                distance_km: distance.toFixed(2),
                max_radius_km: DELIVERY_RADIUS_KM
            }
        });

    } catch (error) {
        console.error("Location Resolve Error:", error.message);
        res.status(500).json({
            message: "Failed to resolve location",
            error: error.message,
            serviceable: false // Fail safe
        });
    }
};
