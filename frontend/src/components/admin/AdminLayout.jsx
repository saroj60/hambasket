import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children, activeTab, setActiveTab }) => {
    const { logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile toggle
    const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            logout();
        }
    };

    return (
        <div className="fixed inset-0 flex bg-gray-50 overflow-hidden font-sans z-50">
            {/* Sidebar */}
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogout}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">

                {/* Mobile Header */}
                <header className="bg-white border-b border-gray-100 p-4 lg:hidden flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 rounded-lg hover:bg-gray-50 text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-lg font-bold text-gray-800">
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </h1>
                    </div>
                </header>

                {/* Content Scrollable Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
