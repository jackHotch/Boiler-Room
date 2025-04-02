import styles from './Searchbar.module.css'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function Searchbar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/Search?query=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className={styles.container}>
      <input
        className={styles.input}
        type='text'
        placeholder='Search...'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type='submit'>
        <img src='/search.png' className={styles.search_icon} width={16} />
      </button>
    </form>
  )
}
