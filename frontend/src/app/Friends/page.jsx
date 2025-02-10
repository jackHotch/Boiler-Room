import styles from './Friends.module.css'

export default function page() {
  return (
    <div className={styles.container}>
      Friends
      <div className={styles.list_of_friends}>list of friends</div>
    </div>
  )
}
