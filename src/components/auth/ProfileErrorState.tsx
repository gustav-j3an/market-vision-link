import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, LogOut } from "lucide-react";

export function ProfileErrorState() {
  const { signOut, profileError, profile, user, isLoading } = useAuth();

  if (isLoading) return null;

  // Só mostra se estiver logado mas sem perfil ou com erro no perfil
  if (!user || (profile && !profileError)) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <Card className="w-full max-w-md border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle size={32} />
          </div>
          <CardTitle>Problema no Acesso</CardTitle>
          <CardDescription>
            Não conseguimos localizar seu perfil de usuário ou você não tem permissão de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>Isso pode acontecer se sua conta ainda não foi totalmente configurada ou se houve um erro na conexão.</p>
          <p className="mt-2 text-xs opacity-70 italic">ID do Usuário: {user.id}</p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair da conta
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
