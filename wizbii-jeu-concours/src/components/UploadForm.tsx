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
    "legal_notice": "*Promoción válida previa verificación de las compras realizadas. El reembolso de 10 € está garantizado para todos los participantes que cumplan los requisitos de la promoción. El premio de 1.000 € se adjudicará mediante sorteo entre las participaciones validadas.",
    "view_rules": "Consultar las bases legales del concurso",
    "countdown_title": "Tiempo restante para enviar tu justificante:",
    "countdown_units": "Días / Horas / Minutos / Segundos",
    "already_registered_title": "¡Registrado! 👏",
    "already_registered_desc": "Tu participation en el sorteo de 1.000 € ha quedado registrada. ¡Mucha suerte!",
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
    "submit_button": "Richiedi i miei 10€ e partecipa al sorteggio di 1.000€",
    "submit_disclaimer": "Cliccando sul pulsante qui sopra, dichiari che le informazioni fornite sono corrette.",
    "fields_mandatory": "* campi obbligatori per convalidare la partecipazione",
    "error_lastname": "Per favore, inserisci il tuo cognome.",
    "error_firstname": "Per favore, inserisci il tuo nome.",
    "error_file": "Per favore, allega la tua prova di spesa.",
    "error_file_size": "Il file {NomDuFichier} supera la dimensione massima consentita di 3 MB.",
    "error_file_format": "Formato file non supportato. Carica un file PDF, JPG o PNG.",
    "success_title": "Partecipazione confermata! 👏",
    "success_desc": "La tua prova di spesa è stata inviata con successo al team WIZBII! Riceverai 10€ sul tuo conto {NomDeLaBanque} nei prochains giorni.",
    "error_global": "Si è verificato un errore durant l'invio",
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
    "modeTest": "🛠️ Modalità Test: Reimposta partecipazione",
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
