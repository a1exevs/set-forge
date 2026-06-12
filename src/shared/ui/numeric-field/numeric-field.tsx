import { Description, Field, Input, Label } from '@headlessui/react';
import { ChangeEvent, FC, FocusEvent } from 'react';

import classes from 'src/shared/ui/numeric-field/numeric-field.module.scss';

type Props = {
  label: string;
  id?: string;
  disabled?: boolean;
  error?: string;
  inputMode: 'decimal' | 'numeric';
  inputValue: string;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onInputFocus: (e: FocusEvent<HTMLInputElement>) => void;
  size?: 'md' | 'sm';
};

const NumericFieldView: FC<Props> = ({
  label,
  id,
  disabled = false,
  error,
  inputMode,
  inputValue,
  onInputChange,
  onInputFocus,
  size = 'md',
}) => {
  const sizeClass = size === 'sm' ? classes.inputSm : classes.inputMd;
  const inputClassName = `${classes.input} ${sizeClass} ${error ? classes.inputInvalid : ''}`;

  return (
    <Field disabled={disabled} className={classes.field}>
      <Label className={classes.label} htmlFor={id}>
        {label}
      </Label>
      <Input
        id={id}
        type="text"
        inputMode={inputMode}
        value={inputValue}
        onChange={onInputChange}
        onFocus={onInputFocus}
        disabled={disabled}
        invalid={Boolean(error)}
        className={inputClassName}
      />
      {error ? <Description className={classes.error}>{error}</Description> : null}
    </Field>
  );
};

export default NumericFieldView;
