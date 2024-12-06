import React from "react"

export type FilterBaseProps<T> = {
  disabled?: boolean
  label?: React.ReactNode
  value: T
  onChange: (value: T) => void
}
