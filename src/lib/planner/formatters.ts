// Adapted from template-planner (Tremor formatters)

interface CurrencyParams {
  number: number
  maxFractionDigits?: number
  currency?: string
}

interface PercentageParams {
  number: number
  decimals?: number
}

interface MillionParams {
  number: number
  decimals?: number
}

type FormatterFunctions = {
  currency: (params: CurrencyParams) => string
  unit: (number: number) => string
  percentage: (params: PercentageParams) => string
  million: (params: MillionParams) => string
}

export const formatters: FormatterFunctions = {
  currency: ({
    number,
    maxFractionDigits = 2,
    currency = 'USD',
  }: CurrencyParams): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: maxFractionDigits,
    }).format(number)
  },

  unit: (number: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
    }).format(number)
  },

  percentage: ({ number, decimals = 1 }: PercentageParams): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number)
  },

  million: ({ number, decimals = 1 }: MillionParams): string => {
    return `${new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number)}M`
  },
}