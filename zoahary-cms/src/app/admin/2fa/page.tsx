"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";

export default function TwoFactorSetup() {
  const { data: session, update } = useSession();
  const [qrCode, setQrCode] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"check" | "setup" | "verify" | "complete">("check");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setIs2FAEnabled(session.user.twoFactorEnabled);
      setStep(session.user.twoFactorEnabled ? "complete" : "setup");
    }
  }, [session]);

  const handleDisable2FA = async () => {
    if (!confirm("Êtes-vous sûr de vouloir désactiver le 2FA ? Cela réduira la sécurité de votre compte.")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const res = await fetch("/api/2fa/disable", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Erreur lors de la désactivation");

      const data = await res.json();
      
      // Mettre à jour la session NextAuth avec les nouvelles valeurs
      await update({
        twoFactorEnabled: data.twoFactorEnabled,
        twoFactorVerified: data.twoFactorVerified
      });
      
      // Mettre à jour les états locaux
      setIs2FAEnabled(false);
      setStep("setup");
      setQrCode("");
      setBackupCodes([]);
      setVerificationCode("");
      
      // Recharger la page pour refléter les changements
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    try {
      setLoading(true);
      setError("");
      
      const res = await fetch("/api/2fa/setup", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Erreur lors de la configuration");

      const data = await res.json();
      setQrCode(data.qrCode);
      setBackupCodes(data.backupCodes);
      setStep("verify");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationCode }),
      });

      if (!res.ok) throw new Error("Code invalide");

      setStep("complete");
      setIs2FAEnabled(true);
      
      // Recharger la page pour mettre à jour la session
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Veuillez vous connecter pour configurer la 2FA</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Double Authentification (2FA)
          </h2>
        </div>

        {step === "setup" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 mb-4">
              La double authentification ajoute une couche de sécurité supplémentaire à votre compte.
            </p>
            <button
              onClick={handleSetup}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Configuration..." : "Activer la 2FA"}
            </button>
          </div>
        )}

        {step === "verify" && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Scannez ce QR code avec Google Authenticator ou une application similaire :
              </p>
              {qrCode && (
                <div className="flex justify-center">
                  <Image src={qrCode} alt="QR Code 2FA" width={200} height={200} />
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Codes de récupération (à sauvegarder) :
              </p>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono space-y-1">
                {backupCodes.map((code, i) => (
                  <div key={i} className="text-gray-900">{code}</div>
                ))}
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Code de vérification
                </label>
                <input
                  type="text"
                  id="code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white text-center text-xl tracking-widest font-mono"
                  placeholder="000000"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "Vérification..." : "Vérifier"}
              </button>
            </form>
          </div>
        )}

        {step === "complete" && is2FAEnabled && (
          <div className="bg-white p-6 rounded-lg shadow text-center space-y-4">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              2FA est activée
            </h3>
            <p className="text-gray-600">
              Votre compte est protégé par la double authentification.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleDisable2FA}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? "Désactivation..." : "Désactiver le 2FA"}
              </button>
              <a
                href="/admin"
                className="block text-blue-600 hover:text-blue-700"
              >
                Retour au tableau de bord
              </a>
            </div>
          </div>
        )}

        {step === "complete" && !is2FAEnabled && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              2FA activée avec succès !
            </h3>
            <p className="text-gray-600 mb-4">
              Votre compte est maintenant protégé par la double authentification.
            </p>
            <p className="text-sm text-amber-600 mb-4">
              ⚠️ Déconnectez-vous et reconnectez-vous pour tester le 2FA.
            </p>
            <a
              href="/admin"
              className="inline-block text-blue-600 hover:text-blue-700"
            >
              Retour au tableau de bord
            </a>
          </div>
        )}

        {error && step === "setup" && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
