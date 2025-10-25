import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Not Found Page 🔍</h1>
      <Link to="/">
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Go Home
        </button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
