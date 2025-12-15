'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage() {
    const { user } = useAuth();
    
    // Mock Data for the Admin View
    const users = [
        { id: 1, email: 'usuario1@example.com', plan: 'Premium (Trial)', status: 'Active', joined: '2023-12-01' },
        { id: 2, email: 'usuario2@example.com', plan: 'Free', status: 'Active', joined: '2023-12-05' },
        { id: 3, email: 'usuario3@example.com', plan: 'Premium', status: 'Active', joined: '2023-12-10' },
        { id: 4, email: 'usuario4@example.com', plan: 'Free', status: 'Inactive', joined: '2023-12-12' },
        { id: 5, email: 'tú@email.com', plan: 'Admin', status: 'Active', joined: '2023-11-20' },
    ];

    if (!user) { // In real app, check for admin role
        return <div className="p-8 text-white">Acceso Denegado.</div>;
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Panel de Administración</h1>
                        <p className="text-gray-400">Visión general del sistema</p>
                    </div>
                    <div className="bg-green-900/30 border border-green-500/30 px-4 py-2 rounded-lg">
                        <span className="text-green-400 font-bold text-sm">Sistema Operativo</span>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-[#111] border border-white/10 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-2">Usuarios Totales</p>
                        <p className="text-3xl font-bold text-white">1,204</p>
                    </div>
                    <div className="bg-[#111] border border-white/10 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-2">Suscriptores Pro</p>
                        <p className="text-3xl font-bold text-purple-400">142</p>
                    </div>
                    <div className="bg-[#111] border border-white/10 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-2">Ingresos (Mes)</p>
                        <p className="text-3xl font-bold text-green-400">$710</p>
                    </div>
                    <div className="bg-[#111] border border-white/10 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-2">Tasa de Conversión</p>
                        <p className="text-3xl font-bold text-blue-400">11.8%</p>
                    </div>
                </div>

                {/* User Table */}
                <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="font-bold text-lg">Usuarios Recientes</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                                <tr>
                                    <th className="p-4">Usuario</th>
                                    <th className="p-4">Plan</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4">Fecha Registro</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-medium text-white">{u.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold 
                                                ${u.plan.includes('Premium') ? 'bg-purple-500/20 text-purple-300' : 
                                                  u.plan === 'Admin' ? 'bg-red-500/20 text-red-300' : 'bg-gray-700 text-gray-300'}`}>
                                                {u.plan}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`flex items-center gap-2 text-sm
                                                ${u.status === 'Active' ? 'text-green-400' : 'text-gray-500'}`}>
                                                <span className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">{u.joined}</td>
                                        <td className="p-4 text-right">
                                            <button className="text-gray-400 hover:text-white mx-1">Editar</button>
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
