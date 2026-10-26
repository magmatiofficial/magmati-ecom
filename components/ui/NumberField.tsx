'use client';

import React, { useEffect, useState } from 'react';

interface NumberFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'inputMode'> {
  value: number | undefined;
  /** Called with undefined when the field is cleared. */
  onValueChange: (value: number | undefined) => void;
  allowDecimal?: boolean;
  /** When true, a cleared field snaps back to the current value on blur (for settings that save instantly). */
  restoreOnBlur?: boolean;
}

const isBlank = (value: number | undefined) => value === undefined || Number.isNaN(value);
const toDraft = (value: number | undefined) => (isBlank(value) ? '' : String(value));

export function NumberField({
  value,
  onValueChange,
  allowDecimal = false,
  restoreOnBlur = false,
  onBlur,
  ...rest
}: NumberFieldProps) {
  const [draft, setDraft] = useState<string>(toDraft(value));

  // Re-sync only when the parent value changes from outside (e.g. another item is opened)
  useEffect(() => {
    setDraft((current) => {
      const currentIsBlank = current === '' || current === '.';
      if (currentIsBlank && isBlank(value)) return current;
      return !currentIsBlank && Number(current) === value ? current : toDraft(value);
    });
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const pattern = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
    if (!pattern.test(raw)) return;
    setDraft(raw);
    if (raw === '' || raw === '.') {
      onValueChange(undefined);
      return;
    }
    onValueChange(Number(raw));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const currentIsBlank = draft === '' || draft === '.';
    if (currentIsBlank) {
      setDraft(restoreOnBlur ? toDraft(value) : '');
    } else {
      setDraft(toDraft(value));
    }
    onBlur?.(e);
  };

  return (
    <input
      {...rest}
      type="text"
      inputMode={allowDecimal ? 'decimal' : 'numeric'}
      value={draft}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}
