import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface ModuleTemplate {
  moduleName: string
  displayName: string
  description: string
  schema: Record<string, any>
  routes: Record<string, string>
  validations: Record<string, string>
}

const DEFAULT_MODULES: ModuleTemplate[] = [
  {
    moduleName: 'Ecommerce',
    displayName: 'E-commerce',
    description: 'Gestion de produits, catégories et commandes.',
    schema: {
      Product: {
        fields: {
          id: 'String @id @default(cuid())',
          name: 'String',
          price: 'Float',
          description: 'String?',
        }
      }
    },
    routes: {
      'GET /api/products': 'Récupérer tous les produits',
      'POST /api/products': 'Créer un produit',
      'GET /api/products/:id': 'Récupérer un produit',
      'PUT /api/products/:id': 'Mettre à jour un produit',
      'DELETE /api/products/:id': 'Supprimer un produit',
    },
    validations: {
      name: 'required, min 3, max 255',
      price: 'required, number, min 0',
    }
  },
  {
    moduleName: 'Blog',
    displayName: 'Blog',
    description: 'Articles, catégories et commentaires.',
    schema: {
      BlogPost: {
        fields: {
          id: 'String @id @default(cuid())',
          title: 'String',
          content: 'String',
          published: 'Boolean @default(false)',
        }
      }
    },
    routes: {
      'GET /api/blog': 'Récupérer tous les articles',
      'POST /api/blog': 'Créer un article',
      'GET /api/blog/:id': 'Récupérer un article',
      'PUT /api/blog/:id': 'Mettre à jour un article',
      'DELETE /api/blog/:id': 'Supprimer un article',
    },
    validations: {
      title: 'required, min 5, max 500',
      content: 'required, min 50',
    }
  },
  {
    moduleName: 'Media',
    displayName: 'Média',
    description: 'Gestion de la bibliothèque multimédia.',
    schema: {
      Media: {
        fields: {
          id: 'String @id @default(cuid())',
          url: 'String',
          type: 'String',
          metadata: 'Json?',
        }
      }
    },
    routes: {
      'GET /api/media': 'Récupérer tous les fichiers',
      'POST /api/media/upload': 'Télécharger un fichier',
      'DELETE /api/media/:id': 'Supprimer un fichier',
    },
    validations: {
      url: 'required, url',
      type: 'required, in:image,video,document',
    }
  },
]

// Modules spécifiques pour Shuffle Life
const SHUFFLE_LIFE_MODULES: ModuleTemplate[] = [
  {
    moduleName: 'UserManagement',
    displayName: 'Gestion d\'Utilisateurs',
    description: 'Gestion complète des utilisateurs, profils, préférences et activités.',
    schema: {
      User: {
        fields: {
          id: 'String @id @default(cuid())',
          email: 'String @unique',
          name: 'String',
          latitude: 'Float?',
          longitude: 'Float?',
          preferences: 'Json?',
          activityRadius: 'Int @default(200)',
          createdAt: 'DateTime @default(now())',
        }
      },
      UserPreference: {
        fields: {
          id: 'String @id @default(cuid())',
          userId: 'String',
          activityType: 'String',
          intensity: 'Int',
        }
      }
    },
    routes: {
      'GET /api/users': 'Lister tous les utilisateurs',
      'POST /api/users': 'Créer un utilisateur',
      'GET /api/users/:id': 'Récupérer un utilisateur',
      'PUT /api/users/:id': 'Mettre à jour un utilisateur',
      'GET /api/users/:id/preferences': 'Récupérer les préférences',
      'PUT /api/users/:id/preferences': 'Mettre à jour les préférences',
      'DELETE /api/users/:id': 'Supprimer un utilisateur',
    },
    validations: {
      email: 'required, email, unique',
      name: 'required, min 2, max 255',
      latitude: 'number, min -90, max 90',
      longitude: 'number, min -180, max 180',
      activityRadius: 'number, min 10, max 500',
    }
  },
  {
    moduleName: 'AIActivityDiscovery',
    displayName: 'Découverte d\'Activités IA',
    description: 'Module IA qui recherche et recommande des activités selon la localisation et préférences de l\'utilisateur.',
    schema: {
      Activity: {
        fields: {
          id: 'String @id @default(cuid())',
          name: 'String',
          description: 'String?',
          type: 'String',
          latitude: 'Float',
          longitude: 'Float',
          distance: 'Float',
          rating: 'Float?',
          hours: 'String?',
          googleMapUrl: 'String?',
          aiGenerated: 'Boolean @default(true)',
          createdAt: 'DateTime @default(now())',
        }
      },
      ActivityRecommendation: {
        fields: {
          id: 'String @id @default(cuid())',
          userId: 'String',
          activityId: 'String',
          score: 'Float',
          reason: 'String?',
        }
      }
    },
    routes: {
      'POST /api/activities/discover': 'Découvrir des activités (IA)',
      'GET /api/activities/nearby': 'Activités à proximité',
      'GET /api/activities/:id': 'Détails d\'une activité',
      'GET /api/recommendations/:userId': 'Recommandations personnalisées',
      'POST /api/activities/:id/favorite': 'Ajouter aux favoris',
    },
    validations: {
      name: 'required, min 3, max 500',
      type: 'required, in:restaurant,park,museum,sports,entertainment,event,hiking,shopping,nightlife,culture',
      latitude: 'required, number, min -90, max 90',
      longitude: 'required, number, min -180, max 180',
      distance: 'required, number, min 0, max 500',
    }
  },
  {
    moduleName: 'IPGeolocation',
    displayName: 'Géolocalisation IP',
    description: 'Module pour détecter et afficher la localisation de l\'utilisateur via son adresse IP.',
    schema: {
      UserLocation: {
        fields: {
          id: 'String @id @default(cuid())',
          userId: 'String',
          ip: 'String',
          country: 'String',
          city: 'String',
          latitude: 'Float',
          longitude: 'Float',
          lastUpdated: 'DateTime @default(now())',
        }
      }
    },
    routes: {
      'GET /api/location/current': 'Localisation actuelle',
      'POST /api/location/update': 'Mettre à jour la localisation',
      'GET /api/location/history': 'Historique des localisations',
      'GET /api/location/ip-info': 'Informations IP',
    },
    validations: {
      ip: 'required, ipv4',
      latitude: 'required, number',
      longitude: 'required, number',
    }
  },
  {
    moduleName: 'MapDisplay',
    displayName: 'Affichage Cartographique',
    description: 'Module de visualisation des activités sur une carte interactive avec clustering et filtrage.',
    schema: {
      MapMarker: {
        fields: {
          id: 'String @id @default(cuid())',
          activityId: 'String',
          latitude: 'Float',
          longitude: 'Float',
          markerType: 'String',
          visible: 'Boolean @default(true)',
        }
      },
      MapCluster: {
        fields: {
          id: 'String @id @default(cuid())',
          count: 'Int',
          latitude: 'Float',
          longitude: 'Float',
        }
      }
    },
    routes: {
      'GET /api/map/markers': 'Récupérer les marqueurs',
      'GET /api/map/clusters': 'Récupérer les clusters',
      'POST /api/map/filter': 'Filtrer les marqueurs',
      'GET /api/map/tile/:z/:x/:y': 'Tuiles cartographiques',
    },
    validations: {
      latitude: 'required, number',
      longitude: 'required, number',
      markerType: 'required, in:activity,user,restaurant,park',
    }
  },
  {
    moduleName: 'WebActivitySearch',
    displayName: 'Recherche Web d\'Activités',
    description: 'Module de recherche en ligne basé sur Google Maps et moteurs de recherche pour trouver des activités.',
    schema: {
      SearchResult: {
        fields: {
          id: 'String @id @default(cuid())',
          query: 'String',
          source: 'String', // "google_maps", "google_search", "api"
          name: 'String',
          address: 'String?',
          latitude: 'Float',
          longitude: 'Float',
          rating: 'Float?',
          website: 'String?',
          phone: 'String?',
          searchedAt: 'DateTime @default(now())',
        }
      }
    },
    routes: {
      'POST /api/search/activities': 'Rechercher des activités',
      'POST /api/search/nearby-places': 'Lieux à proximité',
      'GET /api/search/details/:placeId': 'Détails d\'un lieu',
      'POST /api/search/google-maps': 'Recherche Google Maps',
      'POST /api/search/cache': 'Résultats en cache',
    },
    validations: {
      query: 'required, min 2, max 255',
      source: 'required, in:google_maps,google_search,api',
      latitude: 'number, min -90, max 90',
      longitude: 'number, min -180, max 180',
    }
  },
]

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { slug } = await params

    // Vérifier que le projet existe
    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true, ownerId: true, slug: true },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier les permissions
    if (project.ownerId !== session.user.id && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Sélectionner les modules selon le projet
    let modulesToCreate: ModuleTemplate[] = DEFAULT_MODULES

    if (project.slug === 'shuffle-life') {
      modulesToCreate = SHUFFLE_LIFE_MODULES
    }

    const createdModules = []

    // Créer les modules
    for (const moduleData of modulesToCreate) {
      try {
        const module = await prisma.projectModuleDefinition.create({
          data: {
            projectId: project.id,
            moduleName: moduleData.moduleName,
            displayName: moduleData.displayName,
            description: moduleData.description,
            schema: moduleData.schema,
            routes: moduleData.routes,
            validations: moduleData.validations,
            generatedBy: 'system',
            aiModel: 'default',
          },
        })

        // Installer le module automatiquement
        const installed = await prisma.projectInstalledModule.create({
          data: {
            projectId: project.id,
            moduleId: module.id,
            enabled: true,
          },
        })

        createdModules.push({
          id: module.id,
          moduleName: module.moduleName,
          displayName: module.displayName,
          installed: true,
        })
      } catch (err: any) {
        // Si le module existe déjà (unique constraint), continuer
        if (err.code === 'P2002') {
          console.log(`Module ${moduleData.moduleName} already exists`)
          continue
        }
        throw err
      }
    }

    return NextResponse.json({
      success: true,
      message: `${createdModules.length} module(s) initialisé(s)`,
      modules: createdModules,
    })
  } catch (error) {
    console.error('Error initializing project modules:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'initialisation des modules' },
      { status: 500 }
    )
  }
}
