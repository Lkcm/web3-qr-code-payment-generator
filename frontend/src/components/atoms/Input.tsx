"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

const Input = ({ value, onChange, placeholder, type = "text" }: Props) => {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
  );
}

export default Input;