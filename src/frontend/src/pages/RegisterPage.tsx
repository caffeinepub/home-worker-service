import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, HomeIcon, Loader2, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useRegisterCustomer, useRegisterWorker } from "../hooks/useQueries";

interface RegisterPageProps {
  onSuccess: () => void;
}

export function RegisterPage({ onSuccess }: RegisterPageProps) {
  const [role, setRole] = useState<"customer" | "worker" | null>(null);
  const [name, setName] = useState("");
  const registerCustomer = useRegisterCustomer();
  const registerWorker = useRegisterWorker();

  const isPending = registerCustomer.isPending || registerWorker.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !name.trim()) return;
    if (role === "customer") {
      await registerCustomer.mutateAsync(name.trim());
    } else {
      await registerWorker.mutateAsync(name.trim());
    }
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <HomeIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold">HomeWorker</span>
        </div>

        <Card className="surface-elevated">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">
              Create your account
            </CardTitle>
            <CardDescription>
              Choose how you want to use HomeWorker
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role selection */}
              <div className="space-y-2">
                <Label>I want to...</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("customer")}
                    data-ocid="register.primary_button"
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                      role === "customer"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-secondary/50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        role === "customer"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary"
                      }`}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm">Book Services</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        I'm a customer
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("worker")}
                    data-ocid="register.secondary_button"
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                      role === "worker"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-secondary/50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        role === "worker"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary"
                      }`}
                    >
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm">Find Work</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        I'm a worker
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-ocid="register.input"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!role || !name.trim() || isPending}
                data-ocid="register.submit_button"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {isPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
