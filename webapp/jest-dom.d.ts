// Rend visibles les matchers de @testing-library/jest-dom au verificateur de
// types.
//
// jest.setup.js les importe bien a l'execution, mais c'est un fichier
// JavaScript : TypeScript ne le lit pas, et l'augmentation de types n'etait
// donc jamais chargee. Consequence, chaque toBeInTheDocument, toHaveAttribute
// ou toBeDisabled d'un test faisait echouer le build de production.
import '@testing-library/jest-dom';
