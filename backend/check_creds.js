import mongoose from 'mongoose';

const passwords = [
    "admin123",            // Common choice
    "cUcP6UrHvx445H2N",    // The auto-generated one you sent
    "nepal12345",          // The one I suggested
    "ssaarroojj"           // The old one
];

const cluster = "cluster0.1mu6sfw.mongodb.net";
const username = "admin";

console.log(`\n🔍 Checking passwords on Cluster: ${cluster} ...\n`);

async function testPassword(password) {
    const uri = `mongodb+srv://${username}:${password}@${cluster}/?appName=Cluster0`;
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
        console.log(`✅ MATCH FOUND! The password is: ${password}`);
        console.log("---------------------------------------------------");
        console.log("YOUR CORRECT RENDER LINK IS:");
        console.log(uri);
        console.log("---------------------------------------------------");
        process.exit(0);
    } catch (err) {
        process.stdout.write(`❌ '${password}' failed... `);
        // Ensure we disconnect such that we can try the next one if needed, 
        // although connection failure usually doesn't leave an open handle in the same way.
    }
}

async function run() {
    for (const p of passwords) {
        await testPassword(p);
    }
    console.log("\n\n❌ ALL PASSWORDS FAILED.");
    console.log("Please Go to Atlas and set the password to 'nepal12345' again.");
    process.exit(1);
}

run();
