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
                    {/* add map function for creating rows for games here*/}
                    {games.map((game) => (
                        <tr key={game.appId}>
                            <td>GameTitle</td>
                            <td>3 {/*placeholder for actual rating*/}</td>
                            <td>32 {/*placeholder for actual length*/} Hrs</td>
                            <td>100 {/*placeholder for actual BOIL*/}</td>
                            <td><a href={'https://store.steampowered.com/app/' + game.appId}>Steam</a></td>
                            <td><input type="checkbox" /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default GameTable;