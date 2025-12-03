import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configuration pour utiliser WebSocket sur le port 443
// Cela permet de contourner le blocage du port 5432 par les pare-feux/routeurs
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = "password";

export { neonConfig };
