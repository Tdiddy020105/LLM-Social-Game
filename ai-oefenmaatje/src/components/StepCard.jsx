export default function StepCard({ stepNum, stepTotal, title }) {
  return (
    <div className="step-card">
      <span className="step-card__badge">
        Stap {stepNum} van {stepTotal}
      </span>
      <h2 className="step-card__title">{title}</h2>
    </div>
  );
}
