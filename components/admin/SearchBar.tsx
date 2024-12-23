import { ChangeEvent } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
}

export function SearchBar({ searchTerm, setSearchTerm }: SearchBarProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  return (
    <div className="relative mb-6">
      <input
        type="text"
        placeholder="Search calls..."
        value={searchTerm}
        onChange={handleChange}
        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  )
}

