import { Link } from "react-router-dom";
import { FileX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <FileX className="h-10 w-10 text-muted-foreground" aria-hidden />
        </div>
        <div>
          <h1 className="text-5xl font-bold text-foreground">404</h1>
          <p className="mt-2 text-lg text-muted-foreground">Página não encontrada</p>
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">
          A página que você tentou acessar não existe ou foi movida.
        </p>
      </div>
      <Button asChild>
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao início
        </Link>
      </Button>
    </div>
  );
}
