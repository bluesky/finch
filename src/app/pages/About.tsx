export default function About() {
  return (
    <div className="p-4 text-slate-100">
      <h1 className="text-2xl font-bold mb-4">About Finch</h1>
      <p className="mb-2">
        Finch is an open-source library of Bluesky enabled React components designed to facilitate the development of scientific web applications.
      </p>
      <p>Github <a className="text-blue-400 underline hover:cursor-pointer" href="https://github.com/bluesky/finch">here</a></p>
      <p>Interactive Storybook Documentation <a className="text-blue-400 underline hover:cursor-pointer" href="https://blueskyproject.io/finch">here</a></p>
    </div>
  );
}