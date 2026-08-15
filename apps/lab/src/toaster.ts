import { createToaster } from '@/components/ui/toast/Toast'

/* one store for the whole application, so a toast raised anywhere lands in one region */
export const toaster = createToaster({ placement: 'bottom-end', overlap: false, gap: 8 })
