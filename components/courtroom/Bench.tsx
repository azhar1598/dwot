export default function Bench({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <div className="mx-auto h-4 w-64 bg-background-raised sm:w-80" />
      <div className="mx-auto h-8 w-72 border-t border-line bg-background-raised sm:w-96" />
      <div className="mx-auto h-1 w-80 bg-line sm:w-[26rem]" />
    </div>
  );
}
