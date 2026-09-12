import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { DietPlan, PantryItem } from '../types';

interface SubstitutionModalProps {
  ingredientName: string;
  isOpen: boolean;
  onClose: () => void;
  dietPlan: DietPlan | null;
  pantryItems: PantryItem[];
  onApplySubstitution?: (newIngredient: string) => void;
}

interface SubstitutionOption {
  name: string;
  amount: string;
  reason: string;
  alreadyInPantry: boolean;
}

export const SubstitutionModal: React.FC<SubstitutionModalProps> = ({
  ingredientName,
  isOpen,
  onClose,
  dietPlan,
  pantryItems,
  onApplySubstitution,
}) => {
  const [loading, setLoading] = useState(false);
  const [substitutions, setSubstitutions] = useState<SubstitutionOption[]>([]);
  const [dietitianNote, setDietitianNote] = useState<string>('');
  const [hasFetched, setHasFetched] = useState(false);

  React.useEffect(() => {
    if (isOpen && ingredientName && !hasFetched) {
      fetchSubstitutions();
    }
  }, [isOpen, ingredientName]);

  const fetchSubstitutions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/diet/substitute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientToReplace: ingredientName,
          dietPlan,
          pantryItems,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.substitutions) {
        setSubstitutions(data.data.substitutions);
        setDietitianNote(data.data.dietitianNote || '');
        setHasFetched(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#233527]/40 backdrop-blur-xs">
      <div className="bg-[#FCFBF9] border border-[#DDD9CD] rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#637966] hover:text-[#233527] hover:bg-[#EAE6DE] rounded-full transition-colors"
          id="close-sub-modal-btn"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8EFE9] text-[#4A6B50] flex items-center justify-center">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif-natural text-lg font-semibold text-[#233527]">
              Sostituzione Intelligente
            </h3>
            <p className="text-xs text-[#5C7260]">
              Trova un'alternativa per <strong className="text-[#384E3C]">{ingredientName}</strong> conforme alla tua dieta
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <Loader2 className="w-7 h-7 text-[#4A6B50] animate-spin" />
            <p className="text-sm text-[#4E6252] font-medium">
              Calcolo equivalenze nutrizionali e controllo dispensa...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {dietitianNote && (
              <div className="p-3 bg-[#F2F6F3] rounded-xl text-xs text-[#39533D] border border-[#D5E4D8] leading-relaxed">
                💡 <strong>Nota del nutrizionista:</strong> {dietitianNote}
              </div>
            )}

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {substitutions.length > 0 ? (
                substitutions.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-[#E4E0D6] bg-[#FFFFFF] hover:border-[#98B89E] hover:bg-[#F9FAF9] transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-[#233527]">{sub.name}</span>
                        <span className="text-xs font-medium text-[#4A6B50] bg-[#E8EFE9] px-2 py-0.5 rounded-md">
                          {sub.amount}
                        </span>
                        {sub.alreadyInPantry && (
                          <span className="text-[10px] font-semibold text-[#2D5A38] bg-[#D7EEDC] px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Check className="w-3 h-3" /> Ce l'hai in casa!
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#637966]">{sub.reason}</p>
                    </div>

                    {onApplySubstitution && (
                      <button
                        onClick={() => {
                          onApplySubstitution(`${sub.name} (${sub.amount})`);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 text-xs font-medium bg-[#E8EFE9] text-[#3D5642] hover:bg-[#4A6B50] hover:text-white rounded-lg transition-colors flex items-center gap-1 shrink-0"
                      >
                        Usa questo <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-sm text-[#6B7E6D]">
                  Nessuna alternativa diretta trovata o errore di caricamento.
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#EAE6DE] hover:bg-[#DDD9CD] text-[#2C3E30] text-xs font-medium rounded-xl transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
