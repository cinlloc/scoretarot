import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { FormControl, FormControlLabel, FormLabel, Grid2, Radio, RadioGroup, Rating, Slider, Typography } from "@mui/material";
import { useState } from "react";

export default function CreateDonne() {

  const [donne, setDonne] = useState({
    contrat: "prise",
    bouts: 0,
    points: 0,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setDonne((prevState) => ({ ...prevState, [name]: value }));
  };

  const isWon = () => {
    return donne.points >= pointsToWin();
  };

  const pointsToWin = () => {
    switch (donne.bouts) {
      case 0:
        return 56;
      case 1:
        return 51;
      case 2:
        return 41;
      case 3:
        return 36;
      default:
        return 56;
    }
  };

  return (
    <main>
      <FormControl>
        <FormLabel id="contrat-radio-buttons-group"><Typography variant="h5" sx={{ color: "white" }}>Contrat</Typography></FormLabel>
        <RadioGroup
          aria-labelledby="contrat-radio-buttons-group"
          name="contrat"
          value={donne.contrat}
          onChange={handleChange}
        >
          <FormControlLabel value="prise" control={<Radio />} label="Prise" />
          <FormControlLabel value="garde" control={<Radio />} label="Garde" />
          <FormControlLabel value="garde-sans" control={<Radio />} label="Garde Sans" />
          <FormControlLabel value="garde-contre" control={<Radio />} label="Garde Contre" />
        </RadioGroup>
        <FormLabel id="bouts-rating"><Typography variant="h5" sx={{ color: "white" }}>Bouts</Typography></FormLabel>
        <Rating
          name="bouts-rating"
          value={donne.bouts}
          size="large"
          max={3}
          onChange={(event, newValue) => {
            setDonne((prevState) => ({ ...prevState, bouts: newValue ?? 0 }));
          }}
        />
        <FormLabel id="points-slider"><Typography variant="h5" sx={{ color: "white" }}>Points</Typography></FormLabel>
        <Typography variant="h6" sx={{ color: "white" }}>Attaque (Défense: {91 - donne.points})</Typography>
        <Slider name="points-slider" value={donne.points} max={91} valueLabelDisplay="on" sx={{ "margin-top": "2rem" }}
          marks={[{ value: pointsToWin(), label: pointsToWin() }]}
          onChange={(event: Event, newValue: number | number[]) => {
            setDonne((prevState) => ({ ...prevState, points: newValue as number }));
          }} />
        <Typography variant="h4">La donne est {isWon() ? 'gagnée' : 'perdue'} de {Math.abs(pointsToWin() - donne.points)}</Typography>
        {isWon() ? <EmojiEmotionsIcon /> : <SentimentVeryDissatisfiedIcon />}
      </FormControl>
    </main>
  );
}