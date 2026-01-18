import React from 'react';

const AdminSidebar = ({ activeTab, setActiveTab, onLogout, isCollapsed, setIsCollapsed }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'products', label: 'Products', icon: '📦' },
        { id: 'orders', label: 'Orders', icon: '🛍️' },
    ];

    return (
        <div
            className={`
                relative h-full bg-[#111827] border-r border-gray-800 
                transition-all duration-300 ease-in-out flex flex-col z-10 text-white
                ${isCollapsed ? 'w-20' : 'w-64'}
            `}
        >
            {/* Logo Area */}
            <div className={`p-6 border-b border-gray-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed ? (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <span className="text-xl">🛡️</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold tracking-tight text-white leading-tight">Admin</h2>
                            <p className="text-xs text-gray-400 font-medium">Control Panel</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <span className="text-lg font-bold">A</span>
                    </div>
                )}

                {/* Desktop Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex absolute -right-3 top-8 bg-[#1f2937] border border-gray-700 p-1.5 rounded-full shadow-lg text-gray-400 hover:text-white hover:border-gray-500 transition-all z-50"
                >
                    {isCollapsed ? '▶' : '◀'}
                </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto py-6 space-y-2 px-3 custom-scrollbar">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2 opacity-80">
                    {!isCollapsed && 'Main Menu'}
                </div>
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        title={isCollapsed ? item.label : ''}
                        className={`
                            w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} 
                            py-3 rounded-xl transition-all duration-200 group relative font-medium border border-transparent
                            ${activeTab === item.id
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 border-white/10'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }
                        `}
                    >
                        <span className={`text-xl transition-transform duration-200 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                            {item.icon}
                        </span>

                        {!isCollapsed && (
                            <span className="tracking-wide text-sm">{item.label}</span>
                        )}

                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                            <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-800 border border-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl font-medium">
                                {item.label}
                            </div>
                        )}
                    </button>
                ))}
            </nav>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-gray-800 bg-[#0f1522]">
                <button
                    onClick={onLogout}
                    className={`
                        w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} 
                        py-3 text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all
                    `}
                >
                    <span>🚪</span>
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
