import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { FiTruck } from "react-icons/fi";
import { loginUser, clearAuthError } from "../../features/auth/authSlice";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import useAuth from "../../hooks/useAuth";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  const onSubmit = async (values) => {
    const result = await dispatch(loginUser(values));
    if (loginUser.fulfilled.match(result)) {
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-navy-950">
      <div className="hidden lg:flex flex-col justify-between w-1/2 px-14 py-12 text-white bg-navy-900">
        <div className="flex items-center gap-2 font-display text-xl font-semibold">
          <FiTruck size={22} className="text-harbor-400" />
          FreightBind AI
        </div>
        <div>
          <h1 className="font-display text-4xl font-semibold leading-tight max-w-md">
            Coordinate every shipment from one command center.
          </h1>
          <p className="mt-4 text-slate-400 max-w-sm">
            Track status, dispatch carriers, and keep every stakeholder aligned in real time.
          </p>
        </div>
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} FreightBind AI</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-slate-50 dark:bg-zinc-950">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 font-display text-lg font-semibold text-navy-900 mb-8 dark:text-white">
            <FiTruck size={20} className="text-harbor-500 dark:text-harbor-400" />
            FreightBind AI
          </div>

          <h2 className="text-xl font-semibold text-navy-900 dark:text-white">Welcome back</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6 dark:text-zinc-400">Sign in to manage your shipments.</p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-signal-rust dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Email"
              name="email"
              type="email"
              required
              placeholder="you@company.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />
            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
