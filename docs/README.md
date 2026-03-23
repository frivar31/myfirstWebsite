# CCML – Site Web

Site web moderne du Centre Culturel Musulman de Longueuil.

---

## Hébergement sur GitHub Pages

1. Allez dans **Settings → Pages** de votre dépôt GitHub
2. Source : **Deploy from a branch**
3. Branch : `claude/mosque-website-prayer-calendar-5snFq` (ou `main` si vous fusionnez)
4. Folder : `/mosque-ccml`
5. Cliquez **Save** — le site sera disponible sur `https://VOTRE-USERNAME.github.io/myfirstWebsite/mosque-ccml/`

> Pour utiliser votre propre domaine `ccmlongueuil.ca` :
> - Ajoutez un fichier `CNAME` dans `/mosque-ccml/` contenant `ccmlongueuil.ca`
> - Chez votre registraire de domaine (ex: Godaddy, Namecheap), créez un enregistrement DNS `CNAME www → VOTRE-USERNAME.github.io`

---

## Intégration Zeffy (dons en ligne)

Zeffy est 100 % gratuit pour les OBNL canadiens. Aucuns frais de plateforme.

### Étapes :

1. Créez un compte sur [zeffy.com](https://www.zeffy.com/fr-CA)
2. Créez une **campagne de collecte de fonds / don**
3. Dans les paramètres de votre formulaire, allez dans **Méthode de paiement**
4. Ajoutez votre compte **Desjardins** :
   - Connectez via **virement bancaire (EFT)** ou **Stripe** (carte de crédit)
   - Pour Desjardins : choisissez **virement bancaire direct** → entrez vos informations bancaires Desjardins (numéro de transit, institution, compte)
5. Une fois le formulaire créé, copiez l'**URL d'intégration embed** :
   `https://www.zeffy.com/fr-CA/embed/donation-form/VOTRE-ID`
6. Dans `index.html`, remplacez dans la balise `<iframe>` :
   ```
   src="https://www.zeffy.com/fr-CA/embed/donation-form/VOTRE-ID"
   ```

---

## Formulaire de contact (emails via Formspree)

Formspree permet de recevoir les messages du formulaire par email, sans serveur.

### Étapes :

1. Créez un compte gratuit sur [formspree.io](https://formspree.io)
2. Créez un **nouveau formulaire** → entrez votre adresse email (ex: info@ccmlongueuil.ca)
3. Copiez votre **Form ID** (ex: `xpwzjkrb`)
4. Dans `index.html`, remplacez dans la balise `<form>` :
   ```
   action="https://formspree.io/f/VOTRE-FORMSPREE-ID"
   ```
   par exemple :
   ```
   action="https://formspree.io/f/xpwzjkrb"
   ```
5. Vous recevrez chaque message directement dans votre boîte email avec le sujet indiqué

> **Plan gratuit Formspree :** 50 soumissions/mois. Pour plus, passez au plan payant (~10 $/mois).

---

## Structure du projet

```
mosque-ccml/
├── index.html       ← Page principale
├── css/
│   └── style.css    ← Tous les styles
├── js/
│   └── app.js       ← Horaires de prière (API AlAdhan), formulaire
├── .nojekyll        ← Pour GitHub Pages (désactive Jekyll)
└── README.md        ← Ce fichier
```
