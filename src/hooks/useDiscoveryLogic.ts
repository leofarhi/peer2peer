import { useState, useRef } from 'react';
import type { UserProfile } from '../types';
import { BASE_URL } from './constants';

export const useDiscoveryLogic = (token: string | null) => {
    const [swipableUsers, setSwipableUsers] = useState<UserProfile[]>([]);
    const isLoadingRef = useRef(false);

    // Fonction pour charger un batch de users (remplit la file d'attente)
    const loadUsers = async () => {
        if (!token || isLoadingRef.current) return;
        isLoadingRef.current = true;

        try {
            const res = await fetch(`${BASE_URL}/api/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const newBatch = await res.json();
                console.log(`📦 Loaded batch of ${newBatch.length} users.`);
                
                // On ajoute les nouveaux à la suite, en évitant les doublons au cas où
                setSwipableUsers(prev => {
                    const existingIds = new Set(prev.map(u => u.id));
                    const filteredBatch = newBatch.filter((u: UserProfile) => !existingIds.has(u.id));
                    return [...prev, ...filteredBatch];
                });
            }
        } catch (e) {
            console.error("Erreur chargement users", e);
        } finally {
            isLoadingRef.current = false;
        }
    };

    // Envoyer un swipe et gérer la file d'attente localement
    const sendSwipe = async (targetId: string, action: 'LIKE' | 'PASS') => {
        if (!token) return { success: false };

        // 1. Suppression optimiste immédiate de la liste
        setSwipableUsers(prev => {
            const newList = prev.filter(u => u.id !== targetId);
            
            // Si la file devient petite (moins de 3), on recharge en background
            if (newList.length < 3) {
                loadUsers();
            }
            return newList;
        });

        // 2. Appel API
        try {
            const res = await fetch(`${BASE_URL}/api/swipe`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ targetId, action })
            });
            return await res.json();
        } catch (e) {
            console.error("Erreur swipe", e);
            // Note: En cas d'erreur critique, on pourrait remettre l'user, 
            // mais pour l'instant on laisse couler pour fluidité.
            return { success: false };
        }
    };

    return { swipableUsers, loadUsers, sendSwipe, setSwipableUsers };
};