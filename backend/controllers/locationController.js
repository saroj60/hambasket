import axios from 'axios';
import * as turf from '@turf/turf';

// Default Delivery Zone (Polygon roughly covering 3km radius around store)
// Converted circular logic to a simple polygon for 'turf' demo, 
// or we can use turf.distance for radius check if polygon is too complex to hardcode right now.
// For now, let's stick to the 3km radius check using turf which is robust.
// Store Location: 27.666417, 85.354750
const STORE_LOCATION = [85.354750, 27.666417]; // Lng, Lat for Turf
const DELIVERY_RADIUS_KM = 5000;

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

        console.log(`[Location Debug] User: ${lat},${lng} | Store: ${STORE_LOCATION[1]},${STORE_LOCATION[0]} | Dist: ${distance.toFixed(3)}km | Max: ${DELIVERY_RADIUS_KM}km`);

        const isServiceable = distance <= DELIVERY_RADIUS_KM;

        let addressComponents = {
            landmark: '',
            area: '',
            street: '',
            city: '',
            state: '',
            pincode: ''
        };
        let friendlyAddress = "Selected Location";
        let originalFormatted = "Coordinates Location";

        try {
            // 2. Reverse Geocoding via Nominatim (OpenStreetMap) - Free & No Key
            const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

            const response = await axios.get(nominatimUrl, {
                headers: { 'User-Agent': 'HamBasketApp/1.0' },
                timeout: 5000 // Add timeout to prevent hanging
            });

            const result = response.data;
            const address = result.address || {};

            addressComponents = {
                landmark: address.amenity || address.shop || address.tourism || '',
                area: address.suburb || address.neighbourhood || address.residential || '',
                street: address.road || address.pedestrian || '',
                city: address.city || address.town || address.village || address.municipality || '',
                state: address.state || address.province || '',
                pincode: address.postcode || ''
            };

            const candidates = [
                addressComponents.landmark,
                addressComponents.area,
                addressComponents.street,
                addressComponents.city
            ];

            const uniqueParts = [...new Set(candidates.filter(c => c && c.trim() !== ''))];
            const displayParts = uniqueParts.slice(0, 2);

            friendlyAddress = result.display_name;
            if (displayParts.length > 0) {
                friendlyAddress = displayParts.join(', ');
            }
            originalFormatted = result.display_name;
        } catch (geocodeError) {
            console.warn("[Location Debug] Nominatim Geocode Failed:", geocodeError.message);
            // Fallback friendly address
            friendlyAddress = "Map Location (Address lookup failed)";
        }

        res.json({
            formatted_address: friendlyAddress,
            original_formatted_address: originalFormatted,
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
