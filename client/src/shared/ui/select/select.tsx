import { Listbox } from '@headlessui/react';
import { FC } from 'react';

import classes from './select.module.scss';

export type SelectOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
};

const Select: FC<Props> = ({ value, options, onChange }) => {
  const selectedLabel = options.find((option: SelectOption) => option.value === value)?.label ?? value;

  return (
    <Listbox value={value} onChange={onChange}>
      <div className={classes.listboxWrapper}>
        <Listbox.Button className={classes.listboxButton}>{selectedLabel}</Listbox.Button>
        <Listbox.Options className={classes.listboxOptions}>
          {options.map((option: SelectOption) => (
            <Listbox.Option key={option.value} value={option.value} className={classes.listboxOption}>
              {({ active, selected }) => (
                <span
                  className={`${classes.optionText} ${active ? classes.active : ''} ${selected ? classes.selected : ''}`}
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
