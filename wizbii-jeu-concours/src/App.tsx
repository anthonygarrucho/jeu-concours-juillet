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

function AnimatedPrize() {
  const prizeString = "1 000€";
  const chars = prizeString.split("").map(c => c === " " ? "\u00A0" : c);

  const containerVariants = {
    hidden: {},
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
      title="Clique pour participer !"
    >
      {/* 1 000€ Title Characters with 3D styled dual offset shadow matches the screenshot (white + lilac) */}
      <div className="flex items-center justify-center relative z-20 group-hover:scale-[1.03] transition-transform duration-300">
        {chars.map((char, index) => (
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

      {/* À GAGNER Badge layered behind the 3D text/shadows with a tight negative margin */}
      <motion.div
        variants={badgeVariants}
        className="bg-[#8386ff] rounded-[24px] px-8 py-2 md:px-11 md:py-3.5 -mt-2 md:-mt-3 relative z-10 shadow-md shadow-[#8386ff]/30 border-2 border-white group-hover:scale-105 transition-transform duration-300"
      >
        <span className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-black uppercase tracking-wider">
          À GAGNER
        </span>
      </motion.div>
    </motion.div>
  );
}

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
    <div className="min-h-screen pb-12 pt-20 md:pt-24 font-body">
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
      <main className="max-w-3xl mx-auto px-4 flex flex-col gap-3 md:gap-4">
        
        {/* Card 1: Main Title Info Card */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative px-5 md:px-6 py-2 flex flex-col items-center text-center overflow-hidden"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#8386ff] font-headline mb-2 relative z-10 tracking-tight">
            Jeu<br />100% gagnant
          </h2>

          <p className="text-base md:text-lg lg:text-xl font-bold leading-relaxed text-[#000028] max-w-2xl mb-3 relative z-10 px-4">
            WIZBII te rembourse <strong className="font-extrabold text-[#000028]">10€</strong> sur tes dépenses de juillet avec ta carte Revolut ! Et tente de remporter les <strong className="font-extrabold text-[#8386ff]">1000€</strong> mis en jeu 😱
          </p>
          
          <AnimatedPrize />
        </motion.section>

        {/* Form Zone Component and Comment ça marche combined in a tighter container */}
        <div id="form-container" className="flex flex-col gap-2 md:gap-2.5">
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
                  <span className="font-extrabold text-[#000028] text-sm md:text-base">Dépense : </span>
                  <span className="text-[#46464f] text-xs md:text-sm font-semibold">utilise ta carte Revolut (physique ou virtuelle) pour tes dépenses de juillet (min. 10€ requis)</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3.5">
                <span className="text-xl md:text-2xl select-none shrink-0" role="img" aria-label="camera">📸</span>
                <div>
                  <span className="font-extrabold text-[#000028] text-sm md:text-base">Envoie : </span>
                  <span className="text-[#46464f] text-xs md:text-sm font-semibold">télécharge ta preuve de dépense via le formulaire juste au-dessus</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="text-xl md:text-2xl select-none shrink-0" role="img" aria-label="money bag">💰</span>
                <div>
                  <span className="font-extrabold text-[#000028] text-sm md:text-base">Encaisse : </span>
                  <span className="text-[#46464f] text-xs md:text-sm font-semibold">reçois tes 10€ ET tente de gagner les 1000€ en jeu</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Countdown Timer situated below the Examples of expenses */}
        <CountdownTimer />

        {/* Sized Footer text with exact screenshot content */}
        <p className="text-[11px] md:text-xs leading-relaxed text-[#46464f]/70 font-semibold text-center mt-3 max-w-2xl mx-auto">
          * Offre valable sous réserve de vérification des dépenses. Le remboursement de 10€ est garanti pour tout participant éligible. Le virement de 1 000€ sera attribué par tirage au sort parmi les participants vérifiés.
        </p>

        {/* Discrete Rules link */}
        <div className="flex justify-center mt-2">
          <a 
            href="https://jeu-concours-wizbii.netlify.app/reglement.pdf"
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
