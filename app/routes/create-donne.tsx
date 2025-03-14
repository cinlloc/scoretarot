import { NavLink } from "react-router";
import type { Route } from "./+types/home";
import { useState } from "react";
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Rating, Slider, Typography } from "@mui/material";
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

export default function CreateDonne() {

  const [donne, setDonne] = useState({
    contrat: "",
    bouts: 0,
    points: 0,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setDonne((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(donne);
  };

  const isWon = () => {
    switch (donne.bouts) {
      case 0:
        return donne.points >= 56;
      case 1:
        return donne.points >= 51;
      case 2:
        return donne.points >= 41;
      case 3:
        return donne.points >= 36;
      default:
        return false;
    }
  };

  return (
    <FormControl>
      <FormLabel id="contrat-radio-buttons-group">Contrat</FormLabel>
      <RadioGroup
        aria-labelledby="contrat-radio-buttons-group"
        name="contrat-radio-buttons-group"
        value={donne.contrat}
        onChange={handleChange}
      >
        <FormControlLabel value="prise" control={<Radio />} label="Prise" />
        <FormControlLabel value="garde" control={<Radio />} label="Garde" />
        <FormControlLabel value="garde-sans" control={<Radio />} label="Garde Sans" />
        <FormControlLabel value="garde-contre" control={<Radio />} label="Garde Contre" />
      </RadioGroup>
      <FormLabel id="bouts-rating">Bouts</FormLabel>
      <Rating
        name="bouts-rating"
        value={donne.bouts}
        size="large"
        max={3}
        onChange={(event, newValue) => {
          setDonne((prevState) => ({ ...prevState, bouts: newValue ?? 0 }));
        }}
      />
      <FormLabel id="points-slider">Points</FormLabel>
      <Slider name="points-slider" value={donne.points} max={91} onChange={(event: Event, newValue: number | number[]) => {
        setDonne((prevState) => ({ ...prevState, points: newValue as number }));
      }} />
      <Typography variant="h6">La donne est {isWon() ? 'gagnée' : 'perdue'}</Typography>
      {isWon() ? <EmojiEmotionsIcon /> : <SentimentVeryDissatisfiedIcon />}
    </FormControl>
  );
}