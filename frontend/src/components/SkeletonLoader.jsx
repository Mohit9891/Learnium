function Shimmer({ className = '' }) {
  return <div className={`animate-pulse bg-hairline-cloud/70 rounded-md ${className}`} />;
}

export function QuestionSkeleton() {
  return (
    <div className="bg-white rounded-xxl border border-hairline-cloud p-6" aria-hidden="true">
      <Shimmer className="h-3 w-24 mb-4" />
      <Shimmer className="h-5 w-full mb-2" />
      <Shimmer className="h-5 w-2/3 mb-6" />
      <div className="space-y-3">
        <Shimmer className="h-12 w-full" />
        <Shimmer className="h-12 w-full" />
        <Shimmer className="h-12 w-full" />
        <Shimmer className="h-12 w-full" />
      </div>
      <Shimmer className="h-12 w-full mt-6" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-hairline-cloud" aria-hidden="true">
      <Shimmer className="h-10 w-10 rounded-md mb-4" />
      <Shimmer className="h-5 w-3/4" />
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div
      className="flex items-center justify-between bg-white rounded-lg px-6 py-4 border border-hairline-cloud"
      aria-hidden="true"
    >
      <div className="flex items-center gap-4 flex-1">
        <Shimmer className="h-4 w-6" />
        <Shimmer className="h-4 w-1/2" />
      </div>
      <Shimmer className="h-4 w-8" />
    </div>
  );
}

export default Shimmer;
