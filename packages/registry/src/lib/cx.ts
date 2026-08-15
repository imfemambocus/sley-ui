import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/*
 * the stylesheet order decides between two utilities for one property, so a plain
 * join lets an override fail with no message.
 */
export function cx(...classes: ClassValue[]) {
  return twMerge(clsx(classes))
}
