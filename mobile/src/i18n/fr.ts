/**
 * Source of truth — every other locale is judged against this one's shape
 * (see `en.ts`). Namespaced per feature so two sections never fight over
 * the same key; add a namespace here when a section starts, don't
 * pre-author ones nothing uses yet.
 */
export const fr = {
  common: {
    next: "Continuer",
    back: "Retour",
    cancel: "Annuler",
    save: "Enregistrer",
    done: "Terminé",
    edit: "Modifier",
    delete: "Supprimer",
    add: "Ajouter",
    optional: "facultatif",
  },
};

export type Dictionary = typeof fr;
