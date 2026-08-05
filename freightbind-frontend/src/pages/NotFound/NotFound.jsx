import { Link } from "react-router-dom";
import { FiCompass } from "react-icons/fi";
import Button from "../../components/Button/Button";

const NotFound = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 px-6 text-center dark:bg-zinc-950">
      <span className="h-14 w-14 rounded-2xl bg-harbor-50 text-harbor-600 flex items-center justify-center mb-6 dark:bg-harbor-500/10 dark:text-harbor-400">
        <FiCompass size={26} />
      </span>
      <h1 className="font-display text-3xl font-semibold text-navy-900 dark:text-white">Page Not Found</h1>
      <p className="text-sm text-slate-500 mt-2 max-w-sm dark:text-zinc-400">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button variant="primary">Return to Dashboard</Button>
      </Link>
    </div>
  );
};

export default NotFound;
