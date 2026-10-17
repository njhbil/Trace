/**
 * Logo TRACE — penanda peta (pin) berwarna kuningan dengan monogram "T".
 * Digambar sebagai SVG murni supaya tajam di segala ukuran & bisa diwarnai tema.
 */
export default function Logo({ size = 30, title }: { size?: number; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id="trace-gold" x1="12" y1="6" x2="52" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F4DDA3" />
          <stop offset="1" stopColor="#C9A227" />
        </linearGradient>
      </defs>
      <path
        d="M32 4c-12.7 0-23 10.1-23 22.6C9 39.4 26.2 56.6 30 60.2a2.8 2.8 0 0 0 4 0C37.8 56.6 55 39.4 55 26.6 55 14.1 44.7 4 32 4Z"
        fill="url(#trace-gold)"
      />
      <path d="M20 17h24v7h-8.6v17h-6.8V24H20v-7Z" fill="#191410" />
    </svg>
  );
}
