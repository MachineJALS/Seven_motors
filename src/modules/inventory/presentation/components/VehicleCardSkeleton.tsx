export default function VehicleCardSkeleton() {
  return (
    <div className="card card--skeleton" aria-hidden="true">
      <div className="card__media skeleton-block" />
      <div className="card__body">
        <div className="skeleton-block skeleton-line skeleton-line--title" />
        <div className="skeleton-block skeleton-line skeleton-line--specs" />
        <div className="card__footer">
          <div className="skeleton-block skeleton-line skeleton-line--price" />
        </div>
      </div>
    </div>
  );
}
