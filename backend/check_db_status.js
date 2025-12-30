
import mongoose from 'mongoose';

const LOCAL_URI = 'mongodb://127.0.0.1:27017/quick-commerce';

mongoose.connect(LOCAL_URI)
    .then(async () => {
        console.log("Connected to DB");
        const count = await mongoose.connection.db.collection('products').countDocuments();
        console.log(`Total Products: ${count}`);
        const products = await mongoose.connection.db.collection('products').find({}).limit(3).toArray();
        console.log("Sample Products:", products.map(p => p.name));
        process.exit();
    })
    .catch(err => {
        console.error("DB Error:", err);
        process.exit(1);
    });
