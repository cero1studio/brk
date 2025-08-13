export interface ApplicationItem {
  serie: string;
  litros?: string;
  ano?: string;
  especificacionVehiculo: string;
  eje?: string;
  isHighlighted?: boolean;
}

export interface Product {
  id: string;
  name: string; 
  description: string;
  images: string[];
  specifications: {
    // Core Identifiers from filters
    subgrupo?: string; // Pastas, Discos, Tambores
    codigoBrk?: string; // Matches SKU
    posicion?: string; // Delantera, Trasera
    refFmsiOem?: string; // e.g., "OEM 45022-TEA-T01, Bendix D1539"
    marca?: string; // Ford, Chevrolet
    linea?: string;
    modelo?: string;
    version?: string;

    // Specifications for Brake Pads (Pastillas)
    largo_mm?: number | string;
    ancho_mm?: number | string;
    espesor_mm?: number | string;
    xJuegoPastilla?: number; // How many pads in a set

    // Specifications for Rotors (Discos) & Drums (Tambores)
    diametro_A_mm?: number | string;
    alto_B_mm?: number | string; // Also for Drums
    espesor_C_mm?: number | string; // For Rotors
    espesor_min_mm?: number | string; // For Rotors
    agujeros?: number;
    diametro_interno_A_mm?: number | string; // For Drums
    diametro_orificio_central_C_mm?: number | string;
    altura_total_D_mm?: number | string;
    diametro_interno_maximo?: number | string; // For Drums

    // General / Legacy fields
    equivalencias?: string;
    [key: string]: string | number | undefined;
  };
  price: number; 
  category: string; 
  vendor: string; 
  stock: number; 
  sku: string; 
  aplicaciones?: ApplicationItem[];
}
