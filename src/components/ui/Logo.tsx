// Logo de Parakeet. El asset real vive en public/parakeet.png
// (guardá ahí tu archivo; se actualiza en toda la app sin tocar código).
export default function Logo({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/parakeet.png"
      alt="Parakeet"
      className={className}
      width={40}
      height={40}
    />
  );
}
