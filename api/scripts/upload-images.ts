// ===========================================
// Envoi des visuels de lots vers Cloudinary
// ===========================================
// Rejouable sans risque : chaque image part sous un identifiant stable avec
// overwrite, donc un second passage remplace au lieu de dupliquer.
//
// Les fichiers restent dans webapp/src/img : c'est d'eux que part chaque envoi,
// et ce script n'en est qu'une copie. Pour les visuels de lots, ils servent en
// plus de repli quand Cloudinary est injoignable ou non configuré - la seed
// enregistre alors null et l'interface les affiche. Les photographies de
// l'accueil, elles, sont référencées par leur URL Cloudinary : leur copie
// locale n'est plus qu'une source d'envoi. Ne pas la supprimer, sans quoi ce
// script n'aurait plus rien à téléverser pour elles.
//
//   npm run images:upload

import { createHash } from 'crypto';
import { readFile } from 'fs/promises';
import { basename, join } from 'path';
import { config as loadEnv } from 'dotenv';

import {
  PRIZE_IMAGE_PUBLIC_IDS,
  SITE_IMAGE_PUBLIC_IDS,
  buildImageUrl,
} from '../src/common/cloudinary';

loadEnv({ path: join(__dirname, '..', '.env') });

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

/** Les visuels vivent côté webapp, seul endroit où ils sont aussi empaquetés. */
const IMAGES_DIR = join(__dirname, '..', '..', 'webapp', 'src', 'img');

/**
 * Signature attendue par Cloudinary : les paramètres signés triés par nom,
 * assemblés en chaîne de requête, puis SHA-1 avec le secret en suffixe.
 *
 * Le secret n'est jamais transmis - seule son empreinte l'est.
 */
function sign(params: Record<string, string>, secret: string): string {
  const canonical = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return createHash('sha1')
    .update(canonical + secret)
    .digest('hex');
}

async function upload(publicId: string): Promise<string> {
  const fileName = `${basename(publicId)}.webp`;
  // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal -- basename() neutralise deja toute traversee de repertoire ; script d'admin execute manuellement, jamais expose en HTTP.
  const bytes = await readFile(join(IMAGES_DIR, fileName));

  // `overwrite` est signé, `file` et `api_key` ne le sont jamais.
  //
  // `invalidate` purge le visuel précédent des caches du CDN. Sans lui, l'URL
  // de livraison n'ayant pas de numéro de version, les serveurs de bordure
  // continuent de servir l'ancienne image - et un format par dérivé, donc
  // aussi longtemps pour l'AVIF que pour le WebP.
  const signed = {
    public_id: publicId,
    overwrite: 'true',
    invalidate: 'true',
    timestamp: Math.floor(Date.now() / 1000).toString(),
  };

  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(bytes)]), fileName);
  form.append('api_key', API_KEY as string);
  form.append('signature', sign(signed, API_SECRET as string));
  for (const [key, value] of Object.entries(signed)) {
    form.append(key, value);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${fileName} refusé (HTTP ${response.status}) : ${detail}`);
  }

  return fileName;
}

(async () => {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    console.error(
      'Cloudinary non configuré. Renseignez CLOUDINARY_CLOUD_NAME, ' +
        'CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans api/.env.',
    );
    process.exit(1);
  }

  console.log(`\nEnvoi vers le compte « ${CLOUD_NAME} »\n`);

  const lots = Object.entries(PRIZE_IMAGE_PUBLIC_IDS);
  const accueil = Object.entries(SITE_IMAGE_PUBLIC_IDS);

  for (const [titre, entrees] of [
    ['Visuels des lots', lots],
    ["Photographies de l'accueil", accueil],
  ] as [string, [string, string][]][]) {
    console.log(`${titre}\n`);

    for (const [code, publicId] of entrees) {
      const fileName = await upload(publicId);
      console.log(`  ${code.padEnd(14)} ${fileName}`);
      console.log(`  ${' '.repeat(14)} ${buildImageUrl(CLOUD_NAME, publicId)}\n`);
    }
  }

  // Seuls les visuels de lots transitent par la base : les photographies de
  // l'accueil sont référencées directement par les composants, la seed n'a
  // rien à en faire.
  console.log('Terminé. Lancez « npm run prisma:seed » pour enregistrer les URL des lots.\n');
})().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
