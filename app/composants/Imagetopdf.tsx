'use client'
import { useState } from "react";
import { jsPDF } from "jspdf";
import Image from "next/image";
import { trackPDFConversion } from "./GoogleAnalytics";

/**
 * Composant principal pour la conversion d'images en PDF
 * Permet à l'utilisateur de saisir son nom, sélectionner des images et générer un PDF
 */
export default function Imagetopdf() {
    // États pour gérer les données du formulaire
    const [nom, setNom] = useState<string>(''); // Nom de l'utilisateur
    const [nomSaisi, setNomSaisi] = useState<string>(''); // Nom temporaire pendant la saisie
    const [images, setImages] = useState<File[]>([]); // Images sélectionnées
    const [isLoading, setIsLoading] = useState<boolean>(false); // État de chargement

    /**
     * Gestionnaire pour la sélection de fichiers
     * Convertit la FileList en tableau de fichiers
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            // Convertit FileList en Array pour faciliter la manipulation
            setImages(Array.from(e.target.files));
        }
    };

    /**
     * Valide le nom saisi et passe à l'étape suivante
     */
    const validerNom = () => {
        if (nomSaisi.trim()) {
            setNom(nomSaisi.trim());
        }
    };

    /**
     * Gestionnaire pour la touche Entrée
     */
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            validerNom();
        }
    };

    /**
     * Fonction principale pour générer le PDF
     * Traite chaque image et les ajoute au PDF
     */
    const generatePDF = async () => {
        setIsLoading(true); // Démarre l'animation de chargement
        
        try {
            // Crée une nouvelle instance de PDF
            const pdf = new jsPDF();
            
            // Traite chaque image sélectionnée
            for (let i = 0; i < images.length; i++) {
                const file = images[i];
                
                // Convertit le fichier en base64 pour l'ajouter au PDF
                const imgData = await readFileAsDataURL(file);
                
                // Crée un objet Image pour obtenir les dimensions
                const img = new window.Image();
                img.src = imgData;
                
                // Attend que l'image soit chargée pour obtenir ses dimensions
                await new Promise((resolve) => {
                    img.onload = () => {
                        // Dimensions de la page A4 en mm
                        const pageWidth = 210; // Largeur A4
                        const pageHeight = 297; // Hauteur A4
                        
                        // Calcule les dimensions de l'image pour s'adapter à la page
                        let imgWidth = pageWidth - 20; // Largeur avec marges (10mm de chaque côté)
                        let imgHeight = (img.height * imgWidth) / img.width; // Proportionnel
                        
                        // Si l'image est trop haute, redimensionne en hauteur
                        if (imgHeight > pageHeight - 20) {
                            imgHeight = pageHeight - 20; // Hauteur avec marges
                            imgWidth = (img.width * imgHeight) / img.height; // Proportionnel
                        }
                        
                        // Calcule les positions pour centrer l'image
                        const x = (pageWidth - imgWidth) / 2; // Centrage horizontal
                        const y = (pageHeight - imgHeight) / 2; // Centrage vertical
                        
                        // Ajoute une nouvelle page si ce n'est pas la première image
                        if (i > 0) pdf.addPage();
                        
                        // Ajoute l'image centrée au PDF
                        pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
                        resolve(null);
                    };
                });
            }
            
            // Génère le nom du fichier avec le nom de l'utilisateur si disponible
            const fileName = nom ? `${nom}_images.pdf` : 'images.pdf';
            pdf.save(fileName);
            
            // Tracker la conversion pour Google Analytics
            trackPDFConversion(images.length, fileName);
            
        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
        } finally {
            setIsLoading(false); // Arrête l'animation de chargement
        }
    };

    /**
     * Fonction utilitaire pour convertir un fichier en base64
     * Nécessaire pour ajouter les images au PDF
     */
    const readFileAsDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    return (
        <div 
            className="min-h-screen p-8 bg-gray-100 flex justify-center items-center relative overflow-hidden"
            style={{
                // Motif de fond avec des lignes diagonales
                backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 40px,
                    rgba(59, 130, 246, 0.1) 40px,
                    rgba(59, 130, 246, 0.1) 80px
                )`,
                backgroundSize: '80px 80px'
            }}
        >
            {/* Filigrane PDF répété sur tout l'écran */}
            <div 
                className="absolute inset-0 pointer-events-none select-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='8' fill='%23dbeafe' font-weight='bold'%3EPDF%3C/text%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px',
                    backgroundRepeat: 'repeat'
                }}
                aria-hidden="true"
            />
            
            {/* Formulaire principal */}
            <form className="flex flex-col gap-6 justify-center items-center rounded-lg bg-white p-8 max-w-xl border border-gray-200 shadow-lg shadow-blue-100 z-10">
                
                {/* Section de saisie du nom - affichée seulement si aucun nom n'est validé */}
                {!nom ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex flex-col gap-2">
                            <input
                                id="nom"
                                type="text"
                                value={nomSaisi}
                                onChange={(e) => setNomSaisi(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Votre nom..."
                                className="p-2 border-2 rounded-lg focus:outline focus:outline-2 focus:outline-blue-700 focus:outline-offset-4 dark:border-black"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={validerNom}
                                disabled={!nomSaisi.trim()}
                                className="px-4 py-2 bg-blue-600 text-white mt-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                Valider
                            </button>
                        </div>
                    </div>
                ) : (
                    // Message de bienvenue personnalisé
                    <h1 className="text-center font-bold text-2xl mt-4">
                        Bienvenue <span className="text-blue-500 font-extrabold">{nom}</span>
                    </h1>
                )}
                
                {/* Section de sélection d'images - affichée seulement si un nom est validé */}
                {nom && (
                    <>
                        {/* Label et champ de sélection de fichiers */}
                        <label htmlFor="images" className="text-l font-bold">
                            Sélectionnez vos images :
                        </label>
                        <input
                            id="images"
                            type="file"
                            accept="image/*" // Accepte tous les formats d'image
                            multiple // Permet la sélection multiple
                            onChange={handleFileChange}
                            className="mb-4 block mt-4 border border-2 border-black rounded-lg animate-bounce"
                            title="Choisissez une ou plusieurs images"
                        />
                        
                        {/* Grille d'aperçu des images sélectionnées */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            {images.map((img, i) => (
                                <div key={i} className="relative w-full h-40 rounded shadow overflow-hidden">
                                    <Image
                                        src={URL.createObjectURL(img)} // Crée une URL temporaire pour l'aperçu
                                        alt={`Aperçu image ${i + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 33vw, 200px"
                                    />
                                </div>
                            ))}
                        </div>
                        
                        {/* Bouton de génération - affiché seulement si des images sont sélectionnées */}
                        {images.length > 0 && (
                            <button
                                onClick={generatePDF}
                                disabled={isLoading} // Désactive le bouton pendant le chargement
                                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                                    isLoading 
                                        ? 'bg-gray-400 cursor-not-allowed' // Style désactivé
                                        : 'bg-blue-600 hover:bg-blue-700 active:scale-95 cursor-pointer' // Style actif
                                } text-white shadow-lg`}
                            >
                                {isLoading ? (
                                    // Affichage pendant le chargement
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Génération en cours...
                                    </>
                                ) : (
                                    // Affichage normal
                                    <>
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        Convertir en PDF
                                    </>
                                )}
                            </button>
                        )}
                    </>
                )}
            </form>
        </div>
    );
}
