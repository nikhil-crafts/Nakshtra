import AnimatedBackground from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <>
      <AnimatedBackground />
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-shift">
            Beautiful Animated Background
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80">
            Smooth gradients, floating orbs, and mesmerizing animations
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;