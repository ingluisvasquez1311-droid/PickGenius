'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsers, UserProfile } from '@/lib/userService';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'admin') {
                router.push('/');
                return;
            }

            // Fetch data
            const fetchData = async () => {
                const data = await getAllUsers();
                setUsers(data);
                setIsLoadingData(false);
            };
            fetchData();
        }
    }, [user, loading, router]);


    if (loading || isLoadingData) {
        return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Cargando panel...</div>;
    }

    if (!user || user.role !== 'admin') {
        return null; // Will redirect
    }

    // Calculate Real KPIs
    const totalUsers = users.length;
    const premiumUsers = users.filter(u => u.isPremium).length;
    // Mock revenue for now (or calculate based on premium count * $5)
    const revenue = premiumUsers * 5;
    const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : '0';

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Panel de Administración</h1>
                        <p className="text-gray-400">Visión general del sistema</p>
                    </div>
                    <div className="bg-green-900/30 border border-green-500/30 px-4 py-2 rounded-lg">
                        <span className="text-green-400 font-bold text-sm">Sistema Activo</span>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-[#111] border border-white/10 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-2">Usuarios Totales</p>
                        <p className="text-3xl font-bold text-white">{totalUsers}</p>
                    </div>
                    <div className="bg-[#111] border border-white/10 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-2">Suscriptores Pro</p>
                        <p className="text-3xl font-bold text-purple-400">{premiumUsers}</p>
                    </div>
                    <div className="bg-[#111] border border-white/10 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-2">Ingresos (Est.)</p>
                        <p className="text-3xl font-bold text-green-400">${revenue}</p>
                    </div>
                    <div className="bg-[#111] border border-white/10 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-2">Tasa de Conversión</p>
                        <p className="text-3xl font-bold text-blue-400">{conversionRate}%</p>
                    </div>
                </div>

                {/* User Table */}
                <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="font-bold text-lg">Usuarios Registrados</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                                <tr>
                                    <th className="p-4">UID / Email</th>
                                    <th className="p-4">Rol</th>
                                    <th className="p-4">Plan</th>
                                    <th className="p-4">Fecha Registro</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map((u) => (
                                    <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-medium text-white">
                                            <div className="flex flex-col">
                                                <span>{u.email}</span>
                                                <span className="text-xs text-gray-600">{u.uid.substring(0, 8)}...</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold 
                                                ${u.role === 'admin' ? 'bg-red-500/20 text-red-300' : 'bg-gray-700 text-gray-300'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold 
                                                ${u.isPremium ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-800 text-gray-400'}`}>
                                                {u.isPremium ? 'Premium' : 'Free'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            {u.createdAt.toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-gray-400 hover:text-white mx-1 text-xs">Gestionar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
