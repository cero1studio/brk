"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { BrkLogo } from '@/components/BrkLogo'; // Import the new BRK Logo

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const { login, isLoading: authLoading } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const success = await login(password);
    if (success) {
      router.push('/admin/dashboard');
    } else {
      setError('Credenciales inválidas. Por favor, inténtelo de nuevo.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-card p-4">
      <Card className="w-full max-w-md shadow-2xl border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-fit">
            <Link href="/" className="flex items-center gap-2 text-primary">
              <BrkLogo className="h-16 w-auto" /> {/* Use BrkLogo */}
            </Link>
          </div>
          <CardTitle className="text-3xl font-headline text-primary">Portal de Administración</CardTitle>
          <CardDescription>Por favor, ingrese su contraseña para acceder al panel de administración.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password_admin" className="text-base">Contraseña</Label>
              <Input
                id="password_admin"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese la contraseña de administrador"
                required
                className="text-base py-3 bg-input border-border focus:border-primary"
              />
            </div>
            {error && (
              <div className="flex items-center text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}
            <Button type="submit" className="w-full text-base py-3 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting || authLoading}>
              {isSubmitting || authLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              {isSubmitting || authLoading ? 'Verificando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center block">
            <p className="text-xs text-muted-foreground">Para fines de demostración, use la contraseña: <span className="font-bold text-accent">password123</span></p>
            <Button variant="link" asChild className="mt-2 text-primary">
                <Link href="/">Volver al Sitio Principal</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
