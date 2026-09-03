/**
 * Données structurées schema.org, au format JSON-LD.
 *
 * Elles décrivent le contenu aux moteurs dans un vocabulaire qu'ils
 * comprennent, ce que le seul balisage HTML ne permet pas : l'identité de
 * l'éditeur, ou le fait qu'un bloc de texte est une question fréquente.
 */
interface Props {
  /** Objet schema.org, sérialisé tel quel dans la page. */
  readonly data: Record<string, unknown>;
}

export function StructuredData({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      // Le contenu est construit côté serveur à partir de constantes du projet,
      // jamais d'une saisie utilisateur. Les chevrons sont malgré tout échappés :
      // un « </script> » présent dans une valeur fermerait la balise par
      // anticipation et ferait passer la suite pour du script exécutable.
      // nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml.react-dangerouslysetinnerhtml -- data provient uniquement de constantes internes, jamais d'une entree utilisateur.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replaceAll('<', String.raw`\u003c`) }}
    />
  );
}
