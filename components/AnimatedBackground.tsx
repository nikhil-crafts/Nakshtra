const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Animated gradient overlay */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, hsl(var(orange)) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, hsl(var(yellow)) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, hsl(var(green)) 0%, transparent 50%),
            radial-gradient(circle at 60% 90%, hsl(var(blue)) 0%, transparent 50%)
          `,
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 15s ease infinite',
        }}
      />

      {/* Floating orb 1 - Purple */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-40 animate-blob"
        style={{
          background: `radial-gradient(circle, hsl(var(orange)) 0%, transparent 70%)`,
        }}
      />

      {/* Floating orb 2 - Pink */}
      <div 
        className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-40 animate-blob"
        style={{
          background: `radial-gradient(circle, hsl(var(blue)) 0%, transparent 70%)`,
          animationDelay: '2s',
        }}
      />

      {/* Floating orb 3 - Blue */}
      <div 
        className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full blur-3xl opacity-40 animate-blob"
        style={{
          background: `radial-gradient(circle, hsl(var(green)) 0%, transparent 70%)`,
          animationDelay: '4s',
        }}
      />

      {/* Floating orb 4 - Purple accent */}
      <div 
        className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full blur-3xl opacity-30 animate-blob"
        style={{
          background: `radial-gradient(circle, hsl(var(yellow)) 0%, transparent 70%)`,
          animationDelay: '6s',
        }}
      />

      {/* Grain texture overlay for depth */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
