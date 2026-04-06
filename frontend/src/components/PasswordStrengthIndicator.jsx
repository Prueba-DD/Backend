import React, { useMemo } from 'react';
import './PasswordStrengthIndicator.css';

/**
 * PasswordStrengthIndicator Component
 * 
 * Evaluates and displays password strength in real-time.
 * 
 * @param {Object} props
 * @param {string} props.password - The password to evaluate
 * @param {boolean} [props.showRequirements=true] - Whether to show requirement checklist
 */
function PasswordStrengthIndicator({ password = '', showRequirements = true }) {
  // Calculate password strength
  const strength = useMemo(() => {
    let score = 0;
    const requirements = {
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    // Calculate score (0-5)
    if (requirements.minLength) score++;
    if (requirements.hasNumber) score++;
    if (requirements.hasUppercase) score++;
    if (requirements.hasLowercase) score++;
    if (requirements.hasSpecial) score++;

    // Determine strength level
    let level = 'weak';
    let label = 'Débil';
    let colorClass = 'strength-bar--weak';

    if (score >= 5) {
      level = 'strong';
      label = 'Fuerte';
      colorClass = 'strength-bar--strong';
    } else if (score >= 3) {
      level = 'medium';
      label = 'Media';
      colorClass = 'strength-bar--medium';
    }

    return {
      score,
      level,
      label,
      colorClass,
      requirements,
    };
  }, [password]);

  if (!password) return null;

  return (
    <div className="password-strength">
      <div className="password-strength__header">
        <span className="password-strength__label">Fortaleza de contraseña</span>
        <span className={`password-strength__value password-strength__value--${strength.level}`}>
          {strength.label}
        </span>
      </div>

      {/* Strength Bar */}
      <div className="strength-bar">
        <div
          className={`strength-bar__fill ${strength.colorClass}`}
          style={{ width: `${(strength.score / 5) * 100}%` }}
        />
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <ul className="password-requirements">
          <li className={`password-requirements__item ${strength.requirements.minLength ? 'password-requirements__item--met' : ''}`}>
            <span className="password-requirements__icon">
              {strength.requirements.minLength ? '✓' : '✗'}
            </span>
            Mínimo 8 caracteres
          </li>
          <li className={`password-requirements__item ${strength.requirements.hasNumber ? 'password-requirements__item--met' : ''}`}>
            <span className="password-requirements__icon">
              {strength.requirements.hasNumber ? '✓' : '✗'}
            </span>
            Al menos un número
          </li>
          <li className={`password-requirements__item ${strength.requirements.hasUppercase ? 'password-requirements__item--met' : ''}`}>
            <span className="password-requirements__icon">
              {strength.requirements.hasUppercase ? '✓' : '✗'}
            </span>
            Al menos una mayúscula
          </li>
          <li className={`password-requirements__item ${strength.requirements.hasLowercase ? 'password-requirements__item--met' : ''}`}>
            <span className="password-requirements__icon">
              {strength.requirements.hasLowercase ? '✓' : '✗'}
            </span>
            Al menos una minúscula
          </li>
          <li className={`password-requirements__item ${strength.requirements.hasSpecial ? 'password-requirements__item--met' : ''}`}>
            <span className="password-requirements__icon">
              {strength.requirements.hasSpecial ? '✓' : '✗'}
            </span>
            Al menos un carácter especial
          </li>
        </ul>
      )}
    </div>
  );
}

export default PasswordStrengthIndicator;
