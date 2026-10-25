import SubmitProject from './SubmitProject';
import ProjectGallery from './ProjectGallery';

function App() {
  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12 text-white">
      <header className="mx-auto mb-10 max-w-4xl text-center">
        <h1 className="mb-3 text-4xl font-bold md:text-5xl">
          Student Project Showcase
        </h1>

        <p className="text-lg text-gray-400">
          Discover. Build. Showcase.
        </p>

        <p className="mt-3 text-gray-300">
          Share your projects and inspire other students.
        </p>
      </header>

      <main className="mx-auto max-w-7xl space-y-16">
        <ProjectGallery />
        <SubmitProject />
      </main>

      <footer className="mt-16 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
        Student Project Showcase — Built for student innovation.
      </footer>
    </div>
  );
}

export default App;
