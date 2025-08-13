import type { Product } from '@/types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Juego de Bujías de Iridio (4pz)',
    description: 'Bujías de iridio de alto rendimiento para una mejor ignición y eficiencia de combustible. Adecuadas para una amplia gama de motores modernos, ofreciendo una vida útil más larga y un rendimiento constante.',
    images: [
      'https://placehold.co/600x600.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/400x600.png',
      'https://placehold.co/300x300.png'
    ],
    specifications: {
      subgrupo: 'Encendido',
      codigoBrk: 'ATP-SP-IRIDIUM-4PK',
      posicion: 'N/A',
      refFmsiOem: 'NGK ILKAR7B11, Denso IXEH22TT',
      marca: 'Autotech',
      linea: 'Pro',
      modelo: 'GenX',
      version: 'Todos',
      largo_mm: '70',
      ancho_mm: 'N/A',
      espesor_mm: 'Punta 0.6mm',
      xJuegoPastilla: 4,
    },
    price: 45.99,
    category: 'Partes de Motor',
    vendor: 'Autotech Pro',
    stock: 150,
    sku: 'ATP-SP-IRIDIUM-4PK',
    aplicaciones: [
      { serie: 'Sedan GenX', litros: '2.0', ano: '2018-2022', especificacionVehiculo: 'Autotech Motors', eje: 'N/A', isHighlighted: true },
      { serie: 'Hatchback Z', litros: '1.6', ano: '2019-2023', especificacionVehiculo: 'Autotech Motors', eje: 'N/A' },
    ]
  },
  {
    id: '2',
    name: 'Juego de Pastillas de Freno Cerámicas (Delanteras)',
    description: 'Pastillas de freno cerámicas premium de bajo polvo y operación silenciosa. Diseñadas para una potencia de frenado superior y durabilidad. Incluye herrajes para una fácil instalación.',
    images: [
      'https://placehold.co/600x600.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/400x600.png'
    ],
    specifications: {
      subgrupo: 'Pastas',
      codigoBrk: 'SWB-CBP-FRT-001',
      posicion: 'Delantera',
      refFmsiOem: 'D1539 / 8750-D1539',
      marca: 'StopWell',
      linea: 'Ceramic Pro',
      modelo: 'SUV Modelo T',
      version: 'Todos los trims',
      largo_mm: '155',
      ancho_mm: '69.1',
      espesor_mm: '17.5',
      xJuegoPastilla: 4,
      equivalencias: 'OEM 45022-TEA-T01, Bendix D1539', 
    },
    price: 79.50,
    category: 'Frenos',
    vendor: 'StopWell Brakes',
    stock: 85,
    sku: 'SWB-CBP-FRT-001',
    aplicaciones: [
      { serie: 'SUV Modelo T', litros: '2.5', ano: '2020-2024', especificacionVehiculo: 'StopWell Cars', eje: 'Delantero', isHighlighted: true },
      { serie: 'Compacto X', litros: '1.8', ano: '2019-2023', especificacionVehiculo: 'StopWell Cars', eje: 'Delantero' },
    ]
  },
  {
    id: '3',
    name: 'Filtro de Aire de Alto Rendimiento',
    description: 'Filtro de aire de alto flujo, lavable y reutilizable, diseñado para aumentar los caballos de fuerza y la aceleración mientras proporciona una excelente filtración.',
    images: [
      'https://placehold.co/600x600.png',
      'https://placehold.co/600x400.png'
    ],
    specifications: {
      subgrupo: 'Filtros',
      codigoBrk: 'PFF-AF-HD-015',
      posicion: 'N/A',
      refFmsiOem: 'K&N 33-2452, Fram CA10111',
      marca: 'PureFlow',
      linea: 'Max-Flow',
      modelo: 'Truckzilla 5000',
      version: '5.0 V8',
      largo_mm: '250',
      ancho_mm: '180',
      espesor_mm: '30',
      equivalencias: 'K&N 33-2452, Fram CA10111',
    },
    price: 32.00,
    category: 'Filtros',
    vendor: 'PureFlow Filters',
    stock: 200,
    sku: 'PFF-AF-HD-015',
    aplicaciones: [
      { serie: 'Truckzilla 5000', litros: '5.0 V8', ano: '2015-2021', especificacionVehiculo: 'PureFlow Trucks', eje: 'N/A', isHighlighted: true },
    ]
  },
  {
    id: '4',
    name: 'Disco de Freno Ventilado de Rendimiento (Delantero)',
    description: 'Disco de freno ventilado de alto rendimiento para una disipación de calor superior y una reducción del desvanecimiento del freno. Mecanizado de precisión para un ajuste perfecto y un funcionamiento suave.',
    images: [
      'https://placehold.co/600x600.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/400x600.png',
      'https://placehold.co/300x300.png',
      'https://placehold.co/400x400.png',
    ],
    specifications: {
        subgrupo: 'Discos',
        codigoBrk: 'LBL-RD-FRT-V1',
        posicion: 'Delantera',
        refFmsiOem: 'OEM 5-4321, Brembo 09.A.123',
        marca: 'LumiBright',
        linea: 'Performance Series',
        modelo: 'Sedán NightRider',
        version: 'Sport',
        diametro_A_mm: '320',
        alto_B_mm: '45',
        espesor_C_mm: '28',
        espesor_min_mm: '26',
        agujeros: 5,
        diametro_orificio_central_C_mm: '68'
    },
    price: 65.99,
    category: 'Frenos',
    vendor: 'LumiBright Dynamics',
    stock: 120,
    sku: 'LBL-RD-FRT-V1',
    aplicaciones: [
      { serie: 'Sedán NightRider', litros: 'Todos', ano: '2010-2024', especificacionVehiculo: 'LumiBright Vehicles', eje: 'Delantero', isHighlighted: true },
    ]
  },
];
