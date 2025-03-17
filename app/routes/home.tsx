import { Button } from "@mui/material";
import { useState } from "react";
import { Navigate } from "react-router";
import logo from '../assets/cards.svg';
import './home.css';

export default function Home() {
  const [toNewDonne, setToNewDonne] = useState(false);

  if (toNewDonne) {
    return <Navigate to="/donne/new" />;
  }

  return (
    <main>
      <img className="home-logo" src={logo} alt="Logo" />
      <p>ScoreTarot : l'application pour compter les points au tarot !</p>
      <Button variant="contained" onClick={() => setToNewDonne(true)}>Nouvelle donne</Button>
    </main>
  );
}
