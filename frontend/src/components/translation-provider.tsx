"use client";

import { useEffect } from "react";

type Language = "en" | "rw" | "fr" | "sw";
const dictionary: Record<Exclude<Language, "en">, Record<string, string>> = {
  rw: { "Add your property":"Andika inzu yawe", "Add your property ↗":"Andika inzu yawe ↗", "Find a home":"Shaka inzu", "List a house":"Andika inzu", "For agents":"Kwamamaza", "How it works":"Uko bikora", "Sign in":"Injira", "Get started →":"Tangira →", "Get started free →":"Tangira ku buntu →", "List your property ↗":"Andika inzu yawe ↗", "Rwanda's trusted rental marketplace":"Isoko ryizewe ryo gukodesha inzu mu Rwanda", "A place to call ":"Aho wahamagara ", "made simple.":"byoroshye.", "Find a home you love, list with confidence, and work with trusted local agents—all in one place.":"Shaka inzu ukunda, andika iyanyu wizeye, kandi ukorane n'abahuza bizewe—ahantu hamwe.", "from renters across Kigali":"by'abakodesha bo muri Kigali", "Explore homes":"Reba amazu", "Made for the way you ":"Byagenewe uko ", "live.":"ubaho.", "View all homes →":"Reba amazu yose →", "Renting, made human":"Gukodesha byoroherejwe", "More clarity.":"Ubusobanuro bwinshi.", "More confidence.":"Icyizere kinini.", "Commissioners are":"Abahuza ni", "our partners.":"abafatanyabikorwa bacu.", "Become an agent →":"Ba umuhuza →", "A simpler way forward":"Inzira yoroshye", "Ready to find your next ":"Witeguye kubona inzu yawe ", "Not sure where to begin? ":"Ntazi aho watangirira? ", "Search homes →":"Shaka amazu →", "Back to InzuHub":"Subira kuri InzuHub", "Find your next home":"Shaka inzu yawe ikurikira", "Start with what":"Tangirana n'ibyo", "matters to you.":"ukeneye.", "Location":"Aho uherereye", "Budget":"Ingengo y'imari", "Room numbers":"Umubare w'ibyumba", "Toilet":"Ubwiherero", "Any budget":"Ingengo yose", "Any room number":"Ibyumba byose", "Any toilet":"Ubwiherero bwose", "Request a viewing →":"Saba gusura inzu →", "Back to homes":"Subira ku mazu" },
  fr: { "Add your property":"Ajouter votre logement", "Add your property ↗":"Ajouter votre logement ↗", "Find a home":"Trouver un logement", "List a house":"Publier un logement", "For agents":"Pour les agents", "How it works":"Comment ça marche", "Sign in":"Se connecter", "Get started →":"Commencer →", "Get started free →":"Commencer gratuitement →", "List your property ↗":"Publier votre logement ↗", "Rwanda's trusted rental marketplace":"La plateforme locative de confiance au Rwanda", "A place to call ":"Un lieu à appeler ", "made simple.":"chez soi, simplement.", "Find a home you love, list with confidence, and work with trusted local agents—all in one place.":"Trouvez un logement que vous aimez, publiez en confiance et collaborez avec des agents locaux de confiance.", "from renters across Kigali":"par des locataires à Kigali", "Explore homes":"Explorer les logements", "Made for the way you ":"Pensé pour votre ", "live.":"façon de vivre.", "View all homes →":"Voir tous les logements →", "Renting, made human":"La location, plus humaine", "More clarity.":"Plus de clarté.", "More confidence.":"Plus de confiance.", "Commissioners are":"Les agents sont", "our partners.":"nos partenaires.", "Become an agent →":"Devenir agent →", "A simpler way forward":"Une voie plus simple", "Ready to find your next ":"Prêt à trouver votre prochain ", "Not sure where to begin? ":"Vous ne savez pas par où commencer ? ", "Search homes →":"Rechercher →", "Back to InzuHub":"Retour à InzuHub", "Find your next home":"Trouvez votre prochain logement", "Start with what":"Commencez par ce qui", "matters to you.":"compte pour vous.", "Location":"Localisation", "Budget":"Budget", "Room numbers":"Nombre de pièces", "Toilet":"Toilettes", "Any budget":"Tout budget", "Any room number":"Tout nombre de pièces", "Any toilet":"Toutes toilettes", "Request a viewing →":"Demander une visite →", "Back to homes":"Retour aux logements" },
  sw: { "Add your property":"Ongeza nyumba yako", "Add your property ↗":"Ongeza nyumba yako ↗", "Find a home":"Tafuta nyumba", "List a house":"Orodhesha nyumba", "For agents":"Kwa mawakala", "How it works":"Jinsi inavyofanya kazi", "Sign in":"Ingia", "Get started →":"Anza →", "Get started free →":"Anza bila malipo →", "List your property ↗":"Orodhesha nyumba yako ↗", "Rwanda's trusted rental marketplace":"Soko la kuaminika la nyumba za kukodisha Rwanda", "A place to call ":"Mahali pa kuita ", "made simple.":"nyumbani, kwa urahisi.", "Find a home you love, list with confidence, and work with trusted local agents—all in one place.":"Tafuta nyumba unayoipenda, orodhesha kwa ujasiri na ushirikiane na mawakala waaminifu—mahali pamoja.", "from renters across Kigali":"kutoka kwa wapangaji Kigali", "Explore homes":"Gundua nyumba", "Made for the way you ":"Imetengenezwa kwa jinsi unavyo", "live.":"ishi.", "View all homes →":"Tazama nyumba zote →", "Renting, made human":"Ukodishaji wa kibinadamu", "More clarity.":"Uwazi zaidi.", "More confidence.":"Ujasiri zaidi.", "Commissioners are":"Mawakala ni", "our partners.":"washirika wetu.", "Become an agent →":"Kuwa wakala →", "A simpler way forward":"Njia rahisi zaidi", "Ready to find your next ":"Uko tayari kupata nyumba yako ijayo ", "Not sure where to begin? ":"Hujui pa kuanzia? ", "Search homes →":"Tafuta nyumba →", "Back to InzuHub":"Rudi InzuHub", "Find your next home":"Tafuta nyumba yako ijayo", "Start with what":"Anza na kile", "matters to you.":"kinachokuhusu.", "Location":"Eneo", "Budget":"Bajeti", "Room numbers":"Idadi ya vyumba", "Toilet":"Choo", "Any budget":"Bajeti yoyote", "Any room number":"Idadi yoyote ya vyumba", "Any toilet":"Choo chochote", "Request a viewing →":"Omba kutazama →", "Back to homes":"Rudi kwenye nyumba" }
};

export function TranslationProvider() {
  useEffect(() => {
    const translate = (language: Language) => {
      document.documentElement.lang = language;
      const map = language === "en" ? {} : dictionary[language];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = []; let node;
      while ((node = walker.nextNode())) nodes.push(node as Text);
      nodes.forEach((text) => {
        const original = text.parentElement?.dataset.sourceText ?? text.textContent ?? "";
        if (text.parentElement) text.parentElement.dataset.sourceText = original;
        const translated = map[original] ?? original;
        if (text.textContent !== translated) text.textContent = translated;
      });
    };
    const saved = (localStorage.getItem("inzuhub-language") as Language | null) ?? "en";
    translate(saved);
    let currentLanguage = saved;
    const onLanguage = (event: Event) => { currentLanguage = (event as CustomEvent<Language>).detail; translate(currentLanguage); };
    const observer = new MutationObserver(() => translate(currentLanguage));
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("inzuhub:language", onLanguage);
    return () => { observer.disconnect(); window.removeEventListener("inzuhub:language", onLanguage); };
  }, []);
  return null;
}
