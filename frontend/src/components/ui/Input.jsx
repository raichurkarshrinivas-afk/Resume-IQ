/**
 * Input component — text input with label, error state, icon support,
 * and accessible show/hide password toggle.
 */

import { useState } from 'react';

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  disabled = false,
  required = false,
  id,
  showPasswordToggle = false,
  style = {},
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const isPasswordField = type === 'password' || showPasswordToggle;
  const computedType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            letterSpacing: '-0.01em',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-danger-500)', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: focused ? 'var(--color-primary-500)' : 'var(--text-tertiary)',
              transition: 'color var(--transition-fast)',
              display: 'flex',
              fontSize: '16px',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          type={computedType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: icon
              ? isPasswordField
                ? '10px 42px 10px 40px'
                : '10px 14px 10px 40px'
              : isPasswordField
              ? '10px 42px 10px 14px'
              : '10px 14px',
            fontSize: '14px',
            fontFamily: 'var(--font-sans)',
            color: 'var(--text-primary)',
            background: 'var(--bg-primary)',
            border: `0.5px solid ${error ? 'var(--color-danger-500)' : focused ? 'var(--color-primary-500)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            transition: 'all var(--transition-fast)',
            lineHeight: 1.5,
            opacity: disabled ? 0.5 : 1,
            ...style,
          }}
          {...props}
        />
        {isPasswordField && (
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: 'var(--text-secondary, #696A65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}
          >
            {showPassword ? (
              // Eye-off icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              // Eye icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <span style={{ fontSize: '12px', color: 'var(--color-danger-500)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
