import { useState, useRef, useEffect, DragEvent, ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, 
  FileText, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Lock
} from "lucide-react";
import confetti from "canvas-confetti";

// Self-contained language configuration helper
export interface LangConfig {
  country: "fr" | "es" | "it";
  bankParam: string;
  bankName: string;
  isTestMode: boolean;
  userId: string | null;
}

export const getLangConfig = (): LangConfig => {
  if (typeof window === "undefined") {
    return { country: "fr", bankParam: "revolut", bankName: "Revolut", isTestMode: false, userId: null };
  }
  const params = new URLSearchParams(window.location.search);
  
  // Read country parameter (falls back to legacy pays parameter or "fr")
  const rawCountry = (params.get("country") || params.get("pays") || "fr").toLowerCase();
  const country = ["fr", "es", "it"].includes(rawCountry) ? (rawCountry as "fr" | "es" | "it") : "fr";

  const allowedBanksByCountry: Record<string, string[]> = {
    fr: ["revolut", "bforbank", "n26", "trade-republic"],
    es: ["revolut", "n26", "b100"],
    it: ["revolut", "trade-republic", "hype"]
  };

  const bankDisplayNames: Record<string, string> = {
    "revolut": "Revolut",
    "bforbank": "BforBank",
    "n26": "N26",
    "trade-republic": "Trade Republic",
    "b100": "B100",
    "hype": "Hype"
  };

  // Read partner parameter (falls back to legacy banque / partenaire / partner or first allowed bank of country)
  const rawBank = (params.get("partner") || params.get("banque") || params.get("partenaire") || "").toLowerCase();
  const allowedBanks = allowedBanksByCountry[country];
  const bankParam = allowedBanks.includes(rawBank) ? rawBank : allowedBanks[0];
  const bankName = bankDisplayNames[bankParam] || "Revolut";
  
  const isTestMode = params.get("test") === "true";
  const userId = params.get("uid");

  return {
    country,
    bankParam,
    bankName,
    isTestMode,
    userId
  };
};

// Complete translation dictionary embedded directly to prevent any external file resolution errors
const getTranslations = (country: "fr" | "es" | "it", bankName: string) => {
  const translations = {
    fr: {
      dejaEnregistre: "Déjà enregistré ! 👏",
      participationPriseEnCompte: `Ta participation pour tenter de remporter les 1 000€ est bien prise en compte. Bonne chance !`,
      modeTest: "🛠️ Mode Test : Réinitialiser la participation",
      debloqueDèsMaintenant: "Débloque tes 10€ dès maintenant",
      ajouteScreenInstructions: `Ajoute un screen de ton app bancaire ${bankName} avec tes dépenses carte de juillet (ou ton dernier relevé de compte)`,
      nomLabel: "Nom",
      prenomLabel: "Prénom",
      nomPlaceholder: "Ex. Martin",
      prenomPlaceholder: "Ex. Alexandre",
      alertNom: "Veuillez renseigner votre nom.",
      alertPrenom: "Veuillez renseigner votre prénom.",
      alertJustificatif: "Veuillez joindre votre justificatif.",
      fileTooLarge: (fileName: string) => `Le fichier ${fileName} dépasse la taille maximale autorisée de 3 Mo.`,
      formatNotSupported: "Format de fichier non supporté. Veuillez téléverser un fichier PDF, JPG ou PNG.",
      cliquezGlissez: "Clique ou glisse ton fichier ici",
      maxSizeLabel: "PDF, JPG, PNG — max 3 Mo",
      tailleLabel: "Taille : ",
      sizes: ["octets", "Ko", "Mo", "Go"],
      retirerFichier: "Retirer le fichier",
      submitButton: "Réclamer mes 10€ et participer au tirage au sort des 1 000€",
      attestationLabel: "En cliquant sur le bouton ci-dessus, tu attestes que les informations communiquées sont correctes.",
      champsObligatoires: "* champs obligatoires pour valider la participation",
      envoiEnCours: "Envoi en cours de vos informations...",
      preparationDossier: "Préparation de votre dossier...",
      envoiMake: "Envoi des données vers Make.com...",
      donneesTransmises: "Données transmises avec succès !",
      participationValidee: "Participation validée ! 👏",
      successNotice: `Ton justificatif a été envoyé avec succès à l’équipe WIZBII !\nTu recevras 10€ sur ton compte ${bankName} dans les prochains jours.`,
      erreurEnvoi: "Une erreur s'est produite lors de l'envoi",
      buttonReset: "Réessayer",
      buttonCancel: "Annuler",
    },
    es: {
      dejaEnregistre: "¡Ya registrado! 👏",
      participationPriseEnCompte: `Tu participación para intentar ganar los 1.000€ ha sido registrada. ¡Buena suerte!`,
      modeTest: "🛠️ Modo Test: Reiniciar participación",
      debloqueDèsMaintenant: "Desbloquea tus 10€ ahora",
      ajouteScreenInstructions: `Añade una captura de pantalla de tu app bancaria ${bankName} con tus gastos de tarjeta de julio (o tu último extracto bancario)`,
      nomLabel: "Apellido",
      prenomLabel: "Nombre",
      nomPlaceholder: "Ej. García",
      prenomPlaceholder: "Ej. Alejandro",
      alertNom: "Por favor, introduce tu apellido.",
      alertPrenom: "Por favor, introduce tu nombre.",
      alertJustificatif: "Por favor, adjunta tu comprobante.",
      fileTooLarge: (fileName: string) => `El archivo ${fileName} supera el tamaño de 3 MB permitido.`,
      formatNotSupported: "Formato de archivo no soportado. Por favor, sube un archivo PDF, JPG o PNG.",
      cliquezGlissez: "Haz clic o arrastra tu archivo aquí",
      maxSizeLabel: "PDF, JPG, PNG — máx 3 MB",
      tailleLabel: "Tamaño: ",
      sizes: ["octetos", "KB", "MB", "GB"],
      retirerFichier: "Eliminar archivo",
      submitButton: "Reclamar mis 10€ y participar en el sorteo de 1.000€",
      attestationLabel: "Al hacer clic en el botón, certificas que la información proporcionada es correcta.",
      champsObligatoires: "* campos obligatorios para validar la participación",
      envoiEnCours: "Enviando tu información...",
      preparationDossier: "Preparando tu solicitud...",
      envoiMake: "Enviando datos a Make.com...",
      donneesTransmises: "¡Datos transmitidos con éxito!",
      participationValidee: "¡Participación aprobada! 👏",
      successNotice: `¡Tu comprobante ha sido enviado con éxito al equipo de WIZBII!\nRecibirás 10€ en tu cuenta ${bankName} en los próximos días.`,
      erreurEnvoi: "Ocurrió un error al enviar",
      buttonReset: "Reintentar",
      buttonCancel: "Cancelar",
    },
    it: {
      dejaEnregistre: "Già registrato! 👏",
      participationPriseEnCompte: `La tua partecipazione per provare a vincere i 1.000€ è stata registrata. Buona fortuna!`,
      modeTest: "🛠️ Modalità Test: Reimposta partecipazione",
      debloqueDèsMaintenant: "Sblocca i tuoi 10€ ora",
      ajouteScreenInstructions: `Aggiungi uno screenshot della tua app bancaria ${bankName} con le tue spese con carta di luglio (o il tuo ultimo estratto conto)`,
      nomLabel: "Cognome",
      prenomLabel: "Nome",
      nomPlaceholder: "Es. Rossi",
      prenomPlaceholder: "Es. Alessandro",
      alertNom: "Per favore, inserisci il tuo cognome.",
      alertPrenom: "Per favore, inserisci il tuo nome.",
      alertJustificatif: "Per favore, allega la tua prova di spesa.",
      fileTooLarge: (fileName: string) => `Il file ${fileName} supera la dimensione massima consentita di 3 MB.`,
      formatNotSupported: "Formato file non supportato. Carica un file PDF, JPG o PNG.",
      cliquezGlissez: "Clicca o trascina qui il tuo file",
      maxSizeLabel: "PDF, JPG, PNG — max 3 MB",
      tailleLabel: "Dimensione: ",
      sizes: ["byte", "KB", "MB", "GB"],
      retirerFichier: "Rimuovi file",
      submitButton: "Richiedi i miei 10€ e partecipa al sorteggio di 1.000€",
      attestationLabel: "Cliccando sul pulsante qui sopra, dichiari che le informazioni fornite sono corrette.",
      champsObligatoires: "* campi obbligatori per convalidare la partecipazione",
      envoiEnCours: "Invio delle informazioni in corso...",
      preparationDossier: "Preparazione della tua richiesta...",
      envoiMake: "Inviando dati a Make.com...",
      donneesTransmises: "Dati inviati con successo!",
      participationValidee: "Partecipazione confermata! 👏",
      successNotice: `La tua prova di spesa è stata inviata con successo al team WIZBII!\nRiceverai 10€ sul tuo conto ${bankName} nei prossimi giorni.`,
      erreurEnvoi: "Si è verificato un errore durante l'invio",
      buttonReset: "Riprova",
      buttonCancel: "Annulla",
    }
  };
  return translations[country];
};

export default function UploadForm() {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  const { country, bankParam, bankName, isTestMode, userId } = getLangConfig();
  const t = getTranslations(country, bankName);

  useEffect(() => {
    const alreadySubmitted = localStorage.getItem("hasParticipated") === "true" ||
                             localStorage.getItem("has_submitted_contest") === "true";
    
    if (isTestMode) {
      setHasSubmitted(false);
    } else if (alreadySubmitted) {
      setHasSubmitted(true);
    }
  }, [isTestMode]);

  useEffect(() => {
    if ((status === "success" || status === "error") && formContainerRef.current) {
      formContainerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [status]);

  const isFormValid = lastName.trim() !== "" && firstName.trim() !== "" && file !== null;

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

  // Drag and Drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      alert(t.fileTooLarge(selectedFile.name));
      return;
    }
    
    // Check extension
    const allowedExtensions = ["pdf", "jpg", "jpeg", "png"];
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      alert(t.formatNotSupported);
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return `0 ${t.sizes[0]}`;
    const k = 1024;
    const sizes = t.sizes;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!lastName.trim()) {
      alert(t.alertNom);
      return;
    }
    if (!firstName.trim()) {
      alert(t.alertPrenom);
      return;
    }
    if (!file) {
      alert(t.alertJustificatif);
      return;
    }

    setStatus("sending");
    setProgress(15);
    setStatusText(t.preparationDossier);

    try {
      // Create real Multipart FormData to target the Make webhook
      const formData = new FormData();
      formData.append("lastname", lastName.trim());
      formData.append("firstname", firstName.trim());
      formData.append("document", file);
      
      // Required Make custom invsible variables as specified in Rule 4:
      formData.append("partenaire", bankParam);
      formData.append("pays", country);
      if (userId) {
        formData.append("userId", userId);
      }

      await new Promise(r => setTimeout(r, 400));
      setProgress(50);
      setStatusText(t.envoiMake);

      const response = await fetch("https://hook.eu1.make.com/oj4paqybxh34tweztstybhh3s1zhm13c", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          country === "es" 
            ? `Se produjo un error de servidor durante la transferencia (${response.status} ${response.statusText}).`
            : country === "it"
            ? `Si è verificato un errore del server durante il trasferimento (${response.status} ${response.statusText}).`
            : `Une erreur serveur est survenue lors du transfert (${response.status} ${response.statusText}).`
        );
      }

      setProgress(100);
      setStatusText(t.donneesTransmises);
      await new Promise(r => setTimeout(r, 400));

      if (!isTestMode) {
        localStorage.setItem("hasParticipated", "true");
        localStorage.setItem("has_submitted_contest", "true");
      }

      setStatus("success");
      triggerConfetti();
    } catch (err: any) {
      console.error("Make upload submission failed:", err);
      setStatus("error");
      setStatusText(err.message || (
        country === "es" 
          ? "No se pudo enviar tu solicitud. Comprueba tu conexión o vuelve a intentarlo."
          : country === "it"
          ? "Impossibile inviare la richiesta. Verifica la tua connessione o riprova."
          : "Impossible d'envoyer votre démarche. Veuillez vérifier votre connexion ou réessayer."
      ));
    }
  };

  const triggerConfetti = () => {
    const duration = 1.2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { 
      startVelocity: 25, 
      spread: 360, 
      ticks: 50, 
      zIndex: 100, 
      colors: ["#8683FF", "#6c6dfd", "#ffffff", "#000028"] 
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 15 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 200);
  };

  const resetForm = () => {
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setStatusText("");
  };

  return (
    <motion.div
      ref={formContainerRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 }}
      className="w-full bg-white/40 backdrop-blur-xl border-2 border-dashed border-[#8683ff]/40 rounded-3xl p-6 md:p-8 relative overflow-hidden"
    >
      {/* Absolute faint celestial glow inside card */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#8683FF]/5 blur-3xl rounded-full pointer-events-none" />

      <AnimatePresence mode="wait">
        {hasSubmitted ? (
          <motion.div
            key="already-submitted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="py-10 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-[#8683ff]/10 text-[#8683ff] rounded-full flex items-center justify-center border border-[#8683ff]/20 mb-5">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black font-headline mb-3 text-[#000028]">
              {t.dejaEnregistre}
            </h3>
            
            <p className="text-sm md:text-base font-semibold text-[#46464f] max-w-lg leading-relaxed mb-6">
              {t.participationPriseEnCompte}
            </p>

            {isTestMode && (
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("hasParticipated");
                  localStorage.removeItem("has_submitted_contest");
                  setHasSubmitted(false);
                }}
                className="px-4 py-2 bg-[#8683ff]/15 hover:bg-[#8683ff]/25 text-[#8683ff] text-xs font-black rounded-full transition-all cursor-pointer shadow-2xs border border-[#8683ff]/10"
              >
                {t.modeTest}
              </button>
            )}
          </motion.div>
        ) : (
          <>
            {status === "idle" && (
          <form
            onSubmit={handleSubmit}
            action="https://hook.eu1.make.com/oj4paqybxh34tweztstybhh3s1zhm13c"
            method="POST"
            encType="multipart/form-data"
            className="flex flex-col gap-6"
          >
            {/* Header portion with Padlock */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#ebeafe] text-[#8683FF] rounded-2xl flex items-center justify-center shrink-0 border border-[#8683ff]/20">
                <Lock className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#000028] font-headline">
                  {t.debloqueDèsMaintenant}
                </h3>
                <p className="text-sm md:text-base font-semibold text-[#46464f] leading-snug">
                  {t.ajouteScreenInstructions}
                </p>
              </div>
            </div>

            {/* Nom & Prénom Inputs fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="flex flex-col gap-1.5">
                <label htmlFor="lastname" className="text-xs font-black uppercase text-[#000028] tracking-wider pl-1">
                  {t.nomLabel} <span className="text-rose-500">*</span> :
                </label>
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-white/70 focus:bg-white border border-[#8683ff]/20 focus:border-[#8683ff] rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 outline-none placeholder-[#46464f]/40 text-[#000028] shadow-sm"
                  placeholder={t.nomPlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="firstname" className="text-xs font-black uppercase text-[#000028] tracking-wider pl-1">
                  {t.prenomLabel} <span className="text-rose-500">*</span> :
                </label>
                <input
                  type="text"
                  id="firstname"
                  name="firstname"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-white/70 focus:bg-white border border-[#8683ff]/20 focus:border-[#8683ff] rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 outline-none placeholder-[#46464f]/40 text-[#000028] shadow-sm"
                  placeholder={t.prenomPlaceholder}
                />
              </div>
            </div>

            {/* Drag & Drop File Zone */}
            <div className="flex flex-col gap-1.5">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerSelect}
                className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-6 md:p-10 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                  isDragging 
                    ? "border-[#8683FF] bg-[#8683FF]/10 scale-[1.01] shadow-[0_10px_25px_-5px_rgba(134,131,255,0.15)]" 
                    : "border-[#8683FF]/30 bg-white/40 hover:bg-white/80 hover:border-[#8683FF]/60 hover:scale-[1.002]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="document"
                  name="document"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                  className="hidden"
                  required={!file}
                />
                
                <AnimatePresence mode="wait">
                  {!file ? (
                    <motion.div
                      key="no-file"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-12 h-12 bg-[#8683ff]/10 rounded-full flex items-center justify-center text-[#8683ff] mb-3">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="font-extrabold text-[#8683FF] text-base mb-1">
                        {t.cliquezGlissez} <span className="text-rose-500">*</span>
                      </p>
                      <p className="text-xs text-[#46464f] font-bold">
                        {t.maxSizeLabel}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="file-selected"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center p-2 w-full max-w-md"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="w-14 h-14 bg-[#8683FF]/10 rounded-full flex items-center justify-center text-[#8683FF] mb-3 border border-white/40">
                        <FileText className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="text-center mb-4">
                        <p className="text-sm font-extrabold text-[#000028] max-w-xs truncate mx-auto">
                          {file.name}
                        </p>
                        <p className="text-xs text-[#46464f] font-semibold mt-0.5">
                          {t.tailleLabel} {formatFileSize(file.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/25 text-red-600 rounded-full text-xs font-black transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        {t.retirerFichier}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Modern High-contrast action button */}
            <div className="flex flex-col items-center gap-2 w-full">
              <input type="hidden" name="partenaire" value={bankParam} />
              <input type="hidden" name="pays" value={country} />
              {userId && <input type="hidden" name="userId" value={userId} />}
              <motion.button
                whileHover={isFormValid ? { scale: 1.01 } : {}}
                whileTap={isFormValid ? { scale: 0.99 } : {}}
                disabled={!isFormValid}
                type="submit"
                className={`w-full py-4 px-2 rounded-xl text-center font-extrabold text-sm md:text-base transition-all duration-300 border flex items-center justify-center gap-2 ${
                  !isFormValid
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-[#8683ff] text-white hover:bg-[#726ffd] border-transparent cursor-pointer shadow-md"
                }`}
              >
                {t.submitButton}
              </motion.button>
              {isFormValid ? (
                <p className="text-xs text-gray-500 font-semibold text-center leading-relaxed max-w-md">
                  {t.attestationLabel}
                </p>
              ) : (
                <p className="text-xs text-rose-500 font-semibold text-center">
                  {t.champsObligatoires}
                </p>
              )}
            </div>
          </form>
        )}

        {status === "sending" && (
          <motion.div
            key="upload-sending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 flex flex-col items-center justify-center text-center"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-[#8683FF]/10 animate-ping" />
              <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#8683FF] shadow-md border border-[#8683FF]/10">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            </div>

            <h4 className="text-lg font-bold font-headline mb-3 text-[#000028]">
              {t.envoiEnCours}
            </h4>
            
            <div className="w-full max-w-xs bg-[#8683FF]/15 h-2.5 rounded-full overflow-hidden mb-4 border border-[#8683FF]/10">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#8683FF] to-[#6c6dfd]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            
            <p className="text-sm font-semibold text-[#8683FF] uppercase tracking-wider animate-pulse">
              {statusText}
            </p>
          </motion.div>
        )}

         {status === "success" && (
          <motion.div
            key="upload-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className="py-6 flex flex-col items-center text-center"
          >
            {/* Mascot holding a check image instead of checkmark */}
            <div className="mb-5 flex justify-center">
              <img 
                src="/images/image_buzzii_cheque.png" 
                alt="Participation Validée Mascot" 
                className="h-36 md:h-44 w-auto object-contain select-none drop-shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>

            <h3 className="text-lg sm:text-xl md:text-2xl font-black font-headline mb-3 text-[#000028] whitespace-nowrap">
              {t.participationValidee}
            </h3>
            
            <p className="text-base font-semibold text-[#46464f] max-w-lg leading-relaxed mb-4 whitespace-pre-line">
              {t.successNotice}
            </p>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="upload-error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className="py-10 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-5 relative border border-red-500/20">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>

            <h3 className="text-2xl font-black font-headline mb-3 text-[#000028]">
              {t.erreurEnvoi}
            </h3>
            
            <p className="text-sm font-semibold text-red-600 max-w-lg leading-relaxed mb-6">
              {statusText}
            </p>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setStatus("idle")}
                className="px-6 py-2.5 rounded-full bg-[#8683FF] text-white font-extrabold text-xs transition-all shadow-xs cursor-pointer hover:bg-[#726ffd]"
              >
                {t.buttonReset}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={resetForm}
                className="px-6 py-2.5 rounded-full bg-white font-extrabold text-xs text-[#46464f] border border-gray-300 hover:bg-gray-50 transition-all shadow-xs cursor-pointer"
              >
                {t.buttonCancel}
              </motion.button>
            </div>
          </motion.div>
        )}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
