import { useEffect } from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { 
  FileText, 
  ReceiptText
} from "lucide-react";
import UploadForm from "./components/UploadForm";
import CountdownTimer from "./components/CountdownTimer";

// Emojis matches exactly the screenshot: Movie clip (Netflix), Shopping cart (Courses), Burger (McDonald's), Bus (Transport)
const EXPENSES = [
  {
    name: "NETFLIX",
    price: "13,49€",
    emoji: "🎬"
  },
  {
    name: "COURSES",
    price: "43,20€",
    emoji: "🛒"
  },
  {
    name: "MCDONALD'S",
    price: "15,10€",
    emoji: "🍔"
  },
  {
    name: "TRANSPORT",
    price: "90,80€",
    emoji: "🚌"
  }
];

export default function App() {
  // Splash some gentle opening confetti to celebrate the premium transition
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
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen pb-16 pt-24 md:pt-28 font-body">
      {/* Sleek transparent sticky Header as requested with WIZBII brand element */}
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

      {/* Main Single Column Layout matching the screenshot */}
      <main className="max-w-3xl mx-auto px-4 flex flex-col gap-4 md:gap-5">
        
        {/* Card 1: Main Title Info Card */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative px-5 md:px-6 py-4 flex flex-col items-center text-center overflow-hidden"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#8386ff] font-headline mb-3 relative z-10 tracking-tight">
            Jeu 100% gagnant
          </h2>

          <p className="text-base md:text-lg lg:text-xl font-bold leading-relaxed text-[#000028] max-w-2xl mb-5 relative z-10 px-4">
            WIZBII vous rembourse <strong className="font-extrabold text-[#000028]">10€</strong> sur vos dépenses de juillet depuis votre compte Revolut ! <span className="text-[#8386ff]">Et tentez de remporter <strong className="font-extrabold text-[#8386ff]">1 000€</strong> 🤩</span>
          </p>
          
          <div className="flex flex-row flex-wrap gap-2 items-center justify-center w-full relative z-10">
            <div className="bg-[#ecfef9] border border-[#c3fded] text-[#155745] rounded-full px-3.5 py-1.5 text-[11px] sm:text-xs md:text-sm font-extrabold flex items-center gap-1 shadow-2xs">
              <span>😉</span> Remboursement de 10€ garanti
            </div>
            <div className="bg-[#f3f3ff] border border-[#C8C9FC] text-[#8386ff] rounded-full px-3.5 py-1.5 text-[11px] sm:text-xs md:text-sm font-extrabold flex items-center gap-1 shadow-2xs">
              <span>🎁</span> Virement de 1 000€ à gagner
            </div>
          </div>
        </motion.section>

        {/* Form Zone Component and Comment ça marche combined in a tighter container */}
        <div className="flex flex-col gap-2 md:gap-2.5">
          {/* Card 3: Form Zone Component (Dashed box upload & Submit) */}
          <UploadForm />

          {/* Card: How it works ("Comment ça marche ?") */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 md:p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
          >
            <h3 className="text-base md:text-lg font-black text-[#000028] font-headline mb-5">
              Comment ça marche ? :
            </h3>
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-3.5">
                <span className="text-xl md:text-2xl select-none shrink-0" role="img" aria-label="card">💳</span>
                <div>
                  <span className="font-extrabold text-[#000028] text-sm md:text-base">Dépensez : </span>
                  <span className="text-[#46464f] text-xs md:text-sm font-semibold">Utilisez votre compte Revolut en juillet (10€ minimum requis).</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3.5">
                <span className="text-xl md:text-2xl select-none shrink-0" role="img" aria-label="camera">📸</span>
                <div>
                  <span className="font-extrabold text-[#000028] text-sm md:text-base">Envoyez : </span>
                  <span className="text-[#46464f] text-xs md:text-sm font-semibold">Téléchargez votre preuve de dépense via le formulaire juste au dessus.</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="text-xl md:text-2xl select-none shrink-0" role="img" aria-label="money bag">💰</span>
                <div>
                  <span className="font-extrabold text-[#000028] text-sm md:text-base">Encaissez : </span>
                  <span className="text-[#46464f] text-xs md:text-sm font-semibold">Recevez 10€ garantis et tentez de gagner 1 000€ au tirage au sort !</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Card 4: Examples of expenses (Exemples de dépenses) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 md:p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
        >
          <h3 className="text-base md:text-lg font-black text-[#000028] font-headline mb-6 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#f5f0ff] text-[#8683ff] rounded-xl flex items-center justify-center shrink-0">
              <ReceiptText className="w-4.5 h-4.5" />
            </div>
            Exemples de dépenses
          </h3>
          
          {/* Balanced 2x2 grid identical to screenshot layout */}
          <div className="grid grid-cols-2 gap-4">
            {EXPENSES.map((expense, idx) => (
              <div 
                key={idx} 
                className="bg-[#fcfaff] border border-gray-100 rounded-2xl p-5 md:p-6 flex flex-col items-center justify-center text-center hover:bg-[#f6f3ff] transition-colors shadow-2xs group"
              >
                <span className="text-3xl md:text-4xl mb-2 select-none group-hover:scale-110 transition-transform duration-200">
                  {expense.emoji}
                </span>
                <p className="text-[10px] md:text-xs font-black text-[#8683ff] uppercase tracking-wider mb-1">
                  {expense.name}
                </p>
                <p className="text-sm md:text-base font-extrabold text-[#000028]">
                  {expense.price}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dynamic Countdown Timer situated below the Examples of expenses */}
        <CountdownTimer />

        {/* Sized Footer text with exact screenshot content */}
        <p className="text-[11px] md:text-xs leading-relaxed text-[#46464f]/70 font-semibold text-center mt-3 max-w-2xl mx-auto">
          * Offre valable sous réserve de vérification des dépenses. Le remboursement de 10€ est garanti pour tout participant éligible. Le virement de 1 000€ sera attribué par tirage au sort parmi les dossiers validés.
        </p>

        {/* Discrete Rules link */}
        <div className="flex justify-center mt-2">
          <a 
            href="https://wizbii.com/redirect-img-gcs/wizbii-files/2805c342-0b47-4873-a463-e4b5e09e8651.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 bg-white/20 px-4 py-1.5 rounded-full border border-gray-200/40 shadow-3xs"
          >
            <FileText className="w-3.5 h-3.5" />
            Consulter le règlement complet
          </a>
        </div>

      </main>
    </div>
  );
}
