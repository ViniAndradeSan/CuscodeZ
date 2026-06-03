type BandeirolasProps = {
  height?: number;
  rows?: number;
};

const FLAG_COLORS = [
  "#C0392B",
  "#E67E22",
  "#F1C40F",
  "#27AE60",
  "#2980B9",
  "#8E44AD",
  "#E91E8C",
  "#FFFFFF",
];

const CHECKER_FLAGS = [1, 4, 6, 9];

export function Bandeirolas({ height = 52, rows = 2 }: BandeirolasProps) {
  const width = 1000;
  const flagsPerRow = 12;
  const rowGap = 8;
  const rowHeight = height / rows;
  const strandHeight = height - 8;
  const cordControl = Math.max(width * 0.45, 400);

  return (
    <div className="sticky top-0 z-50">
      <svg
        role="img"
        aria-label="Bandeirinhas decorativas de São João"
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ display: "block", background: "transparent" }}
      >
        <defs>
          <pattern id="checker-pattern" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#FFFFFF" fillOpacity="0.3" />
            <rect width="4" height="4" fill="#000000" fillOpacity="0.12" />
            <rect x="4" y="4" width="4" height="4" fill="#000000" fillOpacity="0.12" />
          </pattern>
          <linearGradient id="cord-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#40210F" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3A1A09" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {Array.from({ length: rows }).map((_, rowIndex) => {
          const yOffset = 8 + rowIndex * (rowHeight + rowGap);
          const shift = rowIndex % 2 === 0 ? 0 : 20;
          const cordTop = yOffset + 4;
          const cordBottom = yOffset + 6;

          return (
            <g key={rowIndex}>
              <path
                d={`M0,${cordBottom} Q${width / 2},${cordBottom + 10} ${width},${cordBottom}`}
                fill="none"
                stroke="url(#cord-gradient)"
                strokeWidth="2"
              />

              {Array.from({ length: flagsPerRow }).map((_, index) => {
                const x = index * (width / flagsPerRow) + shift - 10;
                const flagWidth = width / flagsPerRow - 18;
                const flagHeight = rowHeight * 0.7;
                const baseColor = FLAG_COLORS[(index + rowIndex * 3) % FLAG_COLORS.length];
                const usePattern = CHECKER_FLAGS.includes(index);
                const trianglePoints = `${x},${cordBottom} ${x + flagWidth},${cordBottom} ${x + flagWidth / 2},${cordBottom + flagHeight}`;

                return (
                  <g key={`${rowIndex}-${index}`}>
                    <line
                      x1={x + flagWidth / 2}
                      y1={cordBottom}
                      x2={x + flagWidth / 2}
                      y2={cordBottom + 6}
                      stroke="#5A3A22"
                      strokeWidth="1.2"
                    />
                    <polygon
                      points={trianglePoints}
                      fill={baseColor}
                      stroke="#00000033"
                      strokeWidth="0.5"
                    />
                    {usePattern && (
                      <polygon
                        points={trianglePoints}
                        fill="url(#checker-pattern)"
                        opacity="0.9"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
