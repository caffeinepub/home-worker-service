import { Button } from "@/components/ui/button";
import { Clock, HomeIcon, Loader2, Shield, Star } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

const features = [
  {
    icon: Star,
    title: "Vetted Professionals",
    description:
      "Every worker is background-checked and rated by real customers.",
  },
  {
    icon: Clock,
    title: "Book in Minutes",
    description:
      "Schedule cleaning, laundry, ironing, and more in just a few taps.",
  },
  {
    icon: Shield,
    title: "Secure & Transparent",
    description: "Payments and data are protected on the Internet Computer.",
  },
];

const services = [
  { emoji: "🧹", name: "Cleaning" },
  { emoji: "👕", name: "Laundry" },
  { emoji: "🍳", name: "Cooking" },
  { emoji: "🫧", name: "Dishwashing" },
  { emoji: "👔", name: "Ironing" },
  { emoji: "🛠️", name: "General Help" },
];

export function LandingPage({ onLogin, isLoggingIn }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b border-border/40 bg-card/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <HomeIcon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">HomeWorker</span>
          </div>
          <Button
            onClick={onLogin}
            disabled={isLoggingIn}
            size="sm"
            data-ocid="nav.primary_button"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Sign In
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden gradient-hero">
          <div className="absolute inset-0 opacity-10">
            <img
              src="/assets/generated/hero-home-services.dim_1200x600.png"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-36">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-teal-300 border border-primary/30">
                On-Demand Home Services
              </span>
              <h1 className="font-display text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
                Your home,{" "}
                <span className="text-gradient">perfectly cared for</span>
              </h1>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Connect with trusted home workers for cleaning, laundry,
                cooking, and more. Book in minutes, track in real time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={onLogin}
                  disabled={isLoggingIn}
                  className="text-base px-8"
                  data-ocid="hero.primary_button"
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {isLoggingIn ? "Connecting..." : "Get Started"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onLogin}
                  disabled={isLoggingIn}
                  className="text-base px-8 border-white/20 text-white hover:bg-white/10 bg-transparent"
                  data-ocid="hero.secondary_button"
                >
                  Find Work
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services grid */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <h2 className="font-display text-3xl font-bold mb-3">
                Services We Offer
              </h2>
              <p className="text-muted-foreground">
                Experienced workers ready for every task
              </p>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {services.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="bg-card rounded-xl p-5 text-center surface-raised hover:surface-elevated transition-all cursor-default"
                >
                  <div className="text-3xl mb-2">{s.emoji}</div>
                  <div className="text-sm font-medium">{s.name}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid sm:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold mb-1">
                      {f.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        {/* Main footer row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} HomeWorker. All rights reserved.
        </div>

        {/* Admin section */}
        <div className="border-t border-border/40 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-center">
            <button
              type="button"
              onClick={onLogin}
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-200 tracking-wide"
              data-ocid="footer.primary_button"
            >
              Admin Access
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
