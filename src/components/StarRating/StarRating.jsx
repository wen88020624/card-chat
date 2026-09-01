import styles from './StarRating.module.scss';

export default function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div className={styles.stars} aria-label={`${value} stars`}>
      {[1, 2, 3, 4].map((star) => (
        <button
          key={star}
          type="button"
          className={`${styles.star} ${star <= value ? styles.filled : ''}`}
          onClick={() => !readOnly && onChange?.(star)}
          disabled={readOnly}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
