"use client"

import React from 'react'

interface Props {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const Button = ({ label, onClick, disabled, loading }: Props) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-xl border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Loading..." : label}
    </button>
  )
}

export default Button