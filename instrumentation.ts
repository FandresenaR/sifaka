// Configure undici pour forcer IPv4 (évite les problèmes de timeout IPv6)

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { Agent, setGlobalDispatcher } = await import('undici')
        const dns = await import('dns')
        
        dns.setDefaultResultOrder('ipv4first')
        
        setGlobalDispatcher(new Agent({
            connect: { family: 4, timeout: 30000 },
        }))
    }
}
