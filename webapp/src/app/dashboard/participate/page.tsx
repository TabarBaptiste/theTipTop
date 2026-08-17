'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Gift, Loader2, PartyPopper, Sparkles, Leaf, ShieldCheck, Heart, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { trackParticipateSubmit, trackParticipateSuccess, trackParticipateFailure } from '@/lib/analytics';

const participateSchema = z.object({
  code: z
    .string()
    .length(10, 'Le code doit contenir exactement 10 caracteres')
    .regex(/^[A-Z0-9]+$/, 'Le code ne doit contenir que des lettres majuscules et des chiffres'),
});

type ParticipateFormData = z.infer<typeof participateSchema>;

// Aligné sur la réponse réelle de POST /participations (structure plate)
interface ParticipationResult {
  id: string;
  code: string;
  prizeType: string;
  prize: {
    name: string;
    description: string;
    value: string;
  };
  participatedAt: string;
  prizeDelivered: boolean;
}

interface PrizeApi {
  code: string;
  name: string;
  description: string;
  value: string;
  percentage: number;
}

const rules = [
  { color: 'bg-moss', text: 'Le jeu-concours est ouvert a toute personne ayant effectue un achat superieur a 49€ en magasin.' },
  { color: 'bg-terracotta-deep', text: 'Les participants disposent de 30 jours apres la fin du jeu pour reclamer leur lot.' },
  { color: 'bg-red-500', text: 'Le reglement complet est disponible aupres de Maitre Arnaud Rick, huissier de justice.' },
];

export default function ParticipatePage() {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<ParticipationResult | null>(null);

  // Chargement des lots depuis l'API (source de vérité en DB)
  const {
    data: prizes,
    isLoading: prizesLoading,
    isError: prizesError,
    refetch: refetchPrizes,
  } = useQuery<PrizeApi[]>({
    queryKey: ['prizes'],
    queryFn: async () => {
      const response = await api.get('/tickets/prizes');
      return response.data;
    },
    staleTime: Infinity,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ParticipateFormData>({
    resolver: zodResolver(participateSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: ParticipateFormData) => {
      trackParticipateSubmit();
      const response = await api.post('/participations', { code: data.code });
      return response.data as ParticipationResult;
    },
    onSuccess: (data) => {
      trackParticipateSuccess(data.prizeType, data.prize.value);
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['participations'] });
      toast.success('Felicitations ! Vous avez gagne !');
    },
    onError: () => {
      trackParticipateFailure('invalid_or_used_code');
      toast.error('Code invalide ou deja utilise');
    },
  });

  const onSubmit = (data: ParticipateFormData) => {
    mutation.mutate(data);
  };

  const handleNewParticipation = () => {
    setResult(null);
    reset();
  };

  if (result) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-cream py-12">
        <div className="container mx-auto max-w-xl px-6">
          <div className="rounded-card border-2 border-terracotta-deep bg-white p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-terracotta-50">
              <PartyPopper className="h-8 w-8 text-terracotta-deep" strokeWidth={1.5} />
            </div>

            <h1 className="mt-6 font-display text-h2 text-noir">Felicitations !</h1>
            <p className="mt-2 text-sm text-stone-grey">Vous avez gagne :</p>

            <div className="mt-6 rounded-card bg-terracotta-50 p-6">
              <Gift className="mx-auto h-10 w-10 text-terracotta-deep" strokeWidth={1.5} />
              <h2 className="mt-3 font-display text-xl font-bold text-noir">
                {result.prize.name}
              </h2>
              <p className="mt-1 font-functional text-lg font-bold text-terracotta-deep">
                Valeur : {result.prize.value}
              </p>
            </div>

            <div className="mt-6 rounded-soft bg-cream p-4 text-left">
              <p className="text-xs text-stone-grey">
                <strong>Code utilise :</strong> {result.code}
              </p>
              <p className="mt-2 text-xs text-stone-grey">
                <Sparkles className="mr-1 inline h-3 w-3 text-gold-500" />
                Vous etes automatiquement inscrit au tirage au sort du grand prix !
              </p>
            </div>

            <div className="mt-6 flex gap-4">
              <Button onClick={handleNewParticipation} variant="outline" className="flex-1">
                Nouveau code
              </Button>
              <Button asChild className="flex-1">
                <Link href="/dashboard">Mes participations</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-cream">
      {/* Hero */}
      <section className="bg-white py-12 text-center">
        <div className="container mx-auto px-6">
          <p className="font-functional text-ui uppercase tracking-[2px] text-terracotta-deep">
            Jeu-concours The Tip Top
          </p>
          <h1 className="mt-3 font-display text-h1 text-noir">
            Participez et gagnez !
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-stone-grey">
            Testez votre code et decouvrez immediatement votre lot. 100% des tickets sont gagnants,
            alors n&apos;attendez plus !
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {/* Soumettre votre code */}
        <section className="mx-auto max-w-xl">
          <h2 className="font-display text-h2 text-noir">Soumettre votre code</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="code">Code du ticket</Label>
              <Input
                id="code"
                placeholder="Ex: ABC123DEF4"
                className="text-center text-lg tracking-wider"
                maxLength={10}
                {...register('code', {
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value.toUpperCase();
                  },
                })}
              />
              {errors.code && (
                <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>
              )}
            </div>

            <p className="text-xs text-stone-grey">
              Le code se trouve sur votre ticket de caisse (achat min. 49€)
            </p>

            <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verification...
                </>
              ) : (
                'Valider mon code'
              )}
            </Button>
          </form>
        </section>

        {/* Reinitialiser votre code */}
        <section className="mx-auto mt-12 max-w-xl rounded-card bg-moss/10 p-6">
          <h2 className="font-display text-h2 text-noir">Reinitialiser votre code</h2>
          <p className="mt-2 text-xs text-stone-grey">
            Code perdu ou illisible ? Contactez notre service client.
          </p>
          <Button asChild variant="secondary" size="sm" className="mt-4 w-full">
            <a href="mailto:contact@thetiptop.fr?subject=Code%20perdu%20ou%20illisible">
              <RotateCcw className="mr-2 h-4 w-4" strokeWidth={1.5} />
              Contacter le support
            </a>
          </Button>
        </section>

        {/* Repartition des lots */}
        <section className="mt-16">
          <h2 className="font-display text-h2 text-noir">Repartition des lots</h2>
          <p className="mt-1 text-xs text-stone-grey">
            500 000 tickets · 100% gagnants
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {prizesLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-card border border-warm-beige bg-white p-5 animate-pulse"
                >
                  <div className="h-3 w-2/3 rounded bg-warm-beige" />
                  <div className="mt-3 h-4 w-full rounded bg-warm-beige" />
                  <div className="mt-3 flex items-center justify-between">
                    <div className="h-3 w-1/3 rounded bg-warm-beige" />
                    <div className="h-3 w-1/4 rounded bg-warm-beige" />
                  </div>
                </div>
              ))}

            {prizesError && (
              <div className="col-span-2 flex flex-col items-center gap-3 rounded-card border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm font-semibold text-red-600">
                  Impossible de charger les lots
                </p>
                <p className="text-xs text-stone-grey">
                  Une erreur est survenue. Veuillez réessayer.
                </p>
                <Button variant="outline" size="sm" onClick={() => refetchPrizes()}>
                  Réessayer
                </Button>
              </div>
            )}

            {!prizesLoading &&
              !prizesError &&
              prizes?.map((prize) => (
                <div
                  key={prize.code}
                  className="rounded-card border border-warm-beige bg-white p-5"
                >
                  <p className="font-functional text-ui uppercase tracking-[2px] text-terracotta-deep">
                    {prize.name}
                  </p>
                  <p className="mt-2 font-functional text-sm font-semibold text-noir">
                    {prize.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-stone-grey">Chance : {prize.percentage}%</span>
                    {prize.value && (
                      <span className="font-functional text-sm font-bold text-terracotta-deep">
                        {prize.value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Reglement du concours */}
        <section className="mt-16">
          <h2 className="font-display text-h2 text-noir">Reglement du concours</h2>
          <div className="mt-6 space-y-3 rounded-card bg-terracotta-50 p-6">
            {rules.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${rule.color}`} />
                <p className="text-xs leading-relaxed text-noir">{rule.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Votre engagement */}
        <section className="mt-16 text-center">
          <h2 className="font-display text-h2 text-noir">Votre engagement</h2>
          <p className="mt-2 text-xs text-stone-grey">
            The Tip Top s&apos;engage dans une demarche responsable
          </p>

          <div className="mt-8 flex justify-center gap-8">
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-moss/10">
                <Leaf className="h-7 w-7 text-moss" strokeWidth={1.5} />
              </div>
              <span className="mt-2 font-functional text-[10px] font-semibold uppercase tracking-[1px] text-noir">
                Eco-responsable
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-terracotta-50">
                <ShieldCheck className="h-7 w-7 text-terracotta-deep" strokeWidth={1.5} />
              </div>
              <span className="mt-2 font-functional text-[10px] font-semibold uppercase tracking-[1px] text-noir">
                Certifie bio
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-100">
                <Heart className="h-7 w-7 text-gold-600" strokeWidth={1.5} />
              </div>
              <span className="mt-2 font-functional text-[10px] font-semibold uppercase tracking-[1px] text-noir">
                Solidaire
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
