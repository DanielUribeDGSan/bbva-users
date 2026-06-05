import React, { useState, useEffect } from 'react';
import { Filter, MoreHorizontal, Loader } from 'lucide-react';
import { fetchUsers } from '../services/api';
import type { User } from '../services/api';

export default function UsersTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [offset, setOffset] = useState(0);
    const limit = 10;

    const loadUsers = async () => {
        setLoading(true);
        const res = await fetchUsers({
            limit,
            offset,
            search: search || undefined
        });
        setUsers(res.data || []);
        setTotal(res.total || 0);
        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
    }, [offset]);

    // Handle search with simple debounce
    useEffect(() => {
        const timeout = setTimeout(() => {
            setOffset(0); // Reset to first page on new search
            loadUsers();
        }, 500);
        return () => clearTimeout(timeout);
    }, [search]);

    const handleNext = () => {
        if (offset + limit < total) {
            setOffset(offset + limit);
        }
    };

    const handlePrev = () => {
        if (offset - limit >= 0) {
            setOffset(offset - limit);
        }
    };

    return (
        <div className="table-container">
            <div className="table-header">
                <h2 className="table-title">Transaction History <span style={{fontSize: 14, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8}}>Users Directory</span></h2>
                <div className="table-actions">
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Search user email or phone..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="icon-btn" style={{ background: '#f5f5f5', boxShadow: 'none' }}>
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Loader className="spinner" size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <p>Loading users...</p>
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </div>
            ) : (
                <>
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>User Info</th>
                                    <th>Phone / Contact</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? users.map((user, i) => (
                                    <tr key={user.id || i}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ 
                                                    width: 40, height: 40, borderRadius: '50%', 
                                                    background: 'var(--bg-gradient-start)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 600, color: 'var(--text-main)'
                                                }}>
                                                    {(user.name || user.email || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{user.name || 'Unknown Name'}</div>
                                                    <div className="text-xs text-muted">{user.email || 'No Email'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{user.phone || 'N/A'}</td>
                                        <td>
                                            <span className={`status-badge ${user.status === 'active' ? 'status-active' : ''}`} style={user.status !== 'active' ? { background: '#f0f0f0', color: '#666' } : {}}>
                                                {user.status || 'Registered'}
                                            </span>
                                        </td>
                                        <td className="text-muted">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                                        <td>
                                            <button className="icon-btn" style={{ width: 32, height: 32, background: 'transparent', boxShadow: 'none' }}>
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        <div className="text-sm text-muted">
                            Showing {total === 0 ? 0 : offset + 1} to {Math.min(offset + limit, total)} of {total} users
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                                className="pagination-btn" 
                                onClick={handlePrev} 
                                disabled={offset === 0}
                            >
                                Previous
                            </button>
                            <button 
                                className="pagination-btn" 
                                onClick={handleNext} 
                                disabled={offset + limit >= total}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
