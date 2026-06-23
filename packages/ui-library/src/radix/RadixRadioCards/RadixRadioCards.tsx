import { RadioCards } from "@radix-ui/themes";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { joinClasses } from "../../components/shared";

type RadioCardsRootProps = ComponentPropsWithoutRef<typeof RadioCards.Root>;

export type RadixRadioCardOption = {
  disabled?: boolean;
  hint?: ReactNode;
  label: ReactNode;
  value: string;
};

export type RadixRadioCardsProps = Omit<RadioCardsRootProps, "children" | "color"> & {
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  "aria-required"?: true;
  className?: string;
  id: string;
  options: readonly RadixRadioCardOption[];
};

export function RadixRadioCards({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
  className,
  id,
  options,
  ...cardsProps
}: RadixRadioCardsProps) {
  return (
    <RadioCards.Root
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      aria-required={ariaRequired}
      className={joinClasses("radix-radio-cards", className)}
      id={id}
      {...cardsProps}
    >
      {options.map((option) => (
        <RadioCards.Item
          aria-label={typeof option.label === "string" ? option.label : undefined}
          disabled={option.disabled}
          key={option.value}
          value={option.value}
        >
          <span className="radix-radio-card-label">{option.label}</span>
          {option.hint ? <small className="radix-radio-card-hint">{option.hint}</small> : null}
        </RadioCards.Item>
      ))}
    </RadioCards.Root>
  );
}
