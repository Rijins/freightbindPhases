import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Input from "./Input";

/**
 * Password field with an in-field show/hide toggle. Reuses the shared Input
 * surface so focus rings, themes and validation stay consistent.
 */
const PasswordInput = ({ label, name, className = "", ...rest }) => {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      label={label}
      name={name}
      type={visible ? "text" : "password"}
      className={className}
      trailing={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="flex items-center text-slate-400 transition-colors hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          {visible ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      }
      {...rest}
    />
  );
};

export default PasswordInput;