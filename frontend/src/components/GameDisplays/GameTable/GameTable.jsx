'use client'

import { useState } from 'react'
import styles from './GameTable.module.css'

const GameTable = ({ games }) => {
  const rowsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredGames, setFilteredGames] = useState(games)
  const [sortBy, setSortBy] = useState(null)
  const [sortOrder, setSortOrder] = useState('asc') // 'asc' or 'desc'

  // Calculate the total number of pages
  const totalPages = Math.ceil(filteredGames.length / rowsPerPage)

  // Get games for the current page
  const indexOfLastGame = currentPage * rowsPerPage
  const indexOfFirstGame = indexOfLastGame - rowsPerPage
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame)

  // Handle page navigation
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  // Sorting function with toggle
  const sortGames = (criteria) => {
    let newOrder = 'asc'

    if (sortBy === criteria) {
      // If the same column is clicked, toggle between ascending and descending
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc'
    }

    setSortBy(criteria)
    setSortOrder(newOrder)

    let sortedGames = [...games] // Reset to original list before sorting

    sortedGames.sort((a, b) => {
      let valueA, valueB

      switch (criteria) {
        case 'metacritic':
          valueA = a.metacritic_score ?? 0
          valueB = b.metacritic_score ?? 0
          break
        case 'length':
          valueA = a.hltb_score ?? Infinity
          valueB = b.hltb_score ?? Infinity
          break
        case 'boil':
          valueA = a.boil_score ?? 0
          valueB = b.boil_score ?? 0
          break
        default:
          return 0
      }

      return newOrder === 'asc' ? valueA - valueB : valueB - valueA
    })

    setFilteredGames(sortedGames)
    setCurrentPage(1) // Reset pagination after sorting
  }

  return (
   <div className={styles.gameTableContainer}>
  
  {/* Filters and Pagination in One Row */}
  <div className={styles.controls}>
    {/* Filter Buttons */}
    <div className={styles.filters}>
      <button 
        onClick={() => sortGames('metacritic')} 
        className={sortBy === 'metacritic' ? styles.activeFilter : ''}
      >
        Sort by Metacritic {sortBy === 'metacritic' ? (sortOrder === 'asc' ? '⬆' : '⬇') : ''}
      </button>
      <button 
        onClick={() => sortGames('length')} 
        className={sortBy === 'length' ? styles.activeFilter : ''}
      >
        Sort by Playtime {sortBy === 'length' ? (sortOrder === 'asc' ? '⬆' : '⬇') : ''}
      </button>
      <button 
        onClick={() => sortGames('boil')} 
        className={sortBy === 'boil' ? styles.activeFilter : ''}
      >
        Sort by BOIL {sortBy === 'boil' ? (sortOrder === 'asc' ? '⬆' : '⬇') : ''}
      </button>
    </div>

    {/* Pagination Controls */}
    <div className={styles.pagination}>
      <button onClick={prevPage} disabled={currentPage === 1}>Last</button>
      <span>{currentPage} of {totalPages}</span>
      <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
    </div>
  </div>

  {/* Game Table */}
  <table className={styles.gameTable}>
    <tbody>
      <tr className={styles.headerRow}>
        <th>Title</th>
        <th>Rating</th>
        <th>Time to Beat</th>
        <th>Boil</th>
        <th>Steam Page</th>
      </tr>
      {currentGames.map((game) => (
        <tr key={game.game_id}>
          <td>
            <div className={styles.title_container}>
              <img src={game.header_image} alt={game.name} className={styles.header_image} />
              <a className={styles.title_text} href={'/SingleGame/' + game.game_id}>
                {game.name}
              </a>
            </div>
          </td>
          <td>{game.metacritic_score !== null ? game.metacritic_score : 'N/A'}</td>
          <td>{game.hltb_score !== null ? `${game.hltb_score} Hrs` : 'Unknown'}</td>
          <td>{game.boil_score !== null ? game.boil_score : 'N/A'}</td>
          <td>
            <a href={'https://store.steampowered.com/app/' + game.game_id}>
              <img
                src='https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png'
                className={styles.steamImg}
              />
            </a>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

  )
}

export default GameTable
