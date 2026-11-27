import { useState } from 'react';
import { Accueil } from './ecrans/Accueil';
import { NouvellePartie } from './ecrans/NouvellePartie';
import { SaisieDonne } from './ecrans/SaisieDonne';
import { TableauScores } from './ecrans/TableauScores';
import type { Donne } from './moteur/calculerDonne';
import { creerPartie, donneParDefaut, memeNom, type Joueur, type Partie } from './partie/partie';
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

  function commencer(noms: string[]) {
    // Un nom déjà connu reprend le même joueur, pour garder un identifiant stable d'une partie à l'autre.
    const joueurs: Joueur[] = noms.map(
      (nom) => sauvegarde.joueurs.find((connu) => memeNom(connu.nom, nom)) ?? { id: crypto.randomUUID(), nom },
    );
    const nouveaux = joueurs.filter((joueur) => !sauvegarde.joueurs.includes(joueur));
    const partie = creerPartie(joueurs, new Date());
    modifier({
      ...sauvegarde,
      joueurs: [...sauvegarde.joueurs, ...nouveaux],
      parties: [...sauvegarde.parties, partie],
    });
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
    return <NouvellePartie onCommencer={commencer} onRetour={() => setEcran({ nom: 'accueil' })} />;
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
