'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ticket, Gift, ArrowLeft, Loader2, PartyPopper, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { getPrizeName, getPrizeValue } from '@/lib/utils';

const participateSchema = z.object({
  code: z
    .string()
    .length(10, 'Le code doit contenir exactement 10 caractères')
    .regex(/^[A-Z0-9]+$/, 'Le code ne doit contenir que des lettres majuscules et des chiffres'),
});

type ParticipateFormData = z.infer<typeof participateSchema>;

interface ParticipationResult {
  participation: {
    id: string;
    ticket: {
      code: string;
      prizeType: string;
    };
  };
}

export default function ParticipatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [result, setResult] = useState<ParticipationResult | null>(null);

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
      const response = await api.post('/participations', { code: data.code });
      return response.data as ParticipationResult;
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['participations'] });
      toast.success('Félicitations ! Vous avez gagné !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la participation';
      toast.error(message);
    },
  });

  const onSubmit = (data: ParticipateFormData) => {
    mutation.mutate(data);
  };

  const handleNewParticipation = () => {
    setResult(null);
    reset();
  };

  // Affichage du résultat gagnant
  if (result) {
    const prizeType = result.participation.ticket.prizeType;
    const prizeName = getPrizeName(prizeType);
    const prizeValue = getPrizeValue(prizeType);

    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-tea-50 to-white py-8">
        <div className="container mx-auto max-w-xl px-4">
          <Card className="relative overflow-hidden border-2 border-tea-400">
            {/* Confetti effect placeholder */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rotate-45 bg-gradient-to-br from-gold-200 to-gold-400 opacity-30" />
            <div className="absolute -left-10 -bottom-10 h-40 w-40 rotate-45 bg-gradient-to-br from-tea-200 to-tea-400 opacity-30" />
            
            <CardContent className="relative p-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold-100 to-gold-200">
                <PartyPopper className="h-10 w-10 text-gold-600" />
              </div>
              
              <h1 className="font-display text-3xl font-bold text-gray-900">
                Félicitations ! 🎉
              </h1>
              
              <p className="mt-4 text-lg text-gray-600">
                Vous avez gagné :
              </p>
              
              <div className="mt-6 rounded-2xl bg-gradient-to-r from-tea-100 to-emerald-100 p-6">
                <Gift className="mx-auto h-12 w-12 text-tea-600" />
                <h2 className="mt-4 font-display text-2xl font-bold text-tea-800">
                  {prizeName}
                </h2>
                <p className="mt-2 text-xl font-semibold text-gold-600">
                  Valeur : {prizeValue}
                </p>
              </div>

              <div className="mt-6 rounded-lg bg-gray-50 p-4 text-left">
                <p className="text-sm text-gray-600">
                  <strong>Code utilisé :</strong> {result.participation.ticket.code}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  <Sparkles className="mr-1 inline h-4 w-4 text-gold-500" />
                  Vous êtes automatiquement inscrit au tirage au sort du grand prix !
                </p>
              </div>

              <div className="mt-6 rounded-lg bg-tea-50 p-4">
                <p className="text-sm text-tea-700">
                  📍 Rendez-vous dans notre boutique au{' '}
                  <strong>18 rue Léon Foucault, Nice</strong> pour récupérer votre lot.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  onClick={handleNewParticipation}
                  variant="outline"
                  className="flex-1"
                >
                  <Ticket className="mr-2 h-4 w-4" />
                  Nouveau code
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/dashboard">
                    Voir mes participations
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Formulaire de participation
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
      <div className="container mx-auto max-w-xl px-4">
        {/* Back button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-tea-100">
              <Ticket className="h-8 w-8 text-tea-600" />
            </div>
            <CardTitle className="text-2xl">Participer au jeu-concours</CardTitle>
            <CardDescription>
              Entrez le code à 10 caractères présent sur votre ticket de caisse
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code">Code de participation</Label>
                <Input
                  id="code"
                  placeholder="Ex: ABC123DEF4"
                  className="text-center text-lg tracking-wider"
                  maxLength={10}
                  {...register('code', {
                    onChange: (e) => {
                      e.target.value = e.target.value.toUpperCase();
                    },
                  })}
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Le code contient 10 caractères (lettres et chiffres uniquement)
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <Gift className="mr-2 h-4 w-4" />
                    Valider mon code
                  </>
                )}
              </Button>
            </form>

            {/* Help */}
            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <h3 className="font-medium text-gray-900">Où trouver mon code ?</h3>
              <p className="mt-2 text-sm text-gray-600">
                Le code de participation se trouve sur le ticket de caisse remis 
                lors de votre achat d&apos;un montant minimum de 49€ dans notre 
                boutique ou sur notre site internet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
