import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiActivity,
  FiArrowRight,
  FiCpu,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiPhone,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { registerUser, clearAuthError } from "../../features/auth/authSlice";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Alert from "../../components/Alert/Alert";
import AuthLayout from "../../components/auth/AuthLayout";
import PasswordStrength from "../../components/auth/PasswordStrength";
import useAuth from "../../hooks/useAuth";
import { fadeInUp, staggerContainer } from "../../animations";

// Mirrors backend validation (validations/authValidation.js + models/User.js):
// password >= 6 chars, phone optional. Confirm-password is frontend-only.
const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required"),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    phone: z.string().trim().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const REGISTER_BULLETS = [
  { icon: FiActivity, text: "Live status & timeline updates" },
  { icon: FiShield, text: "Secure, role-based access" },
  { icon: FiCpu, text: "AI insights across your network" },
];

const passwordToggle = (visible, onToggle) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={visible ? "Hide password" : "Show password"}
    aria-pressed={visible}
    className="flex items-center justify-center rounded-md p-0.5 text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-500 dark:text-zinc-500 dark:hover:text-slate-300"
  >
    {visible ? <FiEyeOff size={16} aria-hidden="true" /> : <FiEye size={16} aria-hidden="true" />}
  </button>
);

// Premium field treatment for the auth pages: smooth focus accent in brand
// teal, gentle hover border. Error fields keep the shared error styling.
const fieldClass = (hasError) =>
  hasError
    ? ""
    : "!transition-all duration-200 hover:border-slate-400 dark:hover:border-zinc-600 focus:!border-harbor-500 focus:!ring-harbor-500/30";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", phone: "" },
  });

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (values) => {
    const result = await dispatch(
      registerUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
      })
    );
    if (registerUser.fulfilled.match(result)) {
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <AuthLayout
      panelHeadline="One platform for your entire freight operation."
      panelStatement="Create your account and start coordinating shipments, carriers and hubs in real time."
      bullets={REGISTER_BULLETS}
      cardHeading="Create your account"
      cardSubheading="Start coordinating shipments in minutes."
    >
      {error && (
        <div className="mb-5">
          <Alert severity="error">{error}</Alert>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
        variants={staggerContainer(0.04, 0.15)}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeInUp}>
          <Input
            label="Full name"
            name="fullName"
            type="text"
            required
            autoComplete="name"
            placeholder="Jane Doe"
            icon={FiUser}
            error={errors.fullName?.message}
            success={Boolean(touchedFields.fullName) && !errors.fullName}
            className={fieldClass(errors.fullName)}
            {...register("fullName")}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Input
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            icon={FiMail}
            error={errors.email?.message}
            success={Boolean(touchedFields.email) && !errors.email}
            className={fieldClass(errors.email)}
            {...register("email")}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Input
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="At least 6 characters"
            icon={FiLock}
            trailing={passwordToggle(showPassword, () => setShowPassword((v) => !v))}
            error={errors.password?.message}
            className={fieldClass(errors.password)}
            {...register("password")}
          />
          <PasswordStrength password={watch("password") || ""} />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Input
            label="Confirm password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Repeat your password"
            icon={FiLock}
            trailing={passwordToggle(showConfirmPassword, () => setShowConfirmPassword((v) => !v))}
            error={errors.confirmPassword?.message}
            success={Boolean(touchedFields.confirmPassword) && !errors.confirmPassword}
            className={fieldClass(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Input
            label="Phone (optional)"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 000 0000"
            icon={FiPhone}
            error={errors.phone?.message}
            className={fieldClass(errors.phone)}
            {...register("phone")}
          />
        </motion.div>
        <motion.div variants={fadeInUp} className="pt-1">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="group mt-1 w-full !bg-harbor-600 !shadow-md hover:!bg-harbor-500 hover:!shadow-panelHover focus-visible:!ring-harbor-500 focus-visible:!ring-offset-white dark:focus-visible:!ring-offset-zinc-900"
          >
            Create account
            <FiArrowRight
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Button>
        </motion.div>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="rounded font-medium text-harbor-600 transition-colors hover:text-harbor-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-500 dark:text-harbor-400 dark:hover:text-harbor-300"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
