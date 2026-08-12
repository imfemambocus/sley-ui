export type RunStatus = 'complete' | 'running' | 'queued' | 'failed'

export interface Run {
  readonly id: string
  readonly sample: string
  readonly assay: string
  readonly status: RunStatus
  readonly reads: number
  readonly q30: number
  readonly coverage: number
  readonly started: string
  readonly duration: string
  readonly owner: string
}

export const ASSAYS = ['WGS', 'RNA-seq', 'ATAC-seq', 'Exome', 'Methyl', 'scRNA'] as const

export const STATUSES: readonly RunStatus[] = ['complete', 'running', 'queued', 'failed']

export const runs: readonly Run[] = [
  { id: 'R-4821', sample: 'LCS-0912-A', assay: 'WGS', status: 'complete', reads: 412.8, q30: 94.2, coverage: 38.1, started: '12 Aug 04:12', duration: '6h 41m', owner: 'A. Reuter' },
  { id: 'R-4820', sample: 'LCS-0912-B', assay: 'WGS', status: 'complete', reads: 398.4, q30: 93.8, coverage: 36.7, started: '12 Aug 04:12', duration: '6h 52m', owner: 'A. Reuter' },
  { id: 'R-4819', sample: 'LCS-0911-C', assay: 'RNA-seq', status: 'running', reads: 61.2, q30: 91.4, coverage: 0, started: '12 Aug 09:30', duration: '2h 06m', owner: 'M. Haas' },
  { id: 'R-4818', sample: 'LCS-0908-A', assay: 'ATAC-seq', status: 'failed', reads: 8.1, q30: 62.7, coverage: 0, started: '12 Aug 02:44', duration: '0h 19m', owner: 'M. Haas' },
  { id: 'R-4817', sample: 'LCS-0907-D', assay: 'Exome', status: 'complete', reads: 104.6, q30: 95.1, coverage: 118.4, started: '11 Aug 21:05', duration: '3h 12m', owner: 'S. Weiler' },
  { id: 'R-4816', sample: 'LCS-0907-C', assay: 'Exome', status: 'complete', reads: 99.3, q30: 94.7, coverage: 112.9, started: '11 Aug 21:05', duration: '3h 08m', owner: 'S. Weiler' },
  { id: 'R-4815', sample: 'LCS-0904-A', assay: 'Methyl', status: 'complete', reads: 287.1, q30: 92.3, coverage: 24.6, started: '11 Aug 16:40', duration: '9h 27m', owner: 'K. Lentz' },
  { id: 'R-4814', sample: 'LCS-0903-B', assay: 'scRNA', status: 'queued', reads: 0, q30: 0, coverage: 0, started: '12 Aug 11:02', duration: '0h 00m', owner: 'D. Ferreira' },
  { id: 'R-4813', sample: 'LCS-0903-A', assay: 'scRNA', status: 'queued', reads: 0, q30: 0, coverage: 0, started: '12 Aug 11:02', duration: '0h 00m', owner: 'D. Ferreira' },
  { id: 'R-4812', sample: 'LCS-0901-E', assay: 'RNA-seq', status: 'complete', reads: 74.9, q30: 96.0, coverage: 0, started: '11 Aug 08:18', duration: '2h 41m', owner: 'M. Haas' },
  { id: 'R-4811', sample: 'LCS-0901-D', assay: 'RNA-seq', status: 'complete', reads: 71.2, q30: 95.6, coverage: 0, started: '11 Aug 08:18', duration: '2h 38m', owner: 'M. Haas' },
  { id: 'R-4810', sample: 'LCS-0899-A', assay: 'WGS', status: 'failed', reads: 22.4, q30: 71.1, coverage: 2.1, started: '10 Aug 23:55', duration: '1h 04m', owner: 'A. Reuter' },
  { id: 'R-4809', sample: 'LCS-0898-B', assay: 'ATAC-seq', status: 'complete', reads: 142.7, q30: 93.1, coverage: 0, started: '10 Aug 19:22', duration: '4h 15m', owner: 'K. Lentz' },
  { id: 'R-4808', sample: 'LCS-0898-A', assay: 'ATAC-seq', status: 'complete', reads: 138.9, q30: 92.8, coverage: 0, started: '10 Aug 19:22', duration: '4h 22m', owner: 'K. Lentz' },
  { id: 'R-4807', sample: 'LCS-0894-C', assay: 'Exome', status: 'complete', reads: 96.5, q30: 94.9, coverage: 109.2, started: '10 Aug 14:07', duration: '2h 58m', owner: 'S. Weiler' },
  { id: 'R-4806', sample: 'LCS-0892-A', assay: 'Methyl', status: 'running', reads: 121.4, q30: 90.7, coverage: 11.2, started: '12 Aug 07:45', duration: '3h 51m', owner: 'D. Ferreira' },
  { id: 'R-4805', sample: 'LCS-0890-B', assay: 'WGS', status: 'complete', reads: 421.0, q30: 94.6, coverage: 39.8, started: '09 Aug 22:30', duration: '7h 02m', owner: 'A. Reuter' },
  { id: 'R-4804', sample: 'LCS-0890-A', assay: 'WGS', status: 'complete', reads: 405.3, q30: 94.1, coverage: 37.4, started: '09 Aug 22:30', duration: '6h 58m', owner: 'A. Reuter' },
  { id: 'R-4803', sample: 'LCS-0887-D', assay: 'scRNA', status: 'complete', reads: 58.6, q30: 89.9, coverage: 0, started: '09 Aug 15:11', duration: '5h 33m', owner: 'D. Ferreira' },
  { id: 'R-4802', sample: 'LCS-0885-A', assay: 'RNA-seq', status: 'failed', reads: 3.2, q30: 55.4, coverage: 0, started: '09 Aug 11:48', duration: '0h 11m', owner: 'M. Haas' },
  { id: 'R-4801', sample: 'LCS-0884-C', assay: 'Exome', status: 'complete', reads: 101.8, q30: 95.4, coverage: 115.6, started: '08 Aug 20:26', duration: '3h 04m', owner: 'S. Weiler' },
  { id: 'R-4800', sample: 'LCS-0882-B', assay: 'Methyl', status: 'complete', reads: 264.9, q30: 91.8, coverage: 22.9, started: '08 Aug 12:03', duration: '8h 49m', owner: 'K. Lentz' },
  { id: 'R-4799', sample: 'LCS-0881-A', assay: 'ATAC-seq', status: 'complete', reads: 147.2, q30: 93.5, coverage: 0, started: '08 Aug 06:37', duration: '4h 08m', owner: 'K. Lentz' },
  { id: 'R-4798', sample: 'LCS-0879-E', assay: 'WGS', status: 'complete', reads: 388.7, q30: 93.2, coverage: 35.9, started: '07 Aug 23:14', duration: '7h 16m', owner: 'A. Reuter' },
]
