import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Configuración de la Plataforma</CardTitle>
          <CardDescription>Configura los ajustes generales para BRK Performance Brakes.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-headline">Ajustes Generales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="siteName">Nombre del Sitio</Label>
            <Input id="siteName" defaultValue="BRK Performance Brakes" className="bg-input border-border focus:border-primary" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminEmail">Email de Administrador</Label>
            <Input id="adminEmail" type="email" defaultValue="admin@brkbrakes.com" className="bg-input border-border focus:border-primary" />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="maintenanceMode" disabled />
            <Label htmlFor="maintenanceMode" className="text-muted-foreground">Modo Mantenimiento (Próximamente)</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-headline">Apariencia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
           <p className="text-sm text-muted-foreground">Los ajustes de tema y apariencia se gestionan globalmente. Las opciones de personalización avanzada estarán disponibles aquí en el futuro.</p>
           <div className="space-y-2">
            <Label htmlFor="logoUpload">Logo de la Plataforma (Próximamente)</Label>
            <Input id="logoUpload" type="file" disabled className="bg-input border-border focus:border-primary cursor-not-allowed" />
            <p className="text-xs text-muted-foreground">Formato recomendado: SVG, PNG. Tamaño máx.: 2MB.</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled>
          <Save className="mr-2 h-4 w-4" /> Guardar Cambios (Deshabilitado)
        </Button>
      </div>
       <p className="text-xs text-muted-foreground text-center">La página de configuración es actualmente para demostración. La funcionalidad es limitada.</p>
    </div>
  );
}
