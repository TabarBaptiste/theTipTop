'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  readonly page: number;
  readonly totalPages: number;
  readonly total: number;
  readonly onPageChange: (page: number) => void;
  /** Ce qui est compté, au pluriel : « lots remis », « lots en attente ». */
  readonly label: string;
}

/**
 * Navigation entre les pages d'une liste.
 *
 * Les boutons « premier » et « dernier » ne sont pas décoratifs : avec des
 * milliers de participations, une pagination limitée à précédent/suivant rend
 * la fin de la liste inatteignable en pratique.
 */
export function Pagination({ page, totalPages, total, onPageChange, label }: PaginationProps) {
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <nav
      aria-label="Pagination"
      className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-warm-beige pt-4 sm:flex-row"
    >
      <p className="text-sm text-stone-grey">
        <strong className="font-medium text-ink">{total.toLocaleString('fr-FR')}</strong> {label}
      </p>

      {/* Une seule page : le compteur suffit, la navigation n'aurait rien à faire. */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Première page"
            disabled={isFirst}
            onClick={() => onPageChange(1)}
          >
            <ChevronsLeft className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Page précédente"
            disabled={isFirst}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </Button>

          <span className="px-3 text-sm tabular-nums text-stone-grey">
            Page {page} sur {totalPages}
          </span>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Page suivante"
            disabled={isLast}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Dernière page"
            disabled={isLast}
            onClick={() => onPageChange(totalPages)}
          >
            <ChevronsRight className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
      )}
    </nav>
  );
}
