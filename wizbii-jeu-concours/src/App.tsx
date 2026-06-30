import UploadForm from "./components/UploadForm";

export default function App() {
  return (
    <>
      {/* On appelle uniquement le formulaire qui gère désormais l'intégralité de la page et des traductions */}
      <UploadForm />
    </>
  );
}
