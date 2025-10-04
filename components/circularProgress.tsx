interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0-100
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 120,
  strokeWidth = 10,
  progress,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const getColor = (value: number) => {
    if (value <= 50) {
      const ratio = value / 50;
      const r = Math.round(0 + ratio * (254 - 0)); 
      const g = Math.round(255); 
      const b = 0; 
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const ratio = (value - 50) / 50;
      const r = 254;
      const g = Math.round(255 - ratio * 255); 
      const b = 0; 
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const color = getColor(progress);

  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          stroke="#e6e6e6"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {/* Value in center */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: size * 0.2,
        }}
      >
        {progress}%
      </div>
    </div>
  );
};

export default CircularProgress;
