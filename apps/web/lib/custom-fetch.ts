import axios from 'axios'
import https from 'https'

// Agent HTTPS qui ignore les certificats SSL (dev seulement)
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    family: 4, // Forcer IPv4
})

// Custom fetch utilisant axios pour contourner les problèmes undici
export async function customFetch(url: string | URL | Request, init?: RequestInit): Promise<Response> {
    try {
        const urlString = url.toString()
        
        const response = await axios({
            url: urlString,
            method: (init?.method || 'GET') as any,
            headers: init?.headers as any,
            data: init?.body,
            timeout: 30000,
            httpsAgent,
            validateStatus: () => true, // Ne pas throw sur erreurs HTTP
        })

        // Convertir la réponse axios en Response
        return new Response(JSON.stringify(response.data), {
            status: response.status,
            statusText: response.statusText,
            headers: new Headers(response.headers as any),
        })
    } catch (error: any) {
        console.error('[custom-fetch] Error:', error.code || error.message, 'URL:', error.config?.url)
        throw error
    }
}

// Remplacer le fetch global en développement
if (process.env.NODE_ENV === 'development' && typeof global !== 'undefined') {
    // @ts-ignore
    global.fetch = customFetch
}
