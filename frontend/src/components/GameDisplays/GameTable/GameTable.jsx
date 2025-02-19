'use client'

import styles from './GameTable.module.css'

const GameTable = ({games}) => {
    return (
        <div className={styles.gameTableContainer}>
            <table className={styles.gameTable}>
                <tbody>
                    <tr className={styles.headerRow}>
                        <th>Title</th>
                        <th>Aggregate Rating</th>
                        <th>Average Length</th>
                        <th>BOIL</th>
                        <th>Steam Page</th>
                        <th>Played?</th>
                    </tr>
                    {games.map((game) => (
                        <tr key={game.game_id}>
                            <td><a href={'/SingleGame/' + game.game_id}>{game.name}</a></td>
                            <td>{game.metacritic_score /*Replace with aggregate score when available*/}</td>
                            <td>{game.hltb_score} Hrs</td>
                            <td>100{/*Put Boil rating here when possible*/}</td>
                            <td><a href={'https://store.steampowered.com/app/' + game.game_id}>Steam</a></td>
                            <td><input type="checkbox" /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default GameTable;