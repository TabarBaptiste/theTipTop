'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Barcode, Layers, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

// Alignée sur la limite imposée côté serveur (TicketsService.getAvailableCodes)
const MAX_BULK = 100;

interface AvailableCodesResponse {
  codes: string[];
  count: number;
}

/**
 * Simule l'action normalement effectuée par le logiciel de caisse : marquer
 * un ou plusieurs tickets comme distribués (imprimés sur un ticket de caisse).
 * Aucune intégration caisse n'existe encore, ce panneau permet de tester le
 * flux sans appeler l'API directement via Swagger.
 */
export function TicketDistributionCard() {
  const [code, setCode] = useState('');
  const [count, setCount] = useState('10');
  const [lastBatch, setLastBatch] = useState<string[] | null>(null);

  const distributeOne = useMutation({
    mutationFn: async (c: string) => (await api.post(`/tickets/${c}/distribute`)).data,
    onSuccess: (_, c) => {
      toast.success(`Ticket ${c} marqué comme distribué`);
      setCode('');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Impossible de distribuer ce ticket');
    },
  });

  const distributeBatch = useMutation({
    mutationFn: async (n: number) =>
      (await api.get<AvailableCodesResponse>('/tickets/available', { params: { count: n } })).data,
    onSuccess: (data) => {
      setLastBatch(data.codes);
      toast.success(`${data.count} tickets distribués`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Impossible de distribuer des tickets');
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Barcode className="h-5 w-5" strokeWidth={1.5} />
          Distribution des tickets (caisse)
        </CardTitle>
        <CardDescription>
          Simule la remise d&apos;un ticket en boutique. En production, cette action est
          effectuée automatiquement par le logiciel de caisse.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Un seul ticket, par code */}
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = code.trim();
            if (trimmed) distributeOne.mutate(trimmed);
          }}
        >
          <div className="flex-1 space-y-1">
            <Label htmlFor="distribute-code">Code du ticket</Label>
            <Input
              id="distribute-code"
              placeholder="ABC123DEF4"
              maxLength={10}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>
          <Button type="submit" disabled={!code.trim() || distributeOne.isPending}>
            {distributeOne.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Distribuer'
            )}
          </Button>
        </form>

        {/* Plusieurs tickets d'un coup */}
        <form
          className="flex items-end gap-2 border-t border-warm-beige pt-6"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(count);
            if (n > 0) distributeBatch.mutate(Math.min(n, MAX_BULK));
          }}
        >
          <div className="flex-1 space-y-1">
            <Label htmlFor="distribute-count">Nombre de tickets (max {MAX_BULK})</Label>
            <Input
              id="distribute-count"
              type="number"
              min={1}
              max={MAX_BULK}
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline" disabled={distributeBatch.isPending}>
            {distributeBatch.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Layers className="mr-2 h-4 w-4" strokeWidth={1.5} />
                Distribuer en lot
              </>
            )}
          </Button>
        </form>

        {lastBatch && lastBatch.length > 0 && (
          <div className="rounded-soft bg-terracotta-50 p-3 text-xs">
            <p className="mb-1 font-medium text-noir">Derniers codes distribués :</p>
            <p className="break-all font-mono text-stone-grey">{lastBatch.join(', ')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
