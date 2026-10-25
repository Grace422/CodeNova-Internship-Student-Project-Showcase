import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:5000/api/projects';

function ProjectGallery() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Unable to load projects.'
          );
        }

        setProjects(data.projects || []);
      } catch (err) {
        setError(err.message || 'Unable to load projects.');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return (
    <section className="mx-auto mt-16 max-w-6xl">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold">
          Explore Projects
        </h2>

        <p className="mt-2 text-gray-400">
          Discover projects approved for the showcase.
        </p>
      </div>

      {loading && (
        <p className="text-center text-gray-300">
          Loading projects...
        </p>
      )}

      {error && (
        <p className="text-center text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="rounded-xl border border-gray-700 p-8 text-center">
          <p className="text-lg font-semibold">
            No projects published yet.
          </p>

          <p className="mt-2 text-gray-400">
            Approved student projects will appear here.
          </p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.id}
            className="flex flex-col rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold">
              {project.title}
            </h3>

            <p className="mt-1 text-sm text-gray-400">
              By {project.student_name}
            </p>

            <p className="mt-4 flex-1 whitespace-pre-wrap text-gray-300">
              {project.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-blue-950 px-3 py-1 text-sm text-blue-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-6 flex gap-4">
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                GitHub
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
          </article>
        ))}
      </div>
    </section>
  );
}

export default ProjectGallery;
