import express from "express";
const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => res.send("Simple Server is working!"));

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Simple Server running on ${PORT}`);
});
