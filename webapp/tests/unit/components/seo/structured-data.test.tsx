// ===========================================
// Tests unitaires - Donnees structurees
// ===========================================
// Ce composant ecrit du JSON dans un <script> via dangerouslySetInnerHTML.
// L'echappement des chevrons n'est pas une precaution de principe : une chaine
// contenant « </script> » fermerait la balise par anticipation, et tout ce qui
// suit serait interprete comme du script executable par le navigateur.

import { render } from '@testing-library/react';

import { StructuredData } from '@/components/seo/structured-data';

/** Contenu brut du script injecte. */
function contenuDuScript(conteneur: HTMLElement) {
  return conteneur.querySelector('script[type="application/ld+json"]')?.innerHTML ?? '';
}

describe('StructuredData', () => {
  it('emet un script au type attendu par les moteurs', () => {
    const { container } = render(<StructuredData data={{ '@type': 'Organization' }} />);

    expect(container.querySelector('script[type="application/ld+json"]')).not.toBeNull();
  });

  it('serialise fidelement les donnees', () => {
    const donnees = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Thé Tip Top' };
    const { container } = render(<StructuredData data={donnees} />);

    expect(JSON.parse(contenuDuScript(container))).toEqual(donnees);
  });

  // Le cas qui justifie l'echappement.
  it('neutralise une balise fermante glissee dans une valeur', () => {
    const { container } = render(
      <StructuredData data={{ name: '</script><script>alert(1)</script>' }} />,
    );
    const brut = contenuDuScript(container);

    expect(brut).not.toContain('</script>');
    expect(brut).toContain('\\u003c');
  });

  // L'echappement ne doit pas abimer la donnee : elle doit rester lisible par
  // un analyseur JSON, chevrons compris.
  it('conserve la valeur exacte apres echappement', () => {
    const donnees = { name: 'Thé <Tip> Top' };
    const { container } = render(<StructuredData data={donnees} />);

    expect(JSON.parse(contenuDuScript(container))).toEqual(donnees);
  });

  it('gere les accents sans les mutiler', () => {
    const { container } = render(<StructuredData data={{ ville: 'Nice, Côte d’Azur' }} />);

    expect(JSON.parse(contenuDuScript(container))).toEqual({ ville: 'Nice, Côte d’Azur' });
  });
});
