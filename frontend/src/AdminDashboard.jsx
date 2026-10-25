import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/projects`;

function AdminDashboard() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [message, setMessage] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const navigate = useNavigate();
    const token = sessionStorage.getItem('adminToken');
    const username = sessionStorage.getItem('adminUsername');

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem('adminToken');
                sessionStorage.removeItem('adminUsername');
                navigate('/admin', { replace: true });
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message || 'Unable to load submissions.'
                );
            }

            setProjects(data.projects || []);
        } catch (err) {
            setError(err.message || 'Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    }, [token, navigate]);

    useEffect(() => {
        if (!token) {
            navigate('/admin', { replace: true });
            return;
        }

        fetchProjects();
    }, [token, navigate, fetchProjects]);

    async function updateStatus(projectId, status) {
        setUpdatingId(projectId);
        setError('');
        setMessage('');

        try {
            const response = await fetch(
                `${API_URL}/${projectId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status }),
                }
            );

            const data = await response.json();

            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem('adminToken');
                sessionStorage.removeItem('adminUsername');
                navigate('/admin', { replace: true });
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message || 'Unable to update project status.'
                );
            }

            setMessage(data.message);
            await fetchProjects();
        } catch (err) {
            setError(err.message || 'Unable to update project status.');
        } finally {
            setUpdatingId(null);
        }
    }

    function handleLogout() {
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminUsername');
        navigate('/admin', { replace: true });
    }

    const pendingCount = projects.filter(
        (project) => project.status === 'pending'
    ).length;

    const approvedCount = projects.filter(
        (project) => project.status === 'approved'
    ).length;

    const rejectedCount = projects.filter(
        (project) => project.status === 'rejected'
    ).length;

    if (!token) {
        return null;
    }

    const filteredProjects = projects.filter((project) => {
        const searchText = search.trim().toLowerCase();

        const matchesSearch =
            project.title.toLowerCase().includes(searchText) ||
            project.student_name.toLowerCase().includes(searchText) ||
            project.description.toLowerCase().includes(searchText) ||
            project.tags.some((tag) =>
                tag.toLowerCase().includes(searchText)
            );

        const matchesStatus =
            statusFilter === 'all' ||
            project.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-gray-950 px-4 py-8 text-white md:px-8">
            <header className="mx-auto flex max-w-7xl flex-col justify-between gap-4 border-b border-gray-800 pb-6 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold">
                        Admin Dashboard
                    </h1>

                    <p className="mt-2 text-gray-400">
                        Welcome, {username || 'Administrator'}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={fetchProjects}
                        disabled={loading}
                        className="rounded-lg border border-gray-700 px-4 py-2 hover:bg-gray-800 disabled:opacity-60"
                    >
                        Refresh
                    </button>

                    <button
                        onClick={handleLogout}
                        className="rounded-lg bg-red-600 px-4 py-2 font-medium hover:bg-red-700"
                    >
                        Log Out
                    </button>
                </div>
            </header>

            <main className="mx-auto mt-8 max-w-7xl">
                <div className="mb-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                        <p className="text-gray-400">Pending</p>
                        <p className="mt-2 text-3xl font-bold text-yellow-400">
                            {pendingCount}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                        <p className="text-gray-400">Approved</p>
                        <p className="mt-2 text-3xl font-bold text-green-400">
                            {approvedCount}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                        <p className="text-gray-400">Rejected</p>
                        <p className="mt-2 text-3xl font-bold text-red-400">
                            {rejectedCount}
                        </p>
                    </div>
                </div>

                {message && (
                    <p className="mb-5 rounded-lg bg-green-950 p-4 text-green-300">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="mb-5 rounded-lg bg-red-950 p-4 text-red-300">
                        {error}
                    </p>
                )}


                <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <h2 className="text-2xl font-semibold">
                        Project Submissions
                    </h2>

                    <Link
                        to="/"
                        className="text-blue-400 hover:text-blue-300"
                    >
                        View Public Showcase
                    </Link>
                </div>

                <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <input
                        type="search"
                        placeholder="Search projects or students..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-white outline-none focus:border-blue-500 md:col-span-2"
                    />

                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-white outline-none focus:border-blue-500"
                    >
                        <option value="all">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>


                {loading ? (
                    <p className="py-10 text-center text-gray-400">
                        Loading submissions...
                    </p>
                ) : projects.length === 0 ? (
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-400">
                        No project submissions found.
                    </div>
                ) : (
                    <div className="grid gap-5 lg:grid-cols-2">
                        {filteredProjects.map((project) => (
                            <article
                                key={project.id}
                                className="rounded-xl border border-gray-800 bg-gray-900 p-6"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <h3 className="text-xl font-bold">
                                        {project.title}
                                    </h3>

                                    <span
                                        className={`rounded-full px-3 py-1 text-sm font-medium ${project.status === 'approved'
                                            ? 'bg-green-950 text-green-300'
                                            : project.status === 'rejected'
                                                ? 'bg-red-950 text-red-300'
                                                : 'bg-yellow-950 text-yellow-300'
                                            }`}
                                    >
                                        {project.status}
                                    </span>
                                </div>

                                <p className="mt-2 text-sm text-gray-400">
                                    Submitted by {project.student_name}
                                </p>

                                <p className="mt-4 whitespace-pre-wrap text-gray-300">
                                    {project.description}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {project.tags.map((tag, index) => (
                                        <span
                                            key={`${project.id}-${tag}-${index}`}
                                            className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-5 flex flex-wrap gap-4 text-sm">
                                    <a
                                        href={project.github_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300"
                                    >
                                        GitHub Repository
                                    </a>

                                    <a
                                        href={project.demo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300"
                                    >
                                        Live Demo
                                    </a>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-800 pt-5">
                                    <button
                                        onClick={() => updateStatus(project.id, 'approved')}
                                        disabled={
                                            updatingId !== null ||
                                            project.status === 'approved'
                                        }
                                        className="rounded-lg bg-green-700 px-4 py-2 font-medium hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {updatingId === project.id
                                            ? 'Updating...'
                                            : 'Approve'}
                                    </button>

                                    <button
                                        onClick={() => updateStatus(project.id, 'rejected')}
                                        disabled={
                                            updatingId !== null ||
                                            project.status === 'rejected'
                                        }
                                        className="rounded-lg bg-red-700 px-4 py-2 font-medium hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;
