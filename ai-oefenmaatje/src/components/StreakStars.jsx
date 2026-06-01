export default function StreakStars({ streak, max = 2 }) {
  return (
    <div className="streak-stars" aria-label={`Goede reeks: ${streak} van ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`streak-stars__star ${i < streak ? "streak-stars__star--on" : ""}`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}
