// Aucune des six photos du projet ne montre une tasse de profil : toutes sont
// vues de dessus ou cadrent un contenant ferme. Une vapeur ne se lit pas sur
// une tasse vue de dessus, et la retoucher pour en ajouter donnerait un
// mouvement colle sur une image fixe. L'illustration permet une vapeur qui
// part reellement du the.

/** Une volute, decalee dans le temps pour ne pas monter avec les autres. */
function Volute({ d, delai }: { d: string; delai: number }) {
  return (
    <path
      d={d}
      className="animate-vapeur"
      style={{ animationDelay: `${delai}s` }}
      fill="none"
      stroke="url(#degrade-vapeur)"
      strokeWidth="7"
      strokeLinecap="round"
    />
  );
}

export function SteamingCup() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="h-full w-full"
      role="img"
      aria-label="Illustration d'une tasse de thé fumante"
    >
      <defs>
        <radialGradient id="halo-tasse" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#F9EDD9" />
          <stop offset="100%" stopColor="#F9EDD9" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="degrade-vapeur" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#A85D04" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#A85D04" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="degrade-the" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#BA6905" />
          <stop offset="100%" stopColor="#8B4D03" />
        </linearGradient>
        <linearGradient id="degrade-tasse" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#FAF6EF" />
          <stop offset="100%" stopColor="#E8D5B0" />
        </linearGradient>
      </defs>

      <circle cx="200" cy="200" r="185" fill="url(#halo-tasse)" />

      <Volute d="M 172 168 c -14 -20 12 -32 -2 -52 c -11 -16 8 -28 0 -42" delai={0} />
      <Volute d="M 200 158 c -16 -24 14 -36 -2 -60 c -13 -19 9 -32 0 -48" delai={1.2} />
      <Volute d="M 230 168 c -14 -20 12 -32 -2 -52 c -11 -16 8 -28 0 -42" delai={2.4} />

      {/* Soucoupe */}
      <ellipse cx="200" cy="336" rx="132" ry="24" fill="#E8D5B0" />
      <ellipse cx="200" cy="331" rx="132" ry="24" fill="url(#degrade-tasse)" />

      {/* Anse : tracee avant le corps pour que celui-ci la recouvre a la jonction */}
      <path
        d="M 276 224 c 48 2 52 62 4 74"
        fill="none"
        stroke="#E8D5B0"
        strokeWidth="16"
        strokeLinecap="round"
      />

      {/* Corps */}
      <path
        d="M 122 196 L 134 292 c 3 26 22 40 66 40 c 44 0 63 -14 66 -40 l 12 -96 Z"
        fill="url(#degrade-tasse)"
      />

      {/* Le liquide, puis le bord : l'ellipse du bord passe par-dessus pour
          fermer proprement la silhouette de la tasse. */}
      <ellipse cx="200" cy="196" rx="78" ry="19" fill="#EFE6D8" />
      <ellipse cx="200" cy="198" rx="66" ry="14" fill="url(#degrade-the)" />
      <ellipse
        cx="200"
        cy="196"
        rx="78"
        ry="19"
        fill="none"
        stroke="#E8D5B0"
        strokeWidth="4"
      />
    </svg>
  );
}
