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
import confettiModule from "canvas-confetti";
const confetti = confettiModule.create(undefined, { resize: true, useWorker: false });
// Dynamic language and partner configuration + Translation Dictionary for the landing page
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
      // Capitalize first letter of partner parameter
      bankName = rawBank.charAt(0).toUpperCase() + rawBank.slice(1);
    }
  } else {
    // Default fallback to first allowed bank of the country
    const defaultBank = allowedBanks[0];
    bankName = bankDisplayNames[defaultBank] || (defaultBank.charAt(0).toUpperCase() + defaultBank.slice(1));
  }
  
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

interface TranslationDict {
  badge: string;
  hero_desc: string;
  animation_amount: string;
  animation_text: string;
  how_it_works_title: string;
  step_spend: string;
  step_send: string;
  step_cash: string;
  legal_notice: string;
  view_rules: string;
  countdown_title: string;
  countdown_units: string;
  already_registered_title: string;
  already_registered_desc: string;
  form_title: string;
  form_subtitle: string;
  label_lastname: string;
  label_firstname: string;
  placeholder_lastname: string;
  placeholder_firstname: string;
  drag_drop_zone: string;
  file_limits: string;
  submit_button: string;
  submit_disclaimer: string;
  fields_mandatory: string;
  error_lastname: string;
  error_firstname: string;
  error_file: string;
  error_file_size: string;
  error_file_format: string;
  success_title: string;
  success_desc: string;
  error_global: string;
  btn_retry: string;
  btn_cancel: string;
  modeTest: string;
  emailLabel: string;
  emailPlaceholder: string;
  alertEmailMissing: string;
  alertEmailInvalid: string;
  tailleLabel: string;
  sizes: string[];
  retirerFichier: string;
  acceptRulesPart1: string;
  acceptRulesLink: string;
  acceptRulesPart2: string;
  envoiEnCours: string;
  preparationDossier: string;
  envoiMake: string;
  donneesTransmises: string;
}

interface Translation {
  badge: string;
  hero_desc: string;
  animation_amount: string;
  animation_text: string;
  how_it_works_title: string;
  step_spend: string;
  step_send: string;
  step_cash: string;
  legal_notice: string;
  view_rules: string;
  countdown_title: string;
  countdown_units: string;
  already_registered_title: string;
  already_registered_desc: string;
  form_title: string;
  form_subtitle: string;
  label_lastname: string;
  label_firstname: string;
  placeholder_lastname: string;
  placeholder_firstname: string;
  drag_drop_zone: string;
  file_limits: string;
  submit_button: string;
  submit_disclaimer: string;
  fields_mandatory: string;
  error_lastname: string;
  error_firstname: string;
  error_file: string;
  error_file_size: (fileName: string) => string;
  error_file_format: string;
  success_title: string;
  success_desc: string;
  error_global: string;
  btn_retry: string;
  btn_cancel: string;
  clickToParticipate: string;
  dejaEnregistre: string;
  participationPriseEnCompte: string;
  modeTest: string;
  debloqueDèsMaintenant: string;
  ajouteScreenInstructions: string;
  nomLabel: string;
  nomPlaceholder: string;
  prenomLabel: string;
  prenomPlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  alertNom: string;
  alertPrenom: string;
  alertEmailMissing: string;
  alertEmailInvalid: string;
  alertJustificatif: string;
  fileTooLarge: (fileName: string) => string;
  formatNotSupported: string;
  cliquezGlissez: string;
  maxSizeLabel: string;
  tailleLabel: string;
  sizes: string[];
  retirerFichier: string;
  acceptRulesPart1: string;
  acceptRulesLink: string;
  acceptRulesPart2: string;
  submitButton: string;
  attestationLabel: string;
  champsObligatoires: string;
  envoiEnCours: string;
  preparationDossier: string;
  envoiMake: string;
  donneesTransmises: string;
  participationValidee: string;
  successNotice: string;
  erreurEnvoi: string;
  buttonReset: string;
  buttonCancel: string;
}

const translationsDict: Record<"fr" | "es" | "it", TranslationDict> = {
  fr: {
    badge: "Jeu 100% gagnant",
    hero_desc: "WIZBII te rembourse 10€ sur tes denses de juillet avec ta carte {NomDeLaBanque} ! Et tente de remporter les 1000€ mis en jeu 😱",
    animation_amount: "1 000€",
    animation_text: "à gagner",
    how_it_works_title: "Comment ça marche ?",
    step_spend: "Dépense : utilise ta carte Revolut (physique ou virtuelle) pour tes dépenses de juillet (min. 10€ requis)",
    step_send: "Envoie : télécharge ta preuve de dépense via le formulaire juste au-dessus",
    step_cash: "Encaisse : reçois tes 10€ ET tente de gagner les 1 000€ en jeu",
    legal_notice: "* Offre valable sous réserve de vérification des dépenses. Le remboursement de 10€ est garanti pour tout participant éligible. Le virement de 1 000€ sera attribué par tirage au sort parmi les participants vérifiés.",
    view_rules: "Consulter le règlement complet",
    countdown_title: "Temps restant pour envoyer ton justificatif :",
    countdown_units: "Jours / Heures / Minutes / Secondes",
    already_registered_title: "Déjà enregistré ! 👏",
    already_registered_desc: "Ta participation pour tenter de remporter les 1 000€ est bien prise en compte. Bonne chance !",
    form_title: "Débloque tes 10€ dès maintenant",
    form_subtitle: "Ajoute un screen de ton app bancaire {NomDeLaBanque} avec tes dépenses carte de juillet (ou ton dernier relevé de compte)",
    label_lastname: "Nom * :",
    label_firstname: "Prénom * :",
    placeholder_lastname: "Ex. Martin",
    placeholder_firstname: "Ex. Alexandre",
    drag_drop_zone: "Clique ou glisse ton fichier ici *",
    file_limits: "PDF, JPG, PNG — max 3 Mo",
    submit_button: "Réclamer mes 10€ et participer au tirage au sort des 1 000€",
    submit_disclaimer: "En cliquant sur le bouton ci-dessus, tu attestes que les informations communiquées sont correctes.",
    fields_mandatory: "* champs obligatoires pour valider la participation",
    error_lastname: "Veuillez renseigner votre nom.",
    error_firstname: "Veuillez renseigner votre prénom.",
    error_file: "Veuillez joindre votre justificatif.",
    error_file_size: "Le fichier {NomDuFichier} dépasse la taille maximale autorisée de 3 Mo.",
    error_file_format: "Format de fichier non supporté. Veuillez téléverser un fichier PDF, JPG ou PNG.",
    success_title: "Participation validée ! 👏",
    success_desc: "Ton justificatif a été envoyé avec succès à l’équipe WIZBII ! Tu recevras 10€ sur ton compte {NomDeLaBanque} dans les prochains jours.",
    error_global: "Une erreur s'est produite lors de l'envoi",
    btn_retry: "Réessayer",
    btn_cancel: "Annuler",
    modeTest: "🛠️ Mode Test : Réinitialiser la participation",
    emailLabel: "Adresse e-mail * :",
    emailPlaceholder: "Ex. alexandre@email.com",
    alertEmailMissing: "Veuillez renseigner votre adresse e-mail.",
    alertEmailInvalid: "Veuillez renseigner une adresse e-mail valide (ex: un@email.com).",
    tailleLabel: "Taille : ",
    sizes: ["octets", "Ko", "Mo", "Go"],
    retirerFichier: "Retirer le fichier",
    acceptRulesPart1: "J’accepte le ",
    acceptRulesLink: "règlement du jeu concours",
    acceptRulesPart2: "",
    envoiEnCours: "Envoi en cours de vos informations...",
    preparationDossier: "Préparation de votre dossier...",
    envoiMake: "Envoi des données vers Make.com...",
    donneesTransmises: "Données transmises avec succès !",
  },
  es: {
    badge: "Sorteo con premio 100% asegurado",
    hero_desc: "¡WIZBII te regala 10 € por tus compras de julio con tu tarjeta {NombreDelBanco}! Y además participa en un sorteo de 1.000 € 😱",
    animation_amount: "1.000€",
    animation_text: "en juego",
    how_it_works_title: "¿Cómo funciona?",
    step_spend: "Compra: utiliza tu tarjeta Revolut (física o virtual) para realizar compras durante el mes de julio (importe mínimo de 10 €)",
    step_send: "Envía: sube el justificante de tu compra a través del formulario que encontrarás justo arriba",
    step_cash: "Recibe: consigue un reembolso de 10 € Y participa en el sorteo de un premio de 1.000 €",
    legal_notice: "*Promoción válida previa verificación de las compras realizadas. El reembolso de 10 € está garantizado para todos los participantes que cumplan los requisitos de la promoción. El premio de 1.000 € se adjudicará mediante sorteo entre las participaciones validadas.",
    view_rules: "Consultar las bases legales del concurso",
    countdown_title: "Tiempo restante para enviar tu justificante:",
    countdown_units: "Días / Horas / Minutos / Segundos",
    already_registered_title: "¡Registrado! 👏",
    already_registered_desc: "Tu participación en el sorteo de 1.000 € ha quedado registrada. ¡Mucha suerte!",
    form_title: "Desbloquea tus 10€ ahora",
    form_subtitle: "Sube una captura de pantalla de la app de tu banco {NombreDelBanco} donde se vean las compras realizadas con tu tarjeta en julio (o tu último extracto bancario)",
    label_lastname: "Apellido* :",
    label_firstname: "Nombre* :",
    placeholder_lastname: "Ej. García",
    placeholder_firstname: "Ej. Alejandro",
    drag_drop_zone: "Haz clic o arrastra tu archivo aquí*",
    file_limits: "PDF, JPG, PNG — máx 3 MB",
    submit_button: "Reclamar mis 10€ y participar en el sorteo de 1.000€",
    submit_disclaimer: "Al hacer clic en el botón de arriba, confirmas que la información facilitada es correcta.",
    fields_mandatory: "*campos obligatorios para validar la participación",
    error_lastname: "Por favor, introduce tu apellido.",
    error_firstname: "Por favor, introduce tu nombre.",
    error_file: "Por favor, adjunta tu justificante.",
    error_file_size: "El archivo {NomDuFichier} supera el tamaño de 3 MB permitido.",
    error_file_format: "Formato de archivo no válido. Por favor, sube un archivo PDF, JPG o PNG.",
    success_title: "¡Participación registrada! 👏",
    success_desc: "¡Tu justificante ha sido enviado con éxito al equipo de WIZBII! Recibirás 10€ en tu cuenta {NomDeLaBanque} en los próximos días.",
    error_global: "No se ha podido completar el envío.",
    btn_retry: "Reintentar",
    btn_cancel: "Cancelar",
    modeTest: "🛠️ Modo Test: Reiniciar participación",
    emailLabel: "Correo electrónico * :",
    emailPlaceholder: "Ej. alejandro@email.com",
    alertEmailMissing: "Por favor, introduce tu correo electrónico.",
    alertEmailInvalid: "Por favor, introduce un correo electrónico válido (ej: un@email.com).",
    tailleLabel: "Tamaño: ",
    sizes: ["octetos", "KB", "MB", "GB"],
    retirerFichier: "Eliminar archivo",
    acceptRulesPart1: "Acepto las ",
    acceptRulesLink: "bases del concurso",
    acceptRulesPart2: "",
    envoiEnCours: "Enviando tu información...",
    preparationDossier: "Preparando tu solicitud...",
    envoiMake: "Enviando datos a Make.com...",
    donneesTransmises: "¡Datos transmitidos con éxito!",
  },
  it: {
    badge: "Gioco 100% vincente",
    hero_desc: "WIZBII ti rimborsa 10€ sulle tue spese di luglio con la tua carta {NomDeLaBanque}! E prova a vincere i 1.000€ in palio 😱",
    animation_amount: "1.000€",
    animation_text: "in palio",
    how_it_works_title: "Come funziona?",
    step_spend: "Spendi: usa la tua carta Revolut (fisica o virtuale) per le tue spese di luglio (min. 10€ richiesti)",
    step_send: "Invia: carica la tua prova di spesa tramite il modulo qui sopra",
    step_cash: "Incassa: ricevi i tuoi 10€ E prova a vincere i 1.000€ in palio",
    legal_notice: "* Offerta valida subordinatamente alla verifica delle spese. Il rimborso de 10€ è garantito per tutti i partecipanti idonei. Il premio di 1.000€ sarà assegnato tramite sorteggio tra i partecipanti verificati.",
    view_rules: "Consulta il regolamento completo",
    countdown_title: "Tempo rimasto per inviare la tua prova di spesa:",
    countdown_units: "Giorni / Ore / Minuti / Secondi",
    already_registered_title: "Già registrato! 👏",
    already_registered_desc: "La tua partecipazione per provare a vincere i 1.000€ è stata registrata. Buona fortuna!",
    form_title: "Sblocca i tuoi 10€ ora",
    form_subtitle: "Aggiungi uno screenshot della tua app bancaria {NomDeLaBanque} con le tue spese di luglio con carta (o il tuo ultimo estratto conto)",
    label_lastname: "Cognome * :",
    label_firstname: "Nome * :",
    placeholder_lastname: "Es. Rossi",
    placeholder_firstname: "Es. Alessandro",
    drag_drop_zone: "Clicca o trascina qui il tuo file *",
    file_limits: "PDF, JPG, PNG — max 3 MB",
    submit_button: "Richiedi i miei 10€ e partecipa al sorteggio di 1.000€",
    submit_disclaimer: "Cliccando sul pulsante qui sopra, dichiari che le informazioni fornite sono corrette.",
    fields_mandatory: "* campi obbligatori per convalidare la partecipazione",
    error_lastname: "Per favor, inserisci il tuo cognome.",
    error_firstname: "Per favore, inserisci il tuo nome.",
    error_file: "Per favore, allega la tua prova di spesa.",
    error_file_size: "Il file {NomDuFichier} supera la dimensione massima consentita di 3 MB.",
    error_file_format: "Formato file non supportato. Carica un file PDF, JPG o PNG.",
    success_title: "Partecipazione confermata! 👏",
    success_desc: "La tua prova di spesa è stata inviata con successo al team WIZBII! Riceverai 10€ sul tuo conto {NomDeLaBanque} nei prossimi giorni.",
    error_global: "Si è verificato un errore durante l'invio",
    btn_retry: "Riprova",
    btn_cancel: "Annulla",
    modeTest: "🛠️ Modalità Test: Reimposta partecipazione",
    emailLabel: "E-mail * :",
    emailPlaceholder: "Es. alessandro@email.com",
    alertEmailMissing: "Per favore, inserisci il tuo indirizzo e-mail.",
    alertEmailInvalid: "Per favore, inserisci un indirizzo e-mail valido (es: un@email.com).",
    tailleLabel: "Dimensione: ",
    sizes: ["byte", "KB", "MB", "GB"],
    retirerFichier: "Rimuovi file",
    acceptRulesPart1: "Accetto il ",
    acceptRulesLink: "regolamento del concorso",
    acceptRulesPart2: "",
    envoiEnCours: "Invio delle informazioni in corso...",
    preparationDossier: "Preparazione della tua richiesta...",
    envoiMake: "Inviando dati a Make.com...",
    donneesTransmises: "Dati inviati con successo!",
  }
};

const getTranslations = (country: "fr" | "es" | "it", bankName: string): Translation => {
  const dict = translationsDict[country];
  
  const replaceAll = (text: string, fileName?: string): string => {
    if (!text) return "";
    let res = text
      .replace(/{NomDeLaBanque}/g, bankName)
      .replace(/{NombreDelBanco}/g, bankName)
      .replace(/{NomDuFichier}/g, fileName || "");
    
    if (bankName && bankName.toLowerCase() !== "revolut") {
      res = res.replace(/Revolut/g, bankName);
    }
    return res;
  };

  return {
    badge: dict.badge,
    hero_desc: dict.hero_desc,
    animation_amount: dict.animation_amount,
    animation_text: dict.animation_text,
    how_it_works_title: dict.how_it_works_title,
    step_spend: replaceAll(dict.step_spend),
    step_send: replaceAll(dict.step_send),
    step_cash: replaceAll(dict.step_cash),
    legal_notice: replaceAll(dict.legal_notice),
    view_rules: dict.view_rules,
    countdown_title: dict.countdown_title,
    countdown_units: dict.countdown_units,
    already_registered_title: dict.already_registered_title,
    already_registered_desc: replaceAll(dict.already_registered_desc),
    form_title: dict.form_title,
    form_subtitle: replaceAll(dict.form_subtitle),
    label_lastname: replaceAll(dict.label_lastname),
    label_firstname: replaceAll(dict.label_firstname),
    placeholder_lastname: replaceAll(dict.placeholder_lastname),
    placeholder_firstname: replaceAll(dict.placeholder_firstname),
    drag_drop_zone: dict.drag_drop_zone,
    file_limits: dict.file_limits,
    submit_button: dict.submit_button,
    submit_disclaimer: dict.submit_disclaimer,
    fields_mandatory: dict.fields_mandatory,
    error_lastname: dict.error_lastname,
    error_firstname: dict.error_firstname,
    error_file: dict.error_file,
    error_file_size: (fileName: string) => replaceAll(dict.error_file_size, fileName),
    error_file_format: dict.error_file_format,
    success_title: dict.success_title,
    success_desc: replaceAll(dict.success_desc),
    error_global: dict.error_global,
    btn_retry: dict.btn_retry,
    btn_cancel: dict.btn_cancel,
    clickToParticipate: country === "es" ? "¡Haz clic para participar!" : (country === "it" ? "Clicca per partecipare!" : "Clique pour participer !"),
    dejaEnregistre: dict.already_registered_title,
    participationPriseEnCompte: replaceAll(dict.already_registered_desc),
    modeTest: dict.modeTest,
    debloqueDèsMaintenant: dict.form_title,
    ajouteScreenInstructions: replaceAll(dict.form_subtitle),
    nomLabel: replaceAll(dict.label_lastname).replace(/\s*\*\s*:/g, "").trim(),
    nomPlaceholder: replaceAll(dict.placeholder_lastname),
    prenomLabel: replaceAll(dict.label_firstname).replace(/\s*\*\s*:/g, "").trim(),
    prenomPlaceholder: replaceAll(dict.placeholder_firstname),
    emailLabel: dict.emailLabel.replace(/\s*\*\s*:/g, "").trim(),
    emailPlaceholder: dict.emailPlaceholder,
    alertNom: dict.error_lastname,
    alertPrenom: dict.error_firstname,
    alertEmailMissing: dict.alertEmailMissing,
    alertEmailInvalid: dict.alertEmailInvalid,
    alertJustificatif: dict.error_file,
    fileTooLarge: (fileName: string) => replaceAll(dict.error_file_size, fileName),
    formatNotSupported: dict.error_file_format,
    cliquezGlissez: dict.drag_drop_zone.replace(/\s*\*\s*:/g, "").replace(/\s*\*\s*/g, "").trim(),
    maxSizeLabel: dict.file_limits,
    tailleLabel: dict.tailleLabel,
    sizes: dict.sizes,
    retirerFichier: dict.retirerFichier,
    acceptRulesPart1: dict.acceptRulesPart1,
    acceptRulesLink: dict.acceptRulesLink,
    acceptRulesPart2: dict.acceptRulesPart2,
    submitButton: dict.submit_button,
    attestationLabel: dict.submit_disclaimer,
    champsObligatoires: dict.fields_mandatory,
    envoiEnCours: dict.envoiEnCours,
    preparationDossier: dict.preparationDossier,
    envoiMake: dict.envoiMake,
    donneesTransmises: dict.donneesTransmises,
    participationValidee: dict.success_title,
    successNotice: replaceAll(dict.success_desc),
    erreurEnvoi: dict.error_global,
    buttonReset: dict.btn_retry,
    buttonCancel: dict.btn_cancel,
  };
};


export default function UploadForm() {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
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
    if (!email.trim()) {
      alert(t.alertEmailMissing);
      return;
    }
    if (!isEmailValid(email)) {
      alert(t.alertEmailInvalid);
      return;
    }
    if (!acceptRules) {
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
      formData.append("nom", lastName.trim());
      formData.append("firstname", firstName.trim());
      formData.append("prenom", firstName.trim());
      formData.append("email", email.trim());
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
      confetti({
        startVelocity: defaults.startVelocity,
        spread: defaults.spread,
        ticks: defaults.ticks,
        zIndex: defaults.zIndex,
        colors: defaults.colors,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        startVelocity: defaults.startVelocity,
        spread: defaults.spread,
        ticks: defaults.ticks,
        zIndex: defaults.zIndex,
        colors: defaults.colors,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 200);
  };

  const resetForm = () => {
    setLastName("");
    setFirstName("");
    setEmail("");
    setEmailTouched(false);
    setAcceptRules(false);
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

            {/* E-mail Input Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-black uppercase text-[#000028] tracking-wider pl-1">
                {t.emailLabel} <span className="text-rose-500">*</span> :
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
                placeholder={t.emailPlaceholder}
              />
              {emailTouched && email.trim() !== "" && !isEmailValid(email) && (
                <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {t.alertEmailInvalid}
                </p>
              )}
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
            <div className="flex flex-col items-center gap-4 w-full">
              <input type="hidden" name="partenaire" value={bankParam} />
              <input type="hidden" name="pays" value={country} />
              {userId && <input type="hidden" name="userId" value={userId} />}

              {/* Opt-in rules checkbox */}
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
                  {t.acceptRulesPart1}
                  <a 
                    href={country === "es" ? "/reglamento.pdf" : country === "it" ? "/regolamento.pdf" : "/reglement.pdf"} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="underline font-black text-[#8683ff] hover:text-[#726ffd] transition-colors"
                  >
                    {t.acceptRulesLink}
                  </a>
                  {t.acceptRulesPart2}
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
