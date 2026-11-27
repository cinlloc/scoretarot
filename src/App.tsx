import { useState } from 'react';
import { Accueil } from './ecrans/Accueil';
import { NouvellePartie } from './ecrans/NouvellePartie';
import { SaisieDonne } from './ecrans/SaisieDonne';
import { TableauScores } from './ecrans/TableauScores';
import type { Donne } from './moteur/calculerDonne';
import { creerPartie, descriptionDuJour, donneParDefaut, type Joueur, type Partie } from './partie/partie';
import { charger, enregistrer, type Sauvegarde } from './stockage/stockage';

type Ecran =
  | { nom: 'accueil' }
  | { nom: 'nouvelle-partie' }
  | { nom: 'tableau'; partieId: string }
  | { nom: 'donne'; partieId: string };

export default function App() {
  const [sauvegarde, setSauvegarde] = useState(charger);
  const [ecran, setEcran] = useState<Ecran>({ nom: 'accueil' });

  function modifier(nouvelle: Sauvegarde) {
    enregistrer(nouvelle);
    setSauvegarde(nouvelle);
  }

  function nomsDe(partie: Partie) {
    return partie.joueurs.map((id) => sauvegarde.joueurs.find((joueur) => joueur.id === id)?.nom ?? '?');
  }

  function ajouterJoueur(nom: string): Joueur {
    const joueur = { id: crypto.randomUUID(), nom };
    modifier({ ...sauvegarde, joueurs: [...sauvegarde.joueurs, joueur] });
    return joueur;
  }

  function commencer(description: string, joueurs: Joueur[]) {
    const partie = creerPartie(joueurs, description, new Date());
    modifier({ ...sauvegarde, parties: [...sauvegarde.parties, partie] });
    setEcran({ nom: 'tableau', partieId: partie.id });
  }

  function ajouterDonne(partie: Partie, donne: Donne) {
    const misAJour = { ...partie, donnes: [...partie.donnes, donne] };
    modifier({
      ...sauvegarde,
      parties: sauvegarde.parties.map((autre) => (autre.id === partie.id ? misAJour : autre)),
    });
    setEcran({ nom: 'tableau', partieId: partie.id });
  }

  if (ecran.nom === 'nouvelle-partie') {
    return (
      <NouvellePartie
        joueurs={sauvegarde.joueurs}
        descriptionParDefaut={descriptionDuJour(new Date())}
        onAjouterJoueur={ajouterJoueur}
        onCommencer={commencer}
        onRetour={() => setEcran({ nom: 'accueil' })}
      />
    );
  }

  const partie = 'partieId' in ecran ? sauvegarde.parties.find((autre) => autre.id === ecran.partieId) : undefined;

  if (ecran.nom === 'tableau' && partie) {
    return (
      <TableauScores
        partie={partie}
        noms={nomsDe(partie)}
        onNouvelleDonne={() => setEcran({ nom: 'donne', partieId: partie.id })}
        onRetour={() => setEcran({ nom: 'accueil' })}
      />
    );
  }

  if (ecran.nom === 'donne' && partie) {
    return (
      <SaisieDonne
        noms={nomsDe(partie)}
        numero={partie.donnes.length + 1}
        description={partie.description}
        donneInitiale={donneParDefaut(partie)}
        onEnregistrer={(donne) => ajouterDonne(partie, donne)}
        onRetour={() => setEcran({ nom: 'tableau', partieId: partie.id })}
      />
    );
  }

  const partieEnCours = sauvegarde.parties.filter((autre) => autre.statut === 'en-cours').at(-1);
  return (
    <Accueil
      partieEnCours={partieEnCours}
      onNouvellePartie={() => setEcran({ nom: 'nouvelle-partie' })}
      onReprendre={(choisie) => setEcran({ nom: 'tableau', partieId: choisie.id })}
    />
  );
}
