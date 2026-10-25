import { useState } from 'react';

const API_URL = 'http://localhost:5000/api/projects';

function SubmitProject() {
    const [formData, setFormData] = useState({
        title: '',
        student_name: '',
        description: '',
        tags: '',
        github_url: '',
        demo_url: '',
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setMessage('');
        setError('');
        setLoading(true);

        const project = {
            ...formData,
            tags: formData.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean),
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(project),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Unable to submit project.'
                );
            }

            setMessage(data.message);

            setFormData({
                title: '',
                student_name: '',
                description: '',
                tags: '',
                github_url: '',
                demo_url: '',
            });
        } catch (err) {
            setError(err.message || 'Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-gray-900 shadow-xl">
            <h2 className="mb-2 text-2xl font-bold">
                Submit Your Project
            </h2>

            <p className="mb-6 text-gray-600">
                Share your work with the student community.
            </p>

            {message && (
                <p className="mb-4 rounded-lg bg-green-100 p-3 text-green-800">
                    {message}
                </p>
            )}

            {error && (
                <p className="mb-4 rounded-lg bg-red-100 p-3 text-red-800">
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Project title"
                    maxLength={200}
                    required
                    className="w-full rounded-lg border p-3"
                />

                <input
                    name="student_name"
                    value={formData.student_name}
                    onChange={handleChange}
                    placeholder="Student name"
                    maxLength={150}
                    required
                    className="w-full rounded-lg border p-3"
                />

                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your project"
                    required
                    rows={5}
                    className="w-full rounded-lg border p-3"
                />

                <input
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="Technologies (e.g. React, Python, AI)"
                    required
                    className="w-full rounded-lg border p-3"
                />

                <input
                    name="github_url"
                    type="url"
                    value={formData.github_url}
                    onChange={handleChange}
                    placeholder="GitHub repository URL"
                    required
                    className="w-full rounded-lg border p-3"
                />

                <input
                    name="demo_url"
                    type="url"
                    value={formData.demo_url}
                    onChange={handleChange}
                    placeholder="Live demo URL"
                    required
                    className="w-full rounded-lg border p-3"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'Submitting...' : 'Submit Project'}
                </button>
            </form>
        </section>
    );
}

export default SubmitProject;
