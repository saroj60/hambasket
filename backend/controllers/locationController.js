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

        // 2. Reverse Geocoding via Google Maps API
        // NOTE: Ensure GOOGLE_MAPS_API_KEY is in .env (Backend doesn't use VITE_ prefix)
        // We will try to read VITE_ one if strictly backend one is missing for convenience in this setup
        const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            console.error("Using fallback mock address - API Key missing");
            // Fallback for dev without key
            return res.json({
                formatted_address: "Debug Mode: API Key Missing",
                components: {
                    area: "Debug Area",
                    city: "Kathmandu",
                    state: "Bagmati"
                },
                serviceable: isServiceable,
                serviceability_details: {
                    distance_km: distance.toFixed(2),
                    max_radius_km: DELIVERY_RADIUS_KM
                }
            });
        }

        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&result_type=street_address|point_of_interest|premise|sublocality|locality`;

        const response = await axios.get(googleUrl);

        if (response.data.status !== 'OK') {
            throw new Error(`Google Maps API Error: ${response.data.status}`);
        }

        const result = response.data.results[0];

        // 3. Format Address Logic
        // Extract meaningful components
        let addressComponents = {
            area: '',
            street: '',
            landmark: '',
            city: '',
            state: '',
            pincode: ''
        };

        result.address_components.forEach(comp => {
            if (comp.types.includes('sublocality') || comp.types.includes('neighborhood')) {
                addressComponents.area = comp.long_name;
            }
            if (comp.types.includes('route') || comp.types.includes('street_address')) {
                addressComponents.street = comp.long_name;
            }
            if (comp.types.includes('point_of_interest') || comp.types.includes('establishment')) {
                addressComponents.landmark = comp.long_name;
            }
            if (comp.types.includes('locality')) {
                addressComponents.city = comp.long_name;
            }
            if (comp.types.includes('administrative_area_level_1')) {
                addressComponents.state = comp.long_name;
            }
            if (comp.types.includes('postal_code')) {
                addressComponents.pincode = comp.long_name;
            }
        });

        // "Tikathali, Near Bhagwati Temple..."
        // If we found a landmark from Places API (not just geocode), we'd use that. 
        // Geocode API 'point_of_interest' isn't always reliable for "Near X".
        // But let's construct a friendly string.

        const parts = [];
        if (addressComponents.area) parts.push(addressComponents.area);
        if (addressComponents.street) parts.push(addressComponents.street);
        if (addressComponents.landmark) parts.push(`Near ${addressComponents.landmark}`);
        if (addressComponents.city) parts.push(addressComponents.city);

        // Fallback if parts are empty (e.g. middle of nowhere)
        const friendlyAddress = parts.length > 1 ? parts.join(', ') : result.formatted_address;

        res.json({
            formatted_address: friendlyAddress,
            original_formatted_address: result.formatted_address,
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
