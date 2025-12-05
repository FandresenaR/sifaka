import 'dotenv/config'

console.log('\n🔍 Vérification de la configuration NextAuth\n')

const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'AUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
]

let hasErrors = false

requiredVars.forEach(varName => {
  const value = process.env[varName]
  const exists = !!value
  const masked = value ? `${value.substring(0, 10)}...` : 'NON DÉFINI'
  
  if (exists) {
    console.log(`✅ ${varName}: ${masked}`)
  } else {
    console.log(`❌ ${varName}: ${masked}`)
    hasErrors = true
  }
})

console.log('\n📋 Configuration Google OAuth requise :')
console.log('   1. Allez sur: https://console.cloud.google.com/apis/credentials')
console.log('   2. Sélectionnez votre Client ID OAuth 2.0')
console.log('   3. Ajoutez ces URIs de redirection autorisées:')
console.log('      - http://localhost:3000/api/auth/callback/google')
console.log('      - http://localhost:3000')
console.log('')

if (hasErrors) {
  console.log('❌ Certaines variables d\'environnement sont manquantes\n')
  process.exit(1)
} else {
  console.log('✅ Toutes les variables d\'environnement sont définies\n')
}
