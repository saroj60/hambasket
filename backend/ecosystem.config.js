module.exports = {
    apps: [{
        name: "aone-kirana-backend",
        script: "./server.js",
        instances: "max", // Use all available CPU cores
        exec_mode: "cluster", // Enable clustering
        env: {
            NODE_ENV: "development",
        },
        env_production: {
            NODE_ENV: "production",
        },
        // Automatic Restart on memory leak
        max_memory_restart: "1G",
        // Delay between restarts if crash occurs
        restart_delay: 3000
    }]
};
