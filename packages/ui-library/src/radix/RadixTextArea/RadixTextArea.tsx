import { TextArea, type TextAreaProps } from "@radix-ui/themes";
import { joinClasses } from "../../components/shared";

export type RadixTextAreaProps = Omit<TextAreaProps, "color">;

export function RadixTextArea({ className, ...textAreaProps }: RadixTextAreaProps) {
  return (
    <TextArea
      className={joinClasses("radix-text-area", className)}
      {...textAreaProps}
    />
  );
}
