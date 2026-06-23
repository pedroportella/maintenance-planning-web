import { AccessibleIcon } from "@radix-ui/themes";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  CaretDownIcon,
  CaretUpIcon,
  CheckCircledIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ReaderIcon,
  ReloadIcon
} from "@radix-ui/react-icons";
import { joinClasses } from "../../components/shared";

type RadixIconComponent = typeof CheckIcon;

const radixIconComponents = {
  arrowLeft: ArrowLeftIcon,
  arrowRight: ArrowRightIcon,
  calendar: CalendarIcon,
  caretDown: CaretDownIcon,
  caretUp: CaretUpIcon,
  check: CheckIcon,
  checkCircled: CheckCircledIcon,
  chevronDown: ChevronDownIcon,
  clock: ClockIcon,
  crossCircled: CrossCircledIcon,
  exclamationTriangle: ExclamationTriangleIcon,
  infoCircled: InfoCircledIcon,
  magnifyingGlass: MagnifyingGlassIcon,
  plus: PlusIcon,
  reader: ReaderIcon,
  reload: ReloadIcon
} satisfies Record<string, RadixIconComponent>;

export type RadixIconName = keyof typeof radixIconComponents;

export type RadixIconProps = {
  className?: string;
  name: RadixIconName;
  size?: number;
} & (
  | {
      decorative?: true;
      label?: never;
    }
  | {
      decorative?: false;
      label: string;
    }
);

export function RadixIcon({
  className,
  decorative,
  label,
  name,
  size = 16
}: RadixIconProps) {
  const isDecorative = decorative ?? !label;
  const IconComponent = radixIconComponents[name];
  const icon = (
    <IconComponent
      aria-hidden={isDecorative ? true : undefined}
      focusable="false"
      height={size}
      width={size}
    />
  );

  return (
    <span className={joinClasses("radix-icon", className)} data-icon={name}>
      {isDecorative || !label ? icon : <AccessibleIcon label={label}>{icon}</AccessibleIcon>}
    </span>
  );
}
