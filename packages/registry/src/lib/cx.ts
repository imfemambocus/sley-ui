import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/*
 * two utilities for one property are decided by the order in the generated
 * stylesheet, not by the order in the class attribute, so a plain join lets an
 * override fail with no message.
 */
export function cx(...classes: ClassValue[]) {
  return twMerge(clsx(classes))
}
