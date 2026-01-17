import React from 'react';

const AdminSidebar = ({ activeTab, setActiveTab, onLogout, isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'orders', label: 'Orders', icon: '🛍️' },
        { id: 'products', label: 'Products', icon: '📦' },
        { id: 'customers', label: 'Customers', icon: '👥' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <div
                className={`
                fixed lg:relative top-0 left-0 h-full bg-white border-r border-gray-100 shadow-xl lg:shadow-none z-30 lg:z-0
                transition-all duration-300 ease-in-out flex flex-col
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
                w-64
            `}
            >

                {/* Logo Area */}
                <div className={`p-6 border-b border-gray-50 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isCollapsed ? (
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                            <span className="text-primary text-3xl">🛡️</span> Admin
                        </h2>
                    ) : (
                        <span className="text-2xl font-black text-primary">A</span>
                    )}

                    {/* Mobile Close Button */}
                    <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
                        ✕
                    </button>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex absolute -right-3 top-8 bg-white border border-gray-100 p-1.5 rounded-full shadow-sm text-gray-400 hover:text-primary transition-colors hover:shadow-md z-50"
                    >
                        {isCollapsed ? '▶' : '◀'}
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-4 custom-scrollbar">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsOpen(false);
                            }}
                            title={isCollapsed ? item.label : ''}
                            className={`
                                w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-4'} 
                                py-3.5 rounded-xl transition-all duration-200 group relative font-medium
                                ${activeTab === item.id
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }
                            `}
                        >
                            <span className={`text-xl transition-transform duration-200 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                                {item.icon}
                            </span>

                            {!isCollapsed && (
                                <span className="truncate tracking-wide">{item.label}</span>
                            )}

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl font-medium">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-gray-50">
                    <button
                        onClick={onLogout}
                        title="Logout"
                        className={`
                            w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2 px-4'} 
                            py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors
                        `}
                    >
                        <span>🚪</span>
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;
