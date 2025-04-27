// export const getRandomizedQuestions = (media) => {
//   const neutralQuestions = media.Neutral || [];
//   const nonNeutralQuestions = [
//     ...(media.Happy || []),
//     ...(media.Sad || []),
//     ...(media.Anger || []),
//     ...(media.Fear || []),
//   ];

//   let selectedQuestions = [];

//   // Step 1: Randomly decide if a neutral question should be included (50% chance)
//   const includeNeutral = Math.random() < 0.5; // 50% probability
//   if (includeNeutral && neutralQuestions.length > 0) {
//     const firstQuestion = neutralQuestions[Math.floor(Math.random() * neutralQuestions.length)];
//     selectedQuestions.push(firstQuestion);
//   }

//   // Step 2: Shuffle non-neutral questions and pick the remaining ones
//   const shuffledNonNeutral = nonNeutralQuestions.sort(() => Math.random() - 0.5);
//   while (selectedQuestions.length < 6 && shuffledNonNeutral.length > 0) {
//     selectedQuestions.push(shuffledNonNeutral.pop());
//   }

//   return selectedQuestions;
// };
export const getRandomizedQuestions = (media) => {
  const depressionQuestions = media.depressionVideos || [];
  const anxietyQuestions = media.anxietyVideos || [];
  const stressQuestions = media.stressVideos || [];

  let selectedQuestions = [];

  // Step 1: Ensure at least 2 depression questions
  if (depressionQuestions.length < 2) {
    throw new Error("Not enough depression questions. At least 2 required.");
  }
  const shuffledDepression = depressionQuestions.sort(() => Math.random() - 0.5);
  selectedQuestions.push(...shuffledDepression.slice(0, 2));

  // Step 2: Ensure at least 2 anxiety questions
  if (anxietyQuestions.length < 2) {
    throw new Error("Not enough anxiety questions. At least 2 required.");
  }
  const shuffledAnxiety = anxietyQuestions.sort(() => Math.random() - 0.5);
  selectedQuestions.push(...shuffledAnxiety.slice(0, 2));

  // Step 3: Ensure at least 2 stress questions
  if (stressQuestions.length < 2) {
    throw new Error("Not enough stress questions. At least 2 required.");
  }
  const shuffledStress = stressQuestions.sort(() => Math.random() - 0.5);
  selectedQuestions.push(...shuffledStress.slice(0, 2));

  return selectedQuestions;
};