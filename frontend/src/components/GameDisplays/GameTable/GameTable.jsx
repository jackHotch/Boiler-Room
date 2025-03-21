'use client'

import styles from './GameTable.module.css'

const GameTable = ({ games }) => {
  return (
    <div className={styles.gameTableContainer}>
      <table className={styles.gameTable}>
        <tbody>
          <tr className={styles.headerRow}>
            <th>Title</th>
            <th>Metacritic Rating</th>
            <th>Average Length</th>
            <th>BOIL</th>
            <th>Steam Page</th>
          </tr>
          {games.map((game) => (
            <tr key={game.game_id}>
              <td>
                <div className={styles.title_container}>
                  <img
                    src={game.header_image}
                    alt={game.name}
                    className={styles.header_image}
                  ></img>
                  <a className={styles.title_text} href={'/SingleGame/' + game.game_id}>
                    {game.name}
                  </a>
                </div>
              </td>
              <td>
                {game.metacritic_score !== null && game.metacritic_score !== undefined
                  ? game.metacritic_score
                  : 'N/A'}
              </td>
              <td>
                {game.hltb_score !== null && game.hltb_score !== undefined
                  ? `${game.hltb_score} Hrs`
                  : 'Unknown'}
              </td>
              <td>
                {game.boil_score !== null && game.boil_score !== undefined
                  ? game.boil_score
                  : 'N/A'}
              </td>
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
