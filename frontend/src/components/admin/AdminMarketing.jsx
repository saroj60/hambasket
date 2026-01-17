import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';

const AdminMarketing = () => {
    const { sendPromo } = useNotifications();
    const [promoMessage, setPromoMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSendPromo = async (e) => {
        e.preventDefault();
        if (!promoMessage.trim()) return;

        setSending(true);
        try {
            await sendPromo(promoMessage);
            setPromoMessage('');
            alert('Promo sent to all users!');
        } catch (error) {
            console.error("Failed to send promo", error);
            alert("Failed to send promo");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-2xl mx-auto mt-10">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Marketing & Promotions</h2>
                <p className="text-gray-500">Send push notifications to all your registered customers.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                        📣 Broadcast Message
                    </h3>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSendPromo}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
                        <textarea
                            value={promoMessage}
                            onChange={(e) => setPromoMessage(e.target.value)}
                            placeholder="e.g. 50% OFF on all fresh vegetables today! 🥦 Hurry up!"
                            className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none mb-4 text-base"
                            required
                        />
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Preview</h4>
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">A</div>
                                <div>
                                    <div className="font-bold text-sm text-gray-800">Aone Kirana</div>
                                    <div className="text-sm text-gray-600 line-clamp-2">
                                        {promoMessage || "Your message will appear here..."}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={sending || !promoMessage}
                            className="w-full btn btn-primary py-3 text-lg shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? 'Sending Broadcast...' : 'Send to All Users 🚀'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminMarketing;
