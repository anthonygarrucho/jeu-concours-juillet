import { useState, useRef, useEffect, DragEvent, ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, 
  FileText, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  Clock
} from "lucide-react";
import confettiModule from "canvas-confetti";

const confetti = confettiModule.create(undefined, { resize: true, useWorker: false });

interface LangConfig {
  country: "fr" | "es" | "it";
  bankParam: string;
  bankName: string;
  isTestMode: boolean;
  userId: string | null;
}

const getLangConfig = (): LangConfig => {
  if (typeof window === "undefined") {
    return { country: "fr", bankParam: "revolut", bankName: "Revolut", isTestMode: false, userId: null };
  }
  const params = new URLSearchParams(window.location.search);
  
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

  const rawBank = params.get("partner") || params.get("banque") || params.get("partenaire") || "";
  const cleanBankParam = rawBank.toLowerCase().trim();
  const allowedBanks = allowedBanksByCountry[country];
  const bankParam = allowedBanks.includes(cleanBankParam) ? cleanBankParam : (cleanBankParam || allowedBanks[0]);
  
  let bankName = "Revolut";
  if (rawBank) {
    const matchedName = bankDisplayNames[cleanBankParam];
    if (matchedName) {
      bankName = matchedName;
    } else {
      bankName = rawBank.charAt(0).toUpperCase() + rawBank.slice(1);
    }
  } else {
    const defaultBank = allowedBanks[0];
    bankName = bankDisplayNames[defaultBank] || (defaultBank.charAt(0).toUpperCase() + defaultBank.slice(1));
  }
  
  const isTestMode = params.get("test") === "true";
  const userId = params.get("userId") || params.get("userid") || params.get("uid") || params.get("USERID");

  return {
    country,
    bankParam,
    bankName,
    isTestMode,
    userId
  };
};

const staticTranslations = {
  "fr": {
    "badge": "Jeu 100% gagnant",
    "hero_desc": "WIZBII te rembourse 10€ sur tes dépenses de juillet avec ta carte {NomDeLaBanque} ! Et tente de remporter les 1000€ mis en jeu 😱",
    "animation_amount": "1 000€",
    "animation_text": "à gagner",
    "how_it_works_title": "Comment ça marche ?",
    "step_spend": "Dépense : utilise ta carte {NomDeLaBanque} (physique ou virtuelle) pour tes dépenses de juillet (min. 10€ requis)",
    "step_send": "Envoie : télécharge ta preuve de dépense via le formulaire juste au-dessus",
    "step_cash": "Encaisse : reçois tes 10€ ET tente de gagner les 1 000€ en jeu",
    "legal_notice": "* Offre valable sous réserve de vérification des dépenses. Le remboursement de 10€ est garanti pour tout participant éligible. Le virement de 1 000€ sera attribué par tirage au sort parmi les participants vérifiés.",
    "view_rules": "Consulter le règlement complet",
    "countdown_title": "Temps restant pour envoyer ton justificatif :",
    "countdown_units": "Jours / Heures / Minutes / Secondes",
    "already_registered_title": "Déjà enregistré ! 👏",
    "already_registered_desc": "Ta participation pour tenter de remporter les 1 000€ est bien prise en compte. Bonne chance !",
    "form_title": "Débloque tes 10€ dès maintenant",
    "form_subtitle": "Ajoute un screen de ton app bancaire {NomDeLaBanque} avec tes dépenses carte de juillet (ou ton dernier relevé de compte)",
    "label_lastname": "Nom * :",
    "label_firstname": "Prénom * :",
    "placeholder_lastname": "Ex. Martin",
    "placeholder_firstname": "Ex. Alexandre",
    "drag_drop_zone": "Clique ou glisse ton fichier ici *",
    "file_limits": "PDF, JPG, PNG — max 3 Mo",
    "submit_button": "Réclamer mes 10€ et participer au tirage au sort des 1 000€",
    "submit_disclaimer": "En cliquant sur le bouton ci-dessus, tu attestes que les informations communiquées sont correctes.",
    "fields_mandatory": "* champs obligatoires pour valider la participation",
    "error_lastname": "Veuillez renseigner votre nom.",
    "error_firstname": "Veuillez renseigner votre prénom.",
    "error_file": "Veuillez joindre votre justificatif.",
    "error_file_size": "Le fichier {NomDuFichier} dépasse la taille maximale autorisée de 3 Mo.",
    "error_file_format": "Format de fichier non supporté. Veuillez téléverser un fichier PDF, JPG ou PNG.",
    "success_title": "Participation validée ! 👏",
    "success_desc": "Ton justificatif a été envoyé avec succès à l’équipe WIZBII ! Tu recevras 10€ sur ton compte {NomDeLaBanque} dans les prochains jours.",
    "error_global": "Une erreur s'est produite lors de l'envoi",
    "btn_retry": "Réessayer",
    "btn_cancel": "Annuler",
    "emailLabel": "Adresse e-mail * :",
    "emailPlaceholder": "Ex. alexandre@email.com",
    "alertEmailMissing": "Veuillez renseigner votre adresse e-mail.",
    "alertEmailInvalid": "Veuillez renseigner une adresse e-mail valide (ex: un@email.com).",
    "sizes": ["octets", "Ko", "Mo", "Go"],
    "tailleLabel": "Taille : ",
    "retirerFichier": "Retirer le fichier",
    "acceptRulesPart1": "J’accepte le ",
    "acceptRulesLink": "règlement du jeu concours",
    "acceptRulesPart2": "",
    "envoiEnCours": "Envoi en cours de vos informations...",
    "preparationDossier": "Préparation de votre dossier...",
    "envoiMake": "Envoi des données vers Make.com...",
    "donneesTransmises": "Données transmises avec succès !",
    "modeTest": "🛠️ Mode Test : Réinitialiser la participation",
    "clickToParticipate": "Clique pour participer !"
  },
  "es": {
    "badge": "Sorteo con premio 100% asegurado",
    "hero_desc": "¡WIZBII te regala 10 € por tus compras de julio con tu tarjeta {NombreDelBanco}! Y además participa en un sorteo de 1.000 € 😱",
    "animation_amount": "1.000€",
    "animation_text": "en juego",
    "how_it_works_title": "¿Cómo funciona?",
    "step_spend": "Compra: utiliza tu tarjeta {NombreDelBanco} (física o virtual) para realizar compras durante el mes de julio (importe mínimo de 10 €)",
    "step_send": "Envía: sube el justificante de tu compra a través del formulario que encontrarás justo arriba",
    "step_cash": "Recibe: consigue un reembolso de 10 € Y participa en el sorteo de un premio de 1.000 €",
    "legal_notice": "*Promoción válida previa verificación de las compras realizadas. El reembolso de 10 € está garantizado para todos los participantes que cumplan los requisitos de la promoción. El premio de 1.000 € se adjudicará mediante sorteo entre las participaciones valadas.",
    "view_rules": "Consultar las bases legales del concurso",
    "countdown_title": "Tiempo restante para enviar tu justificante:",
    "countdown_units": "Días / Horas / Minutos / Segundos",
    "already_registered_title": "¡Registrado! 👏",
    "already_registered_desc": "Tu participación en el sorteo de 1.000 € ha quedado registrada. ¡Mucha suerte!",
    "form_title": "Desbloquea tus 10€ ahora",
    "form_subtitle": "Sube una captura de pantalla de la app de tu banco {NombreDelBanco} donde se vean las compras realizadas con tu tarjeta en julio (o tu último extracto bancario)",
    "label_lastname": "Apellido* :",
    "label_firstname": "Nombre* :",
    "placeholder_lastname": "Ej. García",
    "placeholder_firstname": "Ej. Alejandro",
    "drag_drop_zone": "Haz clic o arrastra tu archivo aquí*",
    "file_limits": "PDF, JPG, PNG — máx 3 MB",
    "submit_button": "Reclamar mis 10€ y participar en el sorteo de 1.000€",
    "submit_disclaimer": "Al hacer clic en el botón de arriba, confirmas que la información facilitada es correcta.",
    "fields_mandatory": "*campos obligatorios para validar la participación",
    "error_lastname": "Por favor, introduce tu apellido.",
    "error_firstname": "Por favor, introduce tu nombre.",
    "error_file": "Por favor, adjunta tu justificante.",
    "error_file_size": "El archivo {NomDuFichier} supera el tamaño de 3 MB permitido.",
    "error_file_format": "Formato de archivo no válido. Por favor, sube un archivo PDF, JPG o PNG.",
    "success_title": "¡Participación registrada! 👏",
    "success_desc": "¡Tu justificante ha sido enviado con éxito al equipo de WIZBII! Recibirás 10€ en tu cuenta {NombreDelBanco} en los próximos días.",
    "error_global": "No se ha podido completar el envío.",
    "btn_retry": "Reintentar",
    "btn_cancel": "Cancelar",
    "emailLabel": "Correo electrónico * :",
    "emailPlaceholder": "Ej. alejandro@email.com",
    "alertEmailMissing": "Por favor, introduce tu correo electrónico.",
    "alertEmailInvalid": "Por favor, introduce un correo electrónico válido (ej: un@email.com).",
    "sizes": ["octetos", "KB", "MB", "GB"],
    "tailleLabel": "Tamaño: ",
    "retirerFichier": "Eliminar archivo",
    "acceptRulesPart1": "Acepto las ",
    "acceptRulesLink": "bases del concurso",
    "acceptRulesPart2": "",
    "envoiEnCours": "Enviando tu información...",
    "preparationDossier": "Preparando tu solicitud...",
    "envoiMake": "Enviando datos a Make.com...",
    "donneesTransmises": "¡Datos transmitidos con éxito!",
    "modeTest": "🛠️ Modo Test: Reiniciar participación",
    "clickToParticipate": "¡Haz clic para participar!"
  },
  "it": {
    "badge": "Gioco 100% vincente",
    "hero_desc": "WIZBII ti rimborsa 10€ sulle tue spese di luglio con la tua carta {NomDeLaBanque} ! E prova a vincere i 1.000€ in palio 😱",
    "animation_amount": "1.000€",
    "animation_text": "in palio",
    "how_it_works_title": "Come funziona?",
    "step_spend": "Spendi: usa la tua carta {NomDeLaBanque} (fisica o virtuale) per le tue spese di luglio (min. 10€ richiesti)",
    "step_send": "Invia: carica la tua prova di spesa tramite il modulo qui sopra",
    "step_cash": "Incassa: ricevi i tuoi 10€ E prova a vincere i 1.000€ in palio",
    "legal_notice": "* Offerta valida subordinatamente alla verifica delle spese. Il rimborso de 10€ è garantito per tutti i partecipanti idonei. Il premio di 1.000€ sarà assegnato tramite sorteggio tra i partecipanti verificati.",
    "view_rules": "Consulta il regolamento completo",
    "countdown_title": "Tempo rimasto per inviare la tua prova di spesa:",
    "countdown_units": "Giorni / Ore / Minuti / Secondi",
    "already_registered_title": "Già registrato! 👏",
    "already_registered_desc": "La tua partecipazione per provare a vincere i 1.000€ è stata registrata. Buona fortuna!",
    "form_title": "Sblocca i tuoi 10€ ora",
    "form_subtitle": "Aggiungi uno screenshot della tua app bancaria {NomDeLaBanque} con le tue spese di luglio con carta (o il tuo ultimo estratto conto)",
    "label_lastname": "Cognome * :",
    "label_firstname": "Nome * :",
    "placeholder_lastname": "Es. Rossi",
    "placeholder_firstname": "Es. Alessandro",
    "drag_drop_zone": "Clicca o trascina qui il tuo file *",
    "file_limits": "PDF, JPG, PNG — max 3 MB",
    "submit_button": "richiedi i tuoi 10€ e partecipa al sorteggio di 1000€",
    "submit_disclaimer": "Cliccando sul pulsante qui sopra, dichiari che le informazioni fornite sono corrette.",
    "fields_mandatory": "* campi obbligatori per convalidare la partecipazione",
    "error_lastname": "Per favore, inserisci il tuo cognome.",
    "error_firstname": "Per favore, inserisci il tuo nome.",
    "error_file": "Per favore, allega la tua prova di spesa.",
    "error_file_size": "Il file {NomDuFichier} supera la dimensione massima consentita di 3 MB.",
    "error_file_format": "Formato file non supportato. Carica un file PDF, JPG o PNG.",
    "success_title": "Partecipazione confermata! 👏",
    "success_desc": "La tua prova di spesa è stata inviata con successo al team WIZBII! Riceverai 10€ sul tuo conto {NomDeLaBanque} nei prochains giorni.",
    "error_global": "Si è verificato un errore durante l'invio",
    "btn_retry": "Riprova",
    "btn_cancel": "Annulla",
    "emailLabel": "E-mail * :",
    "emailPlaceholder": "Es. alessandro@email.com",
    "alertEmailMissing": "Per favore, inserisci il tuo indirizzo e-mail.",
    "alertEmailInvalid": "Per favore, inserisci un indirizzo e-mail valido (es: un@email.com).",
    "sizes": ["byte", "KB", "MB", "GB"],
    "tailleLabel": "Dimensione: ",
    "retirerFichier": "Rimuovi file",
    "acceptRulesPart1": "Accetto il ",
    "acceptRulesLink": "regolamento del concorso",
    "acceptRulesPart2": "",
    "envoiEnCours": "Invio delle informazioni in corso...",
    "preparationDossier": "Preparazione della tua richiesta...",
    "envoiMake": "Inviando dati a Make.com...",
    "donneesTransmises": "Dati inviati con successo!",
    "modeTest": "💡 Modalità Test: Reimposta partecipazione",
    "clickToParticipate": "Clicca per partecipare!"
  }
} as const;

function AnimatedPrize({ translations, currentLang }: { translations: any; currentLang: "fr" | "es" | "it" }) {
  const prizeString = translations[currentLang].animation_amount;
  const chars = prizeString.split("").map((c: string) => c === " " ? "\u00A0" : c);

  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const charVariants = {
    hidden: { 
      opacity: 0, 
      y: 50, 
      scale: 0.61 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 12 
      } 
    }
  };

  const badgeVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: 0.5,
        type: "spring",
        stiffness: 140,
        damping: 15
      } 
    }
  };

  const handleScrollToForm = () => {
    const element = document.getElementById("form-container");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onClick={handleScrollToForm}
      className="flex flex-col items-center justify-center select-none py-2 w-full relative z-10 cursor-pointer group active:scale-[0.98] transition-all duration-200"
      title={translations[currentLang].clickToParticipate}
    >
      <div className="flex items-center justify-center relative z-20 group-hover:scale-[1.03] transition-transform duration-300">
        {chars.map((char: string, index: number) => (
          <motion.span
            key={index}
            variants={charVariants}
            className="inline-block text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-[#000028] tracking-tighter"
            style={{ 
              textShadow: "0.03em 0.03em 0px #8386ff, 0.07em 0.07em 0px #ffffff",
              WebkitFontSmoothing: "antialiased" 
            }}
          >
            {char}
          </motion.span>
        ))}
      </div>

      <motion.div
        variants={badgeVariants}
        className="bg-[#8386ff] rounded-[24px] px-8 py-2 md:px-11 md:py-3.5 -mt-2 md:-mt-3 relative z-10 shadow-md shadow-[#8386ff]/30 border-2 border-white group-hover:scale-105 transition-transform duration-300"
      >
        <span className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-black uppercase tracking-wider">
          {translations[currentLang].animation_text}
        </span>
      </motion.div>
    </motion.div>
  );
}

function CountdownTimer({ translations, currentLang }: { translations: any; currentLang: "fr" | "es" | "it" }) {
  const targetDate = new Date(2026, 6, 31, 23, 59, 59).getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCompleted: false,
  });

  const units = (translations[currentLang].countdown_units || "Jours / Heures / Minutes / Secondes").split("/").map((u: string) => u.trim());
  const daysLabel = units[0] || "Jours";
  const hoursLabel = units[1] || "Heures";
  const minutesLabel = units[2] || "Minutes";
  const secondsLabel = units[3] || "Secondes";

  useEffect(() => {
    function calculateTime() {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isCompleted: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (difference % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isCompleted: false,
      });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const timeBlocks = [
    { label: daysLabel, value: timeLeft.days },
    { label: hoursLabel, value: timeLeft.hours },
    { label: minutesLabel, value: timeLeft.minutes },
    { label: secondsLabel, value: timeLeft.seconds },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.02 }}
      className="bg-white rounded-3xl p-4 md:p-5 border border-white flex flex-col items-center shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
      id="countdown-container"
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-[#8386ff] animate-pulse" />
        <span className="text-xs font-extrabold text-[#000028] uppercase tracking-wider text-center">
          {translations[currentLang].countdown_title}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-sm">
        {timeBlocks.map((block, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center bg-[#fcfaff] border border-gray-100 rounded-2xl py-2 px-1 sm:py-2.5 shadow-3xs"
          >
            <div className="text-lg sm:text-xl md:text-2xl font-black text-[#8386ff] tracking-tight font-mono">
              {String(block.value).padStart(2, "0")}
            </div>
            <div className="text-[9px] md:text-[10px] font-bold text-[#46464f]/70 uppercase mt-0.5">
              {block.label}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

export default function UploadForm() {
  const [lastName, setLastName] = useState(urlParams?.get("lastname") || urlParams?.get("nom") || "");
  const [firstName, setFirstName] = useState(urlParams?.get("firstname") || urlParams?.get("prenom") || "");
  const [email, setEmail] = useState(urlParams?.get("email") || "");
  const [emailTouched, setEmailTouched] = useState(false);
  const [acceptRules, setAcceptRules] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  const { country, bankParam, bankName, isTestMode, userId } = getLangConfig();
  const currentLang = country;

  const translations = (() => {
    const formatted: any = {};
    for (const lang of ["fr", "es", "it"] as const) {
      formatted[lang] = {};
      const dict = staticTranslations[lang];
      for (const [key, value] of Object.entries(dict)) {
        if (typeof value === "string") {
          let replaced = value
            .replace(/{NomDeLaBanque}/g, bankName)
            .replace(/{NombreDelBanco}/g, bankName);
          if (bankName && bankName.toLowerCase() !== "revolut") {
            replaced = replaced.replace(/Revolut/g, bankName);
          }
          formatted[lang][key] = replaced;
        } else {
          formatted[lang][key] = value;
        }
      }
    }
    return formatted;
  })();

  useEffect(() => {
    const titles = {
      fr: `Jeu Concours WIZBII x ${bankName}`,
      es: `Sorteo WIZBII x ${bankName}`,
      it: `Concorso WIZBII x ${bankName}`
    };
    document.title = titles[currentLang] || `Jeu Concours WIZBII x ${bankName}`;
  }, [currentLang, bankName]);

  useEffect(() => {
    const duration = 1.2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 15 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

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

  const isEmailValid = (emailStr: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr.trim());
  };

  const isFormValid = lastName.trim() !== "" && 
                      firstName.trim() !== "" && 
                      email.trim() !== "" && 
                      isEmailValid(email) && 
                      file !== null && 
                      acceptRules;

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

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
      const errorMsg = (translations[currentLang].error_file_size || "")
        .replace(/{NomDuFichier}/g, selectedFile.name);
      alert(errorMsg);
      return;
    }
    
    const allowedExtensions = ["pdf", "jpg", "jpeg", "png"];
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      alert(translations[currentLang].error_file_format);
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
    const sizes = translations[currentLang].sizes;
    if (bytes === 0) return `0 ${sizes[0]}`;
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!lastName.trim()) {
      alert(translations[currentLang].error_lastname);
      return;
    }
    if (!firstName.trim()) {
      alert(translations[currentLang].error_firstname);
      return;
    }
    if (!email.trim()) {
      alert(translations[currentLang].alertEmailMissing);
      return;
    }
    if (!isEmailValid(email)) {
      alert(translations[currentLang].alertEmailInvalid);
      return;
    }
    if (!acceptRules) {
      return;
    }
    if (!file) {
      alert(translations[currentLang].error_file);
      return;
    }

    setStatus("sending");
    setProgress(15);
    setStatusText(translations[currentLang].preparationDossier);

    try {
      const formData = new FormData();
      formData.append("lastname", lastName.trim());
      formData.append("nom", lastName.trim());
      formData.append("firstname", firstName.trim());
      formData.append("prenom", firstName.trim());
      formData.append("email", email.trim());
      formData.append("document", file);
      formData.append("partenaire", bankParam);
      formData.append("pays", country);
      
      if (userId) {
        formData.append("userId", userId);
      }

      await new Promise(r => setTimeout(r, 400));
      setProgress(50);
      setStatusText(translations[currentLang].envoiMake);

      const response = await fetch("https://hook.eu2.make.com/7glv94umw742cdmjvp74j3vlukbqfri2", {
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
      setStatusText(translations[currentLang].donneesTransmises);
      await new Promise(r => setTimeout(r, 400));

      if (!isTestMode) {
        localStorage.setItem("hasParticipated", "true");
        localStorage.setItem("has_submitted_contest", "true");
      }

      setStatus("success");
      triggerSuccessConfetti();
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

  const triggerSuccessConfetti = () => {
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
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 200);
  };

  const resetForm = () => {
    setLastName(urlParams?.get("lastname") || urlParams?.get("nom") || "");
    setFirstName(urlParams?.get("firstname") || urlParams?.get("prenom") || "");
    setEmail(urlParams?.get("email") || "");
    setEmailTouched(false);
    setAcceptRules(false);
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setStatusText("");
  };

  const renderStyledHeroDesc = (text: string, bank: string) => {
    if (!text) return null;
    let normalized = text
      .replace(/{NomDeLaBanque}/g, "[[BANK_NAME]]")
      .replace(/{NombreDelBanco}/g, "[[BANK_NAME]]");
    
    normalized = normalized.replace(/Revolut/gi, "[[BANK_NAME]]");

    const parts = normalized.split("[[BANK_NAME]]");
    return (
      <>
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="text-[#8386ff] font-extrabold">{bank}</span>
            )}
          </span>
        ))}
      </>
    );
  };

  const splitStep = (stepText: string) => {
    if (!stepText) return { label: "", desc: "" };
    const idx = stepText.indexOf(":");
    if (idx === -1) return { label: "", desc: stepText };
    return {
      label: stepText.slice(0, idx + 1) + " ",
      desc: stepText.slice(idx + 1)
    };
  };

  const step1 = splitStep(translations[currentLang].step_spend);
  const step2 = splitStep(translations[currentLang].step_send);
  const step3 = splitStep(translations[currentLang].step_cash);

  return (
    <div className="min-h-screen pb-12 pt-20 md:pt-24 font-body">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <img 
            src="https://www.flatchr.io/hs-fs/hubfs/Ressources%20Site%20Web/Logos%20Jobboards%202/Logo_Wizbii_Large.png?width=400&height=201&name=Logo_Wizbii_Large.png" 
            alt="WIZBII" 
            className="h-7 w-auto select-none"
            referrerPolicy="no-referrer"
          />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 flex flex-col gap-3 md:gap-4">
        
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative px-5 md:px-6 py-2 flex flex-col items-center text-center overflow-hidden"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#8386ff] font-headline mb-2 relative z-10 tracking-tight whitespace-pre-line">
            {translations[currentLang].badge}
          </h2>

          <p className="text-base md:text-lg lg:text-xl font-bold leading-relaxed text-[#46464f] max-w-2xl mb-5 relative z-10 px-4 whitespace-pre-line">
            {renderStyledHeroDesc(translations[currentLang].hero_desc, bankName)}
          </p>
          
          <AnimatedPrize translations={translations} currentLang={currentLang} />
        </motion.section>

        <div id="form-container" className="flex flex-col gap-2 md:gap-2.5">
          <motion.div
            ref={formContainerRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 }}
            className="w-full bg-white/40 backdrop-blur-xl border-2 border-dashed border-[#8683ff]/40 rounded-3xl p-6 md:p-8 relative overflow-hidden"
          >
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
                    {translations[currentLang].already_registered_title}
                  </h3>
                  
                  <p className="text-sm md:text-base font-semibold text-[#46464f] max-w-lg leading-relaxed mb-6">
                    {translations[currentLang].already_registered_desc}
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
                      {translations[currentLang].modeTest}
                    </button>
                  )}
                </motion.div>
              ) : (
                <>
                  {status === "idle" && (
                    <form
                      onSubmit={handleSubmit}
                      className="flex flex-col gap-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#ebeafe] text-[#8683FF] rounded-2xl flex items-center justify-center shrink-0 border border-[#8683ff]/20">
                          <Lock className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#000028] font-headline">
                            {translations[currentLang].form_title}
                          </h3>
                          <p className="text-sm md:text-base font-semibold text-[#46464f] leading-snug">
                            {translations[currentLang].form_subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="lastname" className="text-xs font-black uppercase text-[#000028] tracking-wider pl-1">
                            {translations[currentLang].label_lastname}
                          </label>
                          <input
                            type="text"
                            id="lastname"
                            name="lastname"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full bg-white/70 focus:bg-white border border-[#8683ff]/20 focus:border-[#8683ff] rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 outline-none placeholder-[#46464f]/40 text-[#000028] shadow-sm"
                            placeholder={translations[currentLang].placeholder_lastname}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="firstname" className="text-xs font-black uppercase text-[#000028] tracking-wider pl-1">
                            {translations[currentLang].label_firstname}
                          </label>
                          <input
                            type="text"
                            id="firstname"
                            name="firstname"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full bg-white/70 focus:bg-white border border-[#8683ff]/20 focus:border-[#8683ff] rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 outline-none placeholder-[#46464f]/40 text-[#000028] shadow-sm"
                            placeholder={translations[currentLang].placeholder_firstname}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-xs font-black uppercase text-[#000028] tracking-wider pl-1">
                          {translations[currentLang].emailLabel}
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => setEmailTouched(true)}
                          className="w-full bg-white/70 focus:bg-white border border-[#8683ff]/20 focus:border-[#8683ff] rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 outline-none placeholder-[#46464f]/40 text-[#000028] shadow-sm"
                          placeholder={translations[currentLang].emailPlaceholder}
                        />
                        {emailTouched && email.trim() !== "" && !isEmailValid(email) && (
                          <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {translations[currentLang].alertEmailInvalid}
                          </p>
                        )}
                      </div>

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
                                  {translations[currentLang].drag_drop_zone}
                                </p>
                                <p className="text-xs text-[#46464f] font-bold">
                                  {translations[currentLang].file_limits}
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
                                    {translations[currentLang].tailleLabel} {formatFileSize(file.size)}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={removeFile}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/25 text-red-600 rounded-full text-xs font-black transition-all cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  {translations[currentLang].retirerFichier}
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-4 w-full">
                        <div className="flex items-start gap-2.5 px-1 py-1 select-none w-full text-left">
                          <input
                            type="checkbox"
                            id="acceptRules"
                            required
                            checked={acceptRules}
                            onChange={(e) => setAcceptRules(e.target.checked)}
                            className="mt-0.5 h-4.5 w-4.5 rounded border-[#8683ff]/30 text-[#8683ff] focus:ring-[#8683ff]/50 cursor-pointer accent-[#8683ff] shrink-0"
                          />
                          <label htmlFor="acceptRules" className="text-xs md:text-sm font-semibold text-[#46464f] cursor-pointer leading-tight">
                            {translations[currentLang].acceptRulesPart1}
                            <a 
                              href={currentLang === "es" ? "/reglamento.pdf" : currentLang === "it" ? "/regolamento.pdf" : "/reglement.pdf"} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="underline font-black text-[#8683ff] hover:text-[#726ffd] transition-colors"
                            >
                              {translations[currentLang].acceptRulesLink}
                            </a>
                            {translations[currentLang].acceptRulesPart2}
                            <span className="text-rose-500 font-bold"> *</span>
                          </label>
                        </div>
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
                          {translations[currentLang].submit_button}
                        </motion.button>
                        {isFormValid ? (
                          <p className="text-xs text-gray-500 font-semibold text-center leading-relaxed max-w-md">
                            {translations[currentLang].submit_disclaimer}
                          </p>
                        ) : (
                          <p className="text-xs text-rose-500 font-semibold text-center">
                            {translations[currentLang].fields_mandatory}
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
                        {translations[currentLang].envoiEnCours}
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
                      <div className="mb-5 flex justify-center">
                        <img 
                          src="/images/image_buzzii_cheque.png" 
                          alt="Participation Validée Mascot" 
                          className="h-36 md:h-44 w-auto object-contain select-none drop-shadow-md"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <h3 className="text-lg sm:text-xl md:text-2xl font-black font-headline mb-3 text-[#000028] whitespace-nowrap">
                        {translations[currentLang].success_title}
                      </h3>
                      
                      <p className="text-base font-semibold text-[#46464f] max-w-lg leading-relaxed mb-4 whitespace-pre-line">
                        {translations[currentLang].success_desc}
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
                        {translations[currentLang].error_global}
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
                          {translations[currentLang].btn_retry}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={resetForm}
                          className="px-6 py-2.5 rounded-full bg-white font-extrabold text-xs text-[#46464f] border border-gray-300 hover:bg-gray-50 transition-all shadow-xs cursor-pointer"
                        >
                          {translations[currentLang].btn_cancel}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 md:p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] animate-fade-in"
          >
            <h3 className="text-base md:text-lg font-black text-[#000028] font-headline mb-5">
              {translations[currentLang].how_it_works_title}
            </h3>
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-3.5">
                <span className="text-xl md:text-2xl select-none shrink-0" role="img" aria-label="card">💳</span>
                <div>
                  <span className="font-extrabold text-[#000028] text-sm md:text-base">{step1.label}</span>
                  <span className="text-[#46464f] text-xs md:text-sm font-semibold">{step1.desc}</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3.5">
                <span className="text-xl md:text-2xl select-none shrink-0" role="img" aria-label="camera">📸</span>
                <div>
                  <span className="font-extrabold text-[#000028] text-sm md:text-base">{step2.label}</span>
                  <span className="text-[#46464f] text-xs md:text-sm font-semibold">{step2.desc}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="text-xl md:text-2xl select-none shrink-0" role="img" aria-label="money bag">💰</span>
                <div>
                  <span className="font-extrabold text-[#000028] text-sm md:text-base">{step3.label}</span>
                  <span className="text-[#46464f] text-xs md:text-sm font-semibold">{step3.desc}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <CountdownTimer translations={translations} currentLang={currentLang} />

        <p className="text-[11px] md:text-xs leading-relaxed text-[#46464f]/70 font-semibold text-center mt-3 max-w-2xl mx-auto">
          {translations[currentLang].legal_notice}
        </p>

        <div className="flex justify-center mt-2">
          <a 
            href={currentLang === "es" ? "/reglamento.pdf" : currentLang === "it" ? "/regolamento.pdf" : "/reglement.pdf"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 bg-white/20 px-4 py-1.5 rounded-full border border-gray-200/40 shadow-3xs"
          >
            <FileText className="w-3.5 h-3.5" />
            {translations[currentLang].view_rules}
          </a>
        </div>

      </main>
    </div>
  );
}
