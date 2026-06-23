import { RadioGroup } from "@radix-ui/themes";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { joinClasses } from "../../components/shared";

type RadioGroupRootProps = ComponentPropsWithoutRef<typeof RadioGroup.Root>;

export type RadixRadioGroupOption = {
  disabled?: boolean;
  hint?: ReactNode;
  label: ReactNode;
  value: string;
};

export type RadixRadioGroupProps = Omit<RadioGroupRootProps, "children" | "color"> & {
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  "aria-required"?: true;
  className?: string;
  id: string;
  options: readonly RadixRadioGroupOption[];
};

export function RadixRadioGroup({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
  className,
  id,
  options,
  ...groupProps
}: RadixRadioGroupProps) {
  return (
    <RadioGroup.Root
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      aria-required={ariaRequired}
      className={joinClasses("radix-radio-group", className)}
      id={id}
      {...groupProps}
    >
      {options.map((option) => {
        const optionId = `${id}-${toDomId(option.value)}`;
        const hintId = option.hint ? `${optionId}-hint` : undefined;

        return (
          <div className="radix-radio-group-option" key={option.value}>
            <RadioGroup.Item
              aria-describedby={hintId}
              disabled={option.disabled}
              id={optionId}
              value={option.value}
            />
            <label className="radix-radio-group-label" htmlFor={optionId}>
              <span>{option.label}</span>
              {option.hint ? (
                <small className="radix-radio-group-hint" id={hintId}>
                  {option.hint}
                </small>
              ) : null}
            </label>
          </div>
        );
      })}
    </RadioGroup.Root>
  );
}

function toDomId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-");
}
