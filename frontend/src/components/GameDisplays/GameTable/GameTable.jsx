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
                </tbody>
            </table>
        </div>
    )
}

export default GameTable;