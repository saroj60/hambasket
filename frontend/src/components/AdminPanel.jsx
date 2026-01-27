import React, { useState, useEffect } from 'react';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders';
import AdminCustomers from './admin/AdminCustomers';
import AdminOccasions from './admin/AdminOccasions';
import AdminCategories from './admin/AdminCategories';
import AdminSettings from './admin/AdminSettings';

const AdminPanel = () => {
    // Determine initial tab from URL hash or default to 'dashboard'
    // Simple hash routing for basic persistence on refresh
    const getInitialTab = () => {
        const hash = window.location.hash.replace('#', '');
        return ['dashboard', 'products', 'orders', 'customers', 'occasions', 'settings'].includes(hash)
            ? hash
            : 'dashboard';
    };

    const [activeTab, setActiveTabState] = useState(getInitialTab);

    // Sync hash with state
    const setActiveTab = (tab) => {
        setActiveTabState(tab);
        window.location.hash = tab;
    };

    // Render active component
    const renderContent = () => {
        switch (activeTab) {
            case 'products': return <AdminProducts />;
            case 'categories': return <AdminCategories />;
            case 'orders': return <AdminOrders />;
            case 'customers': return <AdminCustomers />;
            case 'occasions': return <AdminOccasions />;
            case 'settings': return <AdminSettings />;
            case 'dashboard':
            default: return <AdminDashboard />;
        }
    };

    // Force scroll to top on tab change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeTab]);

    return (
        <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderContent()}
        </AdminLayout>
    );
};

export default AdminPanel;
