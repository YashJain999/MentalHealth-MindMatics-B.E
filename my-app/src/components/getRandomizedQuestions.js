export const getRandomizedQuestions = (media) => {
  const happyQuestions = media.Happy || [];
  const sadQuestions = media.Sad || [];

  let selectedQuestions = [];

  // Step 1: Shuffle and select first 3 questions from Happy
  const shuffledHappy = happyQuestions.sort(() => Math.random() - 0.5);
  for (let i = 0; i < 3 && shuffledHappy.length > 0; i++) {
    selectedQuestions.push(shuffledHappy.pop());
  }

  // Step 2: Shuffle and select next 3 questions from Sad
  const shuffledSad = sadQuestions.sort(() => Math.random() - 0.5);
  for (let i = 0; i < 3 && shuffledSad.length > 0; i++) {
    selectedQuestions.push(shuffledSad.pop());
  }

  return selectedQuestions;
};