import './BrandHomeButton.css';

export default function BrandHomeButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      className={`brand-home-button ${className}`.trim()}
      onClick={onClick}
      aria-label="모여 홈으로"
      title="홈으로">
      <span className="brand-home-word">모여</span>
      <span className="brand-home-dot" aria-hidden="true" />
    </button>
  );
}
