import React, { useEffect, useState } from 'react';
import { getSession } from '../services/authService';
import type { Report, ContactMessage, AdminUserView, UserProfile, Match } from '../types';
import { Icons, BASE_URL } from '../constants';
import ProfileDetail from '../components/ProfileDetail';

type AdminTab = 'DASHBOARD' | 'REPORTS' | 'CONTACTS' | 'USERS';

// Ajout de la prop onChat
const AdminDashboard = ({ onBack, onChat }: { onBack: () => void, onChat: (m: Match) => void }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('REPORTS');
    const [reports, setReports] = useState<Report[]>([]);
    const [contacts, setContacts] = useState<ContactMessage[]>([]);
    const [users, setUsers] = useState<AdminUserView[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [profileToView, setProfileToView] = useState<UserProfile | null>(null);
    
    const session = getSession();

    // --- FETCHERS (Identique) ---
    const fetchReports = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/admin/reports`, { headers: { 'Authorization': `Bearer ${session.token}` } });
            if (res.ok) setReports(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchContacts = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/admin/contacts`, { headers: { 'Authorization': `Bearer ${session.token}` } });
            if (res.ok) setContacts(await res.json());
        } catch (e) { console.error(e); }
    };

    const searchUsers = async (query: string) => {
        if (!query) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/admin/users?q=${query}`, { headers: { 'Authorization': `Bearer ${session.token}` } });
            if (res.ok) setUsers(await res.json());
        } catch (e) { console.error(e); }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchReports();
        fetchContacts();
    }, []);

    // --- ACTIONS ---
    const handleToggleBan = async (userId: string) => {
        if (!confirm("Changer le statut de bannissement de cet utilisateur ?")) return;
        try {
            const res = await fetch(`${BASE_URL}/api/admin/users/${userId}/toggle-ban`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session.token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: data.isBanned } : u));
                fetchReports(); 
                alert(data.isBanned ? "Utilisateur BANNI 🔨" : "Utilisateur DÉBANNI 😇");
            }
        } catch (e) { alert("Erreur action"); }
    };

    const handleApproveReport = async (reportId: string) => {
        // Message de confirmation adapté au contexte "Culpabilité"
        if (!confirm("Valider ce signalement comme légitime ? Il sera archivé et l'utilisateur considéré comme fautif.")) return;
        try {
            const res = await fetch(`${BASE_URL}/api/admin/reports/${reportId}/approve`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${session.token}` }
            });
            if (res.ok) {
                setReports(prev => prev.filter(r => r.id !== reportId));
            }
        } catch (e) { alert("Erreur approbation"); }
    };

    // --- NOUVELLE ACTION POUR SUPPRIMER (REJETER) ---
    const handleDeleteReport = async (reportId: string) => {
        if (!confirm("Rejeter ce signalement ? (Considéré comme faux positif)")) return;
        try {
            await fetch(`${BASE_URL}/api/admin/reports/${reportId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.token}` }
            });
            setReports(prev => prev.filter(r => r.id !== reportId));
        } catch (e) { alert("Erreur suppression rapport"); }
    };

    const handleProcessMessage = async (msgId: string) => {
        if (!confirm("Marquer ce message comme traité ?")) return;
        try {
            const res = await fetch(`${BASE_URL}/api/admin/contacts/${msgId}/process`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${session.token}` }
            });
            if (res.ok) setContacts(prev => prev.filter(c => c.id !== msgId));
        } catch (e) { alert("Erreur"); }
    };

    // --- NOUVEAU : START CHAT ---
    const handleStartChat = async (userId: string) => {
        try {
            const res = await fetch(`${BASE_URL}/api/admin/users/${userId}/chat`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session.token}` }
            });
            if (res.ok) {
                const matchData = await res.json();
                onChat(matchData); // On remonte le match au parent (App.tsx)
            } else {
                alert("Impossible de démarrer le chat");
            }
        } catch (e) { alert("Erreur réseau"); }
    };

    const SidebarItem = ({ tab, icon, label, count }: { tab: AdminTab, icon: any, label: string, count?: number }) => {
        const isActive = activeTab === tab;
        return (
            <button 
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${isActive ? 'bg-white text-pink-600 shadow-md' : 'text-white/80 hover:bg-white/10'}`}
            >
                <div className="w-6 h-6">{icon}</div>
                <span className="flex-1 text-left">{label}</span>
                {count !== undefined && count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-red-500 text-white' : 'bg-white text-red-500 font-extrabold'}`}>
                        {count}
                    </span>
                )}
            </button>
        );
    };

    return (
        <div className="h-screen w-screen bg-gray-100 flex overflow-hidden font-sans relative">
            {profileToView && (
                <ProfileDetail 
                    user={profileToView}
                    onClose={() => setProfileToView(null)}
                    lang="fr"
                    isMatchView={true}
                />
            )}

            <div className="w-64 fruit-gradient flex flex-col p-4 shadow-2xl z-20 shrink-0">
                <div className="flex items-center gap-3 px-2 mb-8 mt-2">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-500 shadow-lg">
                        <div className="w-6 h-6"><Icons.Shield /></div>
                    </div>
                    <div><h1 className="text-white font-extrabold text-lg leading-tight">Admin<br/>Panel</h1></div>
                </div>
                <div className="space-y-2 flex-1">
                    <SidebarItem tab="REPORTS" icon={<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>} label="Signalements" count={reports.length} />
                    <SidebarItem tab="CONTACTS" icon={<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>} label="Messages" count={contacts.length} />
                    <SidebarItem tab="USERS" icon={<Icons.User />} label="Utilisateurs" />
                </div>
                <button onClick={onBack} className="mt-auto flex items-center gap-2 text-white/70 hover:text-white px-4 py-2 text-sm font-bold transition-colors"><span>← Retour App</span></button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
                <div className="bg-white p-6 shadow-sm border-b border-gray-200">
                    <h2 className="text-3xl font-extrabold text-gray-800">
                        {activeTab === 'REPORTS' && 'Gestion des Signalements'}
                        {activeTab === 'CONTACTS' && 'Messages de Contact'}
                        {activeTab === 'USERS' && 'Base Utilisateurs'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Super Admin Session • {new Date().toLocaleDateString()}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-10">
                    
                    {/* --- REPORTS --- */}
                    {activeTab === 'REPORTS' && (
                        <div className="space-y-4 max-w-5xl mx-auto">
                            {reports.length === 0 ? (
                                <div className="text-center py-20 text-gray-400">Aucun signalement en attente. 🎉</div>
                            ) : reports.map(report => (
                                <div key={report.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start">
                                    <div className="flex items-center gap-4 min-w-[200px]">
                                        <img 
                                            src={report.reported.intraPhoto} 
                                            className="w-16 h-16 rounded-full object-cover border-4 border-red-50 cursor-pointer hover:opacity-80 transition-opacity" 
                                            onClick={() => {/* Optionnel: voir profil */}} 
                                        />
                                        <div>
                                            <p className="font-bold text-lg text-gray-900">{report.reported.name}</p>
                                            <p className="text-sm text-gray-500 font-mono">@{report.reported.login}</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-red-50 p-4 rounded-xl border border-red-100 w-full">
                                        <h4 className="text-red-800 font-bold mb-1 flex items-center gap-2">⚠️ Motif du signalement</h4>
                                        <p className="text-gray-800 italic">"{report.reason}"</p>
                                        <div className="mt-3 text-xs text-red-400 font-medium">
                                            Signalé le {new Date(report.createdAt).toLocaleDateString()} par {report.reporter.name} ({report.reporter.login})
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 min-w-[120px]">
                                        <button 
                                            onClick={() => handleDeleteReport(report.id)} 
                                            className="px-4 py-2 bg-gray-100 text-gray-500 font-bold rounded-lg hover:bg-gray-200 text-xs transition-colors"
                                        >
                                            🗑️ Supprimer
                                        </button>
                                        
                                        {/* MODIFICATION ICI : Bouton Rouge "Valider" */}
                                        <button 
                                            onClick={() => handleApproveReport(report.id)} 
                                            className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md text-xs transition-colors"
                                        >
                                            ⚖️ Valider
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- CONTACTS --- */}
                    {activeTab === 'CONTACTS' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                            {contacts.length === 0 ? <div className="col-span-full text-center py-20 text-gray-400">Aucun message non traité. 📬</div> : contacts.map(msg => (
                                <div key={msg.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {msg.user ? <img src={msg.user.intraPhoto} className="w-10 h-10 rounded-full bg-gray-200" /> : <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">?</div>}
                                            <div>
                                                <p className="font-bold text-gray-800">{msg.email}</p>
                                                {msg.user && <p className="text-xs text-blue-500 font-bold">Membre: {msg.user.login}</p>}
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm leading-relaxed whitespace-pre-wrap flex-1 border border-gray-100 mb-4">{msg.message}</div>
                                    <div className="mt-auto">
                                        <button onClick={() => handleProcessMessage(msg.id)} className="w-full py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 shadow-md transition-colors flex items-center justify-center gap-2"><span>✓</span> Marquer comme traité</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- USERS --- */}
                    {activeTab === 'USERS' && (
                        <div className="max-w-5xl mx-auto">
                            <div className="mb-8 flex gap-4">
                                <input type="text" placeholder="Rechercher par login, nom ou email..." className="flex-1 p-4 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-pink-500 outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchUsers(searchQuery)} />
                                <button onClick={() => searchUsers(searchQuery)} className="bg-gray-900 text-white px-8 rounded-xl font-bold hover:bg-black transition-colors">{isLoading ? '...' : 'Chercher'}</button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {users.map(user => (
                                    <div key={user.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 flex flex-col md:flex-row items-center gap-6 ${user.isBanned ? 'border-red-500 bg-red-50/50' : 'border-green-500'}`}>
                                        <div className="relative group cursor-pointer" onClick={() => setProfileToView(user)}>
                                            <img src={user.intraPhoto} className="w-20 h-20 rounded-full object-cover shadow-sm bg-gray-200 group-hover:opacity-80 transition-opacity" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-2xl drop-shadow-md">👁️</span></div>
                                        </div>
                                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                                            <div><p className="text-xs text-gray-400 uppercase font-bold">Identité</p><p className="font-bold text-gray-900">{user.name}</p><p className="text-sm text-gray-500">{user.intraLogin}</p></div>
                                            <div><p className="text-xs text-gray-400 uppercase font-bold">Stats</p><p className="text-sm font-medium">Visibilité: <span className="text-blue-600">{user.visibilityScore?.toFixed(2)}</span></p><p className="text-sm font-medium">Quota: {user.dailyQuota}</p></div>
                                            <div><p className="text-xs text-gray-400 uppercase font-bold">Activité</p><p className="text-sm text-gray-600">{new Date(user.lastActive).toLocaleDateString()}</p><p className="text-sm text-gray-600">Inscrit: {new Date(user.createdAt).toLocaleDateString()}</p></div>
                                            <div><p className="text-xs text-gray-400 uppercase font-bold">Casier</p><p className={`text-sm font-bold ${user._count.reportedBy > 0 ? 'text-red-500' : 'text-green-500'}`}>{user._count.reportedBy} Signalements</p></div>
                                        </div>
                                        
                                        {/* NOUVEAU : BOUTON MESSAGE ADMIN */}
                                        <div className="flex flex-col gap-2">
                                            <button onClick={() => handleStartChat(user.id)} className="px-6 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm shadow-md hover:bg-blue-600 transition-colors">
                                                Message
                                            </button>
                                            <button onClick={() => handleToggleBan(user.id)} className={`px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-transform active:scale-95 whitespace-nowrap ${user.isBanned ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                                                {user.isBanned ? "DÉBANNIR" : "BANNIR"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;