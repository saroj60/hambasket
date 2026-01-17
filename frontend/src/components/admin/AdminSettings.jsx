import React from 'react';

const AdminSettings = () => {
    return (
        <div className="space-y-8 animate-fade-in max-w-2xl mx-auto text-center mt-20">
            <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-500">General settings configuration will appear here.</p>
                <p className="text-sm text-gray-400 mt-2">Currently managed via individual tabs.</p>
            </div>
        </div>
    );
};

export default AdminSettings;
