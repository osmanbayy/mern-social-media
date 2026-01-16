import { useMemo } from "react";
import { LuCheck, LuX } from "react-icons/lu";
import { calculatePasswordStrength } from "../../utils/passwordStrength";

const PasswordStrengthIndicator = ({ password }) => {
  const passwordStrength = useMemo(() => {
    return calculatePasswordStrength(password);
  }, [password]);

  if (!password) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Strength Bar */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-base-content/70">
            Şifre Güçlülüğü
          </span>
          <span
            className={`text-xs font-semibold transition-colors duration-200 ${
              passwordStrength.strength === 1
                ? "text-red-500"
                : passwordStrength.strength === 2
                  ? "text-yellow-500"
                  : passwordStrength.strength === 3
                    ? "text-blue-500"
                    : "text-green-500"
            }`}
          >
            {passwordStrength.level}
          </span>
        </div>
        <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ease-out ${
              passwordStrength.strength === 1
                ? "bg-red-500"
                : passwordStrength.strength === 2
                  ? "bg-yellow-500"
                  : passwordStrength.strength === 3
                    ? "bg-blue-500"
                    : "bg-green-500"
            }`}
            style={{
              width: `${(passwordStrength.strength / 4) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Password Requirements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div
          className={`flex items-center gap-2 transition-all duration-200 ${
            passwordStrength.checks.length
              ? "text-green-500"
              : "text-base-content/50"
          }`}
        >
          {passwordStrength.checks.length ? (
            <LuCheck className="w-4 h-4 flex-shrink-0" />
          ) : (
            <LuX className="w-4 h-4 flex-shrink-0" />
          )}
          <span>En az 8 karakter</span>
        </div>
        <div
          className={`flex items-center gap-2 transition-all duration-200 ${
            passwordStrength.checks.lowercase
              ? "text-green-500"
              : "text-base-content/50"
          }`}
        >
          {passwordStrength.checks.lowercase ? (
            <LuCheck className="w-4 h-4 flex-shrink-0" />
          ) : (
            <LuX className="w-4 h-4 flex-shrink-0" />
          )}
          <span>Küçük harf</span>
        </div>
        <div
          className={`flex items-center gap-2 transition-all duration-200 ${
            passwordStrength.checks.uppercase
              ? "text-green-500"
              : "text-base-content/50"
          }`}
        >
          {passwordStrength.checks.uppercase ? (
            <LuCheck className="w-4 h-4 flex-shrink-0" />
          ) : (
            <LuX className="w-4 h-4 flex-shrink-0" />
          )}
          <span>Büyük harf</span>
        </div>
        <div
          className={`flex items-center gap-2 transition-all duration-200 ${
            passwordStrength.checks.number
              ? "text-green-500"
              : "text-base-content/50"
          }`}
        >
          {passwordStrength.checks.number ? (
            <LuCheck className="w-4 h-4 flex-shrink-0" />
          ) : (
            <LuX className="w-4 h-4 flex-shrink-0" />
          )}
          <span>Rakam</span>
        </div>
        <div
          className={`flex items-center gap-2 transition-all duration-200 sm:col-span-2 ${
            passwordStrength.checks.special
              ? "text-green-500"
              : "text-base-content/50"
          }`}
        >
          {passwordStrength.checks.special ? (
            <LuCheck className="w-4 h-4 flex-shrink-0" />
          ) : (
            <LuX className="w-4 h-4 flex-shrink-0" />
          )}
          <span>Özel karakter (!@#$%^&*)</span>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
