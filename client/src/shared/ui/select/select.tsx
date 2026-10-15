import { Label, Listbox } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { FC, ReactNode } from 'react';

import classes from './select.module.scss';

export type SelectOption = {
  value: string;
  label: string;
  /** The language of the label when it differs from the page's, so a screen reader pronounces it right. */
  lang?: string;
};

type Props = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Read by screen readers before the selected value; not shown. */
  ariaLabel?: string;
  /** `field` fills its form row; `compact` is a borderless trigger whose list opens where it fits. */
  appearance?: 'field' | 'compact';
  /** Shown before the selected label. */
  icon?: ReactNode;
  className?: string;
};

const Select: FC<Props> = ({
  value,
  options,
  onChange,
  disabled = false,
  ariaLabel,
  appearance = 'field',
  icon,
  className,
}) => {
  const selected = options.find((option: SelectOption) => option.value === value);
  const compact = appearance === 'compact';

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className={className ? `${classes.listboxWrapper} ${className}` : classes.listboxWrapper}>
        {ariaLabel && <Label className={classes.hiddenLabel}>{ariaLabel}</Label>}
        <Listbox.Button className={compact ? classes.compactButton : classes.listboxButton}>
          {icon}
          <span className={classes.buttonLabel} lang={selected?.lang}>
            {selected?.label ?? value}
          </span>
          <ChevronDown className={classes.chevron} size={compact ? 14 : 18} strokeWidth={1.75} aria-hidden />
        </Listbox.Button>
        <Listbox.Options
          anchor={compact ? { to: 'bottom end', gap: 4 } : undefined}
          className={compact ? `${classes.listboxOptions} ${classes.compactOptions}` : classes.listboxOptions}
        >
          {options.map((option: SelectOption) => (
            <Listbox.Option key={option.value} value={option.value} className={classes.listboxOption}>
              {({ active, selected }) => (
                <span
                  className={`${classes.optionText} ${active ? classes.active : ''} ${selected ? classes.selected : ''}`}
                  lang={option.lang}
                >
                  {option.label}
                </span>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};

export default Select;
