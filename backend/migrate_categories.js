
import mongoose from 'mongoose';
import Category from './models/category.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const LOCAL_URI = 'mongodb://127.0.0.1:27017/quick-commerce';
const uri = process.env.MONGO_URI || LOCAL_URI;

mongoose.connect(uri)
    .then(() => console.log("Connected to DB for Migration"))
    .catch(err => console.error(err));

// Copy of data from CategoryStructure.js
const CATEGORY_HIERARCHY = {
    "All": [{ name: "All", image: "https://img.icons8.com/fluency/48/shopping-basket-2.png" }],
    "Fresh Produce": [
        { name: "All", image: "/images/fresh-produce/fresh_produce.png" },
        { name: "Vegetables", image: "/images/fresh-produce/vegetables.jpg" },
        { name: "Fruits", image: "/images/fresh-produce/fruit.jpg" },
        { name: "Leafy", image: "/images/fresh-produce/leafy.jpg" },
        { name: "Seasonal", image: "/images/fresh-produce/seasonal.jpg" }
    ],
    "Dairy, Bread & Eggs": [
        { name: "All", image: "/images/dairy/all.png" }, // Dairy Mix
        { name: "Milk", image: "/images/dairy/milk.jpg" }, // Milk Bottle
        { name: "Bread", image: "/images/dairy/bread.jpg" }, // Bread
        { name: "Eggs", image: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=100&q=80" }, // Eggs
        { name: "Butter & Cheese", image: "/images/dairy/butter_cheese.jpg" }, // Cheese
        { name: "Curd & Yogurt", image: "/images/dairy/curd_yogurt.png" }, // Yogurt
        { name: "Paneer & Cream", image: "/images/dairy/paneer.jpg" }  // Paneer/Cheese
    ],
    "Atta, Rice, Oil & Dals": [
        { name: "All", image: "/assets/categories/staples.png" }, // Grains
        { name: "Atta & Flours", image: "/images/staples/atta.png" }, // Flour
        { name: "Rice", image: "/images/staples/rice.png" }, // Rice
        { name: "Dals & Pulses", image: "/images/staples/dal.png" }, // Lentils
        { name: "Edible Oils", image: "/images/staples/oil.png" }, // Oil
        { name: "Ghee & Vanaspati", image: "/images/staples/ghee.png" }  // Ghee/Butter
    ],
    "Bakery and Biscuits": [
        { name: "All", image: "/images/bakery/all.png" }, // Bakery
        { name: "Cookies & Biscuits", image: "/images/bakery/cookies.png" }, // Cookies
        { name: "Breads & Buns", image: "/images/bakery/breads.png" }, // Bread
        { name: "Cakes & Pastries", image: "/images/bakery/cakes.png" }, // Cake
        { name: "Rusks & Khari", image: "/images/bakery/rusk.png" } // Rusk (Bread fallback)
    ],
    "Snacks & Beverages": [
        { name: "All", image: "/assets/categories/snacks_beverages.jpg" }, // Snacks
        { name: "Chips & Namkeen", image: "/images/snacks/chips.png" }, // Chips
        { name: "Soft Drinks", image: "/images/snacks/soft_drinks.png" }, // Coke
        { name: "Juices", image: "/images/snacks/juices.png" }, // Juice
        { name: "Cold Coffee", image: "/images/snacks/cold_coffee.png" } // Tea Cup
    ],
    "Tea and coffee": [
        { name: "All", image: "/images/beverages/all.png" },
        { name: "Tea", image: "/images/beverages/tea.png" },
        { name: "Coffee", image: "/images/beverages/coffee.png" },
        { name: "Green Tea", image: "/images/beverages/green_tea.png" }
    ],
    "Organic and Dry Fruits": [
        { name: "All", image: "/images/organic/all.png" },
        { name: "Dry Fruits", image: "/images/organic/dry_fruits.png" },
        { name: "Nuts & Seeds", image: "/images/organic/nuts.png" },
        { name: "Dates", image: "/images/organic/dates.png" }
    ],
    "Breakfast and sauce": [
        { name: "All", image: "/images/breakfast/all.jpg" },
        { name: "Breakfast Cereals", image: "/images/breakfast/cereals.png" },
        { name: "Jams & Honey", image: "/images/breakfast/jams_honey.png" },
        { name: "Sauces & Spreads", image: "/images/breakfast/sauces.png" },
        { name: "Pickles & Chutneys", image: "/images/breakfast/pickles.png" }
    ],
    "Household & Personal Care": [
        { name: "All", image: "/images/household/cleaning.jpg" }, // Cleaning
        { name: "Detergents", image: "/images/household/detergents.png" },
        { name: "Cleaners", image: "/images/household/cleaners.png" },
        { name: "Oral Care", image: "/images/household/oral_care.png" },
        { name: "Bath & Body", image: "/images/household/bath_body.png" }
    ],
    "Baby Care": [
        { name: "All", image: "/images/baby_care/all.png" },
        { name: "Diapers & Wipes", image: "/images/baby_care/diapers.png" },
        { name: "Baby Food", image: "/images/baby_care/baby_food.png" },
        { name: "Baby Skin Care", image: "/images/baby_care/baby_skin_care.png" }
    ],
    "Beauty & Self-Care": [
        { name: "All", image: "/images/beauty/all.png" },
        { name: "Skin Care", image: "/images/beauty/skin_care.png" },
        { name: "Hair Care", image: "/images/beauty/hair_care.png" },
        { name: "Makeup", image: "/images/beauty/makeup.png" },
        { name: "Fragrances", image: "/images/beauty/fragrances.png" },
        { name: "Men's Grooming", image: "/images/beauty/mens_grooming.png" }
    ],
    "Liquors": [
        { name: "All", image: "/images/liquor/all.png" },
        { name: "Beer", image: "/images/liquor/beer.png" },
        { name: "Wine", image: "/images/liquor/wine.png" },
        { name: "Vodka", image: "/images/liquor/vodka.png" },
        { name: "Rum", image: "/images/liquor/rum.png" },
        { name: "Whiskey", image: "/images/liquor/whiskey.png" },
        { name: "Tequila", image: "/images/liquor/tequila.png" },
        { name: "Brandy", image: "/images/liquor/brandy.png" }
    ],
    "Cooking Oil, Masala and more": [
        { name: "All", image: "/images/cooking/all.png" },
        { name: "Cooking Oil", image: "/images/cooking/cooking_oil.png" },
        { name: "Masala", image: "/images/cooking/masala.png" },
        { name: "Cooking Pastes", image: "/images/cooking/cooking_pastes.png" },
        { name: "Salt & Sugar", image: "/images/cooking/salt_sugar.png" },
        { name: "Whole Spices", image: "/images/cooking/whole_spices.png" }
    ],
    "Chocolate and Ice Cream": [
        { name: "All", image: "/images/chocolate/all.jpg" },
        { name: "Chocolates", image: "/images/chocolate/chocolates.png" },
        { name: "Ice Creams", image: "/images/chocolate/ice_creams.png" },
        { name: "Dessert Mixes", image: "/images/chocolate/dessert_mixes.png" }
    ],
    "Birthday items": [
        { name: "All", image: "/images/birthday/birthday_logo_v2.png" }, // Birthday Cake
        { name: "Cakes", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=100&q=80" },
        { name: "Candles", image: "/images/birthday/candles.png" },
        { name: "Decorations", image: "/images/birthday/decorations.png" },
        { name: "Gifts", image: "/images/birthday/gifts.png" }
    ],
    "Water & Gas": [
        { name: "All", image: "/images/water_gas/all.png" },
        { name: "Water Cans", image: "/images/water_gas/water_can.png" },
        { name: "Gas Cylinders", image: "https://img.icons8.com/fluency/48/gas-bottle.png" } // Fallback to icon for Gas
    ]
};

async function migrate() {
    try {
        await Category.deleteMany({}); // Clear existing
        console.log("Cleared existing categories.");

        const mainCategories = Object.keys(CATEGORY_HIERARCHY).filter(k => k !== "All");

        let order = 1;
        for (const mainCat of mainCategories) {
            const items = CATEGORY_HIERARCHY[mainCat];
            // The first item (or item named 'All') usually has the main category image.
            const allItem = items.find(i => i.name === 'All') || items[0];
            const catImage = allItem ? allItem.image : '';

            // Subcategories are the rest (excluding name 'All' if we want strictly subs, but users might want 'All' logic preserved in frontend filter. 
            // For data model, 'All' is implicit as the Category itself, so subcategories are the specific ones. 
            // Let's filter out 'All' from subcategories list to avoid redundancy, 
            // OR keep it if the logic relies on it. 
            // Looking at frontend logic: subCategory dropdown filters out 'All'.
            // So we store only real subcategories.
            const subCats = items
                .filter(i => i.name !== 'All')
                .map(i => ({ name: i.name, image: i.image }));

            const category = new Category({
                name: mainCat,
                image: catImage,
                displayOrder: order++,
                isActive: true,
                subCategories: subCats
            });

            await category.save();
            console.log(`Migrated: ${mainCat}`);
        }
        console.log("Migration Complete!");
    } catch (error) {
        console.error("Migration Error:", error);
    } finally {
        mongoose.connection.close();
    }
}

migrate();
