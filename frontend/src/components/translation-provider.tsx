"use client";

import { useEffect } from "react";

type Language = "en" | "rw" | "fr" | "sw";
const dictionary: Record<Exclude<Language, "en">, Record<string, string>> = {
  rw: { "Add your property":"Andika inzu yawe", "Add your property ↗":"Andika inzu yawe ↗", "Find a home":"Shaka inzu", "List a house":"Andika inzu", "For agents":"Kwamamaza", "How it works":"Uko bikora", "Sign in":"Injira", "Get started →":"Tangira →", "Get started free →":"Tangira ku buntu →", "List your property ↗":"Andika inzu yawe ↗", "Rwanda's trusted rental marketplace":"Isoko ryizewe ryo gukodesha inzu mu Rwanda", "A place to call ":"Aho wahamagara ", "made simple.":"byoroshye.", "Find a home you love, list with confidence, and work with trusted local agents—all in one place.":"Shaka inzu ukunda, andika iyanyu wizeye, kandi ukorane n'abahuza bizewe—ahantu hamwe.", "from renters across Kigali":"by'abakodesha bo muri Kigali", "Explore homes":"Reba amazu", "Made for the way you ":"Byagenewe uko ", "live.":"ubaho.", "View all homes →":"Reba amazu yose →", "Renting, made human":"Gukodesha byoroherejwe", "More clarity.":"Ubusobanuro bwinshi.", "More confidence.":"Icyizere kinini.", "Commissioners are":"Abahuza ni", "our partners.":"abafatanyabikorwa bacu.", "Become an agent →":"Ba umuhuza →", "A simpler way forward":"Inzira yoroshye", "Ready to find your next ":"Witeguye kubona inzu yawe ", "Not sure where to begin? ":"Ntazi aho watangirira? ", "Search homes →":"Shaka amazu →", "Back to InzuHub":"Subira kuri InzuHub", "Find your next home":"Shaka inzu yawe ikurikira", "Start with what":"Tangirana n'ibyo", "matters to you.":"ukeneye.", "Location":"Aho uherereye", "Budget":"Ingengo y'imari", "Room numbers":"Umubare w'ibyumba", "Toilet":"Ubwiherero", "Any budget":"Ingengo yose", "Any room number":"Ibyumba byose", "Any toilet":"Ubwiherero bwose", "Request a viewing →":"Saba gusura inzu →", "Back to homes":"Subira ku mazu" },
  fr: { "Add your property":"Ajouter votre logement", "Add your property ↗":"Ajouter votre logement ↗", "Find a home":"Trouver un logement", "List a house":"Publier un logement", "For agents":"Pour les agents", "How it works":"Comment ça marche", "Sign in":"Se connecter", "Get started →":"Commencer →", "Get started free →":"Commencer gratuitement →", "List your property ↗":"Publier votre logement ↗", "Rwanda's trusted rental marketplace":"La plateforme locative de confiance au Rwanda", "A place to call ":"Un lieu à appeler ", "made simple.":"chez soi, simplement.", "Find a home you love, list with confidence, and work with trusted local agents—all in one place.":"Trouvez un logement que vous aimez, publiez en confiance et collaborez avec des agents locaux de confiance.", "from renters across Kigali":"par des locataires à Kigali", "Explore homes":"Explorer les logements", "Made for the way you ":"Pensé pour votre ", "live.":"façon de vivre.", "View all homes →":"Voir tous les logements →", "Renting, made human":"La location, plus humaine", "More clarity.":"Plus de clarté.", "More confidence.":"Plus de confiance.", "Commissioners are":"Les agents sont", "our partners.":"nos partenaires.", "Become an agent →":"Devenir agent →", "A simpler way forward":"Une voie plus simple", "Ready to find your next ":"Prêt à trouver votre prochain ", "Not sure where to begin? ":"Vous ne savez pas par où commencer ? ", "Search homes →":"Rechercher →", "Back to InzuHub":"Retour à InzuHub", "Find your next home":"Trouvez votre prochain logement", "Start with what":"Commencez par ce qui", "matters to you.":"compte pour vous.", "Location":"Localisation", "Budget":"Budget", "Room numbers":"Nombre de pièces", "Toilet":"Toilettes", "Any budget":"Tout budget", "Any room number":"Tout nombre de pièces", "Any toilet":"Toutes toilettes", "Request a viewing →":"Demander une visite →", "Back to homes":"Retour aux logements" },
  sw: { "Add your property":"Ongeza nyumba yako", "Add your property ↗":"Ongeza nyumba yako ↗", "Find a home":"Tafuta nyumba", "List a house":"Orodhesha nyumba", "For agents":"Kwa mawakala", "How it works":"Jinsi inavyofanya kazi", "Sign in":"Ingia", "Get started →":"Anza →", "Get started free →":"Anza bila malipo →", "List your property ↗":"Orodhesha nyumba yako ↗", "Rwanda's trusted rental marketplace":"Soko la kuaminika la nyumba za kukodisha Rwanda", "A place to call ":"Mahali pa kuita ", "made simple.":"nyumbani, kwa urahisi.", "Find a home you love, list with confidence, and work with trusted local agents—all in one place.":"Tafuta nyumba unayoipenda, orodhesha kwa ujasiri na ushirikiane na mawakala waaminifu—mahali pamoja.", "from renters across Kigali":"kutoka kwa wapangaji Kigali", "Explore homes":"Gundua nyumba", "Made for the way you ":"Imetengenezwa kwa jinsi unavyo", "live.":"ishi.", "View all homes →":"Tazama nyumba zote →", "Renting, made human":"Ukodishaji wa kibinadamu", "More clarity.":"Uwazi zaidi.", "More confidence.":"Ujasiri zaidi.", "Commissioners are":"Mawakala ni", "our partners.":"washirika wetu.", "Become an agent →":"Kuwa wakala →", "A simpler way forward":"Njia rahisi zaidi", "Ready to find your next ":"Uko tayari kupata nyumba yako ijayo ", "Not sure where to begin? ":"Hujui pa kuanzia? ", "Search homes →":"Tafuta nyumba →", "Back to InzuHub":"Rudi InzuHub", "Find your next home":"Tafuta nyumba yako ijayo", "Start with what":"Anza na kile", "matters to you.":"kinachokuhusu.", "Location":"Eneo", "Budget":"Bajeti", "Room numbers":"Idadi ya vyumba", "Toilet":"Choo", "Any budget":"Bajeti yoyote", "Any room number":"Idadi yoyote ya vyumba", "Any toilet":"Choo chochote", "Request a viewing →":"Omba kutazama →", "Back to homes":"Rudi kwenye nyumba" }
};

const navigationTranslations: Record<Exclude<Language, "en">, Record<string, string>> = {
  rw: {
    "Home": "Ahabanza", "Add a Post": "Andika itangazo", "Notifications": "Amatangazo", "My Account": "Konti yanjye",
    "My Listings": "Amatangazo yanjye", "Favorites": "Ibyakunzwe", "Messages": "Ubutumwa", "Settings": "Igenamiterere",
    "Verification": "Isuzuma", "Verification / Upgrade": "Isuzuma / Kuzamura uruhare", "Billing": "Kwishyura", "Help & Support": "Ubufasha", "Sign out": "Sohoka",
    "Choose a seller role": "Hitamo uruhare rwo gutangaza", "Request an upgrade": "Saba kuzamura uruhare", "Contact support": "Twandikire ubufasha", "Search houses, land, apartments...": "Shaka amazu, ubutaka n'amacumbi...",
  },
  fr: {
    "Home": "Accueil", "Add a Post": "Publier", "Notifications": "Notifications", "My Account": "Mon compte",
    "My Listings": "Mes annonces", "Favorites": "Favoris", "Messages": "Messages", "Settings": "Paramètres",
    "Verification": "Vérification", "Verification / Upgrade": "Vérification / évolution", "Billing": "Facturation", "Help & Support": "Aide et support", "Sign out": "Se déconnecter",
    "Choose a seller role": "Choisissez un rôle vendeur", "Request an upgrade": "Demander une évolution", "Contact support": "Contacter le support", "Search houses, land, apartments...": "Rechercher maisons, terrains, appartements...",
  },
  sw: {
    "Home": "Mwanzo", "Add a Post": "Ongeza tangazo", "Notifications": "Arifa", "My Account": "Akaunti yangu",
    "My Listings": "Matangazo yangu", "Favorites": "Vipendwa", "Messages": "Ujumbe", "Settings": "Mipangilio",
    "Verification": "Uthibitishaji", "Verification / Upgrade": "Uthibitishaji / Kuomba nafasi", "Billing": "Malipo", "Help & Support": "Msaada", "Sign out": "Toka",
    "Choose a seller role": "Chagua jukumu la muuzaji", "Request an upgrade": "Omba kuboresha jukumu", "Contact support": "Wasiliana na msaada", "Search houses, land, apartments...": "Tafuta nyumba, ardhi na vyumba...",
  },
};

// Current landing-page copy. Keeping these strings together prevents the
// interface from falling back to English when the page content evolves.
const interfaceTranslations: Record<Exclude<Language, "en">, Record<string, string>> = {
  rw: {
    "search.kicker": "Tangira utanga ibisobanuro bike",
    "search.title": "Shaka ahakwiriye.",
    "search.subtitle": "Shaka amazu yagenzuwe hirya no hino mu Rwanda",
    "search.placeholder": "urugero: inzu y'ibyumba 2 i Kigali iri munsi ya 300,000 RWF…",
    "search.button": "✦ Shaka",
    "âœ¦ Search": "✦ Shaka",
    "Searchingâ€¦": "Birashakishwa…",
    "search.prompt.one": "Inzu y'ibyumba 2 i Kicukiro iri munsi ya 300k",
    "search.prompt.two": "Inzu ituje hafi y'ubwikorezi bwiza",
    "search.prompt.three": "Inzu ihendutse ku banyeshuri",
    "hero.location": "Kigali · Rwanda",
    "hero.kicker": "Amazu mashya buri cyumweru",
    "hero.title": "Shaka ahantu wumva ari ",
    "hero.titleEm": "ahawe.",
    "hero.lead": "Amazu yatoranyijwe neza, ibisobanuro by'ukuri n'abantu bo hafi bizewe. Aho uzatura ubutaha hatangirira hano.",
    "Search homes, Kigali...": "Shaka amazu, Kigali...",
    "Light": "Kumurika",
    "Dark": "Umwijima",
    "See more": "Reba byinshi",
    "Kigali · Rwanda": "Kigali · Rwanda",
    "New homes every week": "Amazu mashya buri cyumweru",
    "Find a place that feels like yours.": "Shaka ahantu wumva ari ahawe.",
    "Find a place that feels like ": "Shaka ahantu wumva ari ",
    "yours.": "ahawe.",
    "Thoughtfully listed homes, honest details, and trusted local people.": "Amazu yatoranyijwe neza, ibisobanuro by'ukuri n'abantu bo hafi bizewe.",
    "Your next address starts here.": "Aho uzatura ubutaha hatangirira hano.",
    "Thoughtfully listed homes, honest details, and trusted local people. Your next address starts here.": "Amazu yatoranyijwe neza, ibisobanuro by'ukuri n'abantu bo hafi bizewe. Aho uzatura ubutaha hatangirira hano.",
    "Featured homes": "Amazu yatoranyijwe",
    "Kigali, Rwanda": "Kigali, Rwanda",
    "Start with a few details": "Tangira utanga ibisobanuro bike",
    "Find the right fit.": "Shaka ahakwiriye.",
    "Search verified homes across Rwanda": "Shaka amazu yagenzuwe hirya no hino mu Rwanda",
    "e.g. 2 bedroom apartment in Kigali under 300,000 RWF…": "urugero: inzu y'ibyumba 2 i Kigali iri munsi ya 300,000 RWF…",
    "Search": "Shaka",
    "2 bedroom apartment in Kicukiro under 300k": "Inzu y'ibyumba 2 i Kicukiro iri munsi ya 300k",
    "Quiet house near good transport": "Inzu ituje hafi y'ubwikorezi bwiza",
    "Something affordable for students": "Inzu ihendutse ku banyeshuri",
    "or refine with filters": "cyangwa hitamo ibisabwa",
    "Anywhere in Rwanda": "Aho ari ho hose mu Rwanda",
    "Property type": "Ubwoko bw'inzu",
    "Any type": "Ubwoko ubwo ari bwo bwose",
    "Bedrooms": "Ibyumba byo kuryamamo",
    "Any bedrooms": "Ibyumba byose",
    "Under 300,000 RWF": "Munsi ya 300,000 RWF",
    "300,000–600,000 RWF": "300,000–600,000 RWF",
    "600,000+ RWF": "600,000+ RWF",
    "Search homes →": "Shaka amazu →",
    "The Umutungo way": "Uburyo bwa Umutungo",
    "More than a listing.": "Biruta gutangaza inzu.",
    "A better decision.": "Ni ugufata umwanzuro mwiza.",
    "Every detail is designed to make renting in Rwanda more informed, more human, and less uncertain.": "Buri kintu cyateguwe kugira ngo gukodesha mu Rwanda birusheho gusobana, kuba iby'abantu no kugabanya urujijo.",
    "Modern villa available in Kigali": "Villa igezweho iboneka i Kigali",
    "Featured in Kicukiro": "Byatoranyijwe i Kicukiro",
    "A home with room to breathe.": "Inzu yagenewe kubamo neza.",
    "3 bedrooms · Garden · Verified location": "Ibyumba 3 · Ubusitani · Ahantu hagenzuwe",
    "Kimihurura": "Kimihurura",
    "Quiet streets, close to everything.": "Imihanda ituje, hafi ya byose.",
    "Trust, built in": "Icyizere cyubatswe imbere",
    "Know before": "Menya mbere",
    "you move.": "yo kwimuka.",
    "Verified owners": "Ba nyir'inzu bagenzuwe",
    "Identity checked": "Indangamuntu yagenzuwe",
    "Verified homes": "Amazu yagenzuwe",
    "Listing reviewed": "Itangazo ryasuzumwe",
    "Verified locations": "Ahantu hagenzuwe",
    "Place confirmed": "Aho hantu harahamye",
    "Trusted agents": "Abahuza bizewe",
    "Partners, not middlemen": "Abafatanyabikorwa, si abunzi",
    "A clearer rental journey": "Urugendo rwo gukodesha rusobanutse",
    "From searching": "Kuva ku gushaka",
    "to settling in.": "kugeza ku gutura.",
    "Discover": "Shaka",
    "Search by place, price, or natural language.": "Shaka ukoresheje ahantu, igiciro cyangwa amagambo asanzwe.",
    "Verify": "Genza",
    "See the signals that build confidence.": "Reba ibimenyetso byubaka icyizere.",
    "View": "Sura",
    "Request a visit when it suits you.": "Saba gusura igihe bikubereye.",
    "Agree": "Mwumvikane",
    "Compare, offer, and negotiate clearly.": "Gereranya, tanga igitekerezo kandi muganire neza.",
    "Rent": "Kodesha",
    "Move forward with less uncertainty.": "Komeza ufite urujijo ruke.",
    "Explore Rwanda": "Menya u Rwanda",
    "Explore homes by district, from Kigali neighbourhoods to growing cities across the country.": "Shaka amazu ukurikije akarere, kuva mu duce twa Kigali kugeza mu mijyi ikura hirya no hino mu gihugu.",
    "Open the map →": "Fungura ikarita →",
    "Map view · Rwanda": "Ikarita · u Rwanda",
    "Rental intelligence": "Ubumenyi ku isoko ry'ubukode",
    "A smarter view": "Uburyo bwiza bwo kubona",
    "of the market.": "isoko.",
    "AVERAGE RENT · KIGALI": "UBUKODE BUSANZWE · KIGALI",
    "6.4% this year": "6.4% uyu mwaka",
    "HIGH DEMAND AREA": "AGACE GAKENEWE CYANE",
    "More two-bedroom searches": "Abashaka ibyumba bibiri benshi",
    "POPULAR THIS MONTH": "BIKUNZWE UYU MWEEEZI",
    "Across 4 districts": "Mu turere 4",
    "Property concierge": "Umujyanama w'amazu",
    "What kind of property are you looking for?": "Ni iyihe nzu ushaka?",
    "Ask naturally in English or Kinyarwanda.": "Baza mu Cyongereza cyangwa Kinyarwanda.",
    "Find a two-bedroom home": "Shaka inzu y'ibyumba bibiri",
    "Search by budget": "Shaka ukurikije ingengo y'imari",
    "Ask about reviews": "Baza ku isuzuma",
    "Describe your ideal property…": "Sobanura inzu wifuza…",
    "AI uses available Umutungo data and may not know live availability.": "AI ikoresha amakuru ahari kuri Umutungo kandi ishobora kutamenya amazu ahari ako kanya.",
    "Ask AI": "Baza AI",
    "We back the people": "Dushyigikira abantu",
    "who make it happen.": "batuma bishoboka.",
    "Umutungo gives commissioners the digital tools": "Umutungo aha abahuza ibikoresho by'ikoranabuhanga",
    "to manage properties, leads, and commissions—so you can do more of": "bifasha gucunga amazu, abakiriya n'amakomisiyo—kugira ngo ukore byinshi mu",
    "what you do best.": "byo uzi gukora neza.",
    "KOMISIYONERI PROFILE": "UMWIRONDORO W'UMUHUZA",
    "Verified Komisiyoneri · Kigali": "Umuhuza wemejwe · Kigali",
    "Active listings": "Amazu ari ku isoko",
    "Rentals closed": "Ubukode bwakozwe",
    "Rating": "Amanota",
    "For Komisiyoneri & property businesses": "Ku bahuza n'abacuruza amazu",
    "who make it ": "batuma bishoboka ",
    "happen.": ".",
    "Umutungo gives commissioners the digital tools to manage properties, leads, and commissions—so you can do more of what you do best.": "Umutungo aha abahuza ibikoresho by'ikoranabuhanga byo gucunga amazu, abakiriya n'amakomisiyo—kugira ngo ukore byinshi mu byo uzi gukora neza.",
    "Ready to find your next ": "Witeguye kubona inzu yawe ",
    "home?": "ikurikira?",
    "Whether you're moving in, listing out, or helping someone find the right place, we're here for it.": "Waba wimuka, utangaza inzu cyangwa ufasha umuntu kubona ahakwiriye, turi kumwe nawe.",
    "We are here to help you get the houses in Rwanda that fits your wishes at reasonable prices.": "Turi hano kugufasha kubona amazu mu Rwanda akwiriye ibyo ushaka ku giciro gihagaze.",
    "Explore a few homes while listings refresh.": "Reba amazu make mu gihe amatangazo arimo kuvugururwa.",
    "Start with these trusted Kigali spaces, then search again when you are ready.": "Tangira kuri aya mazu yizewe yo muri Kigali, wongere ushake igihe witeguye.",
    "Listings are refreshing in the background. You can still explore these homes while we reconnect.": "Amatangazo arimo kuvugururwa. Uracyashobora kureba aya mazu mu gihe twongera guhuza serivisi.",
    "Featured in Kigali": "Byatoranyijwe i Kigali",
    "Light-filled homes, ready for you.": "Amazu arimo urumuri, akwiteguye.",
    "Verified spaces · Kigali": "Ahantu hagenzuwe · Kigali",
    "Room to settle in and breathe.": "Inzu yo guturamo neza kandi ukaruhuka.",
    "Apartments · Trusted local hosts": "Amagorofa · Abacumbikira bo hafi bizewe",
    "Homes · Walkable neighbourhoods": "Amazu · Uturere dushobora kugendwamo",
    "Rwanda's home for renting better.": "Urubuga rw'u Rwanda rwo gukodesha neza.",
    "About us": "Abo turi bo",
    "Privacy": "Ibanga",
    "Terms": "Amabwiriza",
    "Contact": "Twandikire",
  },
  fr: {
    "search.kicker": "Commencez par quelques détails",
    "search.title": "Trouvez le logement idéal.",
    "search.subtitle": "Recherchez des logements vérifiés au Rwanda",
    "search.placeholder": "ex. appartement de 2 chambres à Kigali sous 300 000 RWF…",
    "search.button": "✦ Rechercher",
    "âœ¦ Search": "✦ Rechercher",
    "Searchingâ€¦": "Recherche…",
    "search.prompt.one": "Appartement de 2 chambres à Kicukiro sous 300 000",
    "search.prompt.two": "Maison calme près des bons transports",
    "search.prompt.three": "Un logement abordable pour les étudiants",
    "hero.location": "Kigali · Rwanda",
    "hero.kicker": "De nouveaux logements chaque semaine",
    "hero.title": "Trouvez un endroit qui",
    "hero.titleEm": "vous ressemble.",
    "hero.lead": "Des logements bien présentés, des détails honnêtes et des personnes locales de confiance. Votre prochaine adresse commence ici.",
    "Search homes, Kigali...": "Rechercher des logements, Kigali…",
    "Light": "Clair",
    "Dark": "Sombre",
    "See more": "Voir plus",
    "Kigali · Rwanda": "Kigali · Rwanda",
    "New homes every week": "De nouveaux logements chaque semaine",
    "Find a place that feels like yours.": "Trouvez un endroit qui vous ressemble.",
    "Thoughtfully listed homes, honest details, and trusted local people.": "Des logements bien présentés, des détails honnêtes et des personnes locales de confiance.",
    "Your next address starts here.": "Votre prochaine adresse commence ici.",
    "Featured homes": "Logements à la une",
    "Start with a few details": "Commencez par quelques détails",
    "Find the right fit.": "Trouvez le logement idéal.",
    "Search verified homes across Rwanda": "Recherchez des logements vérifiés au Rwanda",
    "Search": "Rechercher",
    "or refine with filters": "ou affinez avec les filtres",
    "Anywhere in Rwanda": "Partout au Rwanda",
    "Property type": "Type de logement",
    "Any type": "Tous les types",
    "Bedrooms": "Chambres",
    "Any bedrooms": "Toutes les chambres",
    "Search homes →": "Rechercher →",
    "The Umutungo way": "La méthode Umutungo",
    "More than a listing.": "Plus qu'une annonce.",
    "A better decision.": "Une meilleure décision.",
    "Trust, built in": "La confiance, intégrée",
    "Know before": "Sachez avant",
    "you move.": "de déménager.",
    "Verified owners": "Propriétaires vérifiés",
    "Identity checked": "Identité contrôlée",
    "Verified homes": "Logements vérifiés",
    "Listing reviewed": "Annonce vérifiée",
    "Verified locations": "Lieux vérifiés",
    "Place confirmed": "Lieu confirmé",
    "Trusted agents": "Agents de confiance",
    "Partners, not middlemen": "Partenaires, pas intermédiaires",
    "A clearer rental journey": "Un parcours locatif plus clair",
    "From searching": "De la recherche",
    "to settling in.": "à l'installation.",
    "Discover": "Découvrir",
    "Verify": "Vérifier",
    "View": "Visiter",
    "Agree": "S'accorder",
    "Rent": "Louer",
    "Explore Rwanda": "Explorer le Rwanda",
    "Open the map →": "Ouvrir la carte →",
    "Rental intelligence": "Intelligence locative",
    "A smarter view": "Une vision plus intelligente",
    "of the market.": "du marché.",
    "Property concierge": "Assistant immobilier",
    "What kind of property are you looking for?": "Quel type de logement recherchez-vous ?",
    "Ask AI": "Demander à l'IA",
    "We are here to help you get the houses in Rwanda that fits your wishes at reasonable prices.": "Nous sommes là pour vous aider à trouver les logements au Rwanda qui correspondent à vos souhaits à des prix raisonnables.",
    "About us": "À propos",
    "Privacy": "Confidentialité",
    "Terms": "Conditions",
    "Contact": "Contact",
  },
  sw: {
    "search.kicker": "Anza na maelezo machache",
    "search.title": "Pata nyumba inayokufaa.",
    "search.subtitle": "Tafuta nyumba zilizothibitishwa kote Rwanda",
    "search.placeholder": "mf. nyumba ya vyumba 2 Kigali chini ya 300,000 RWF…",
    "search.button": "✦ Tafuta",
    "âœ¦ Search": "✦ Tafuta",
    "Searchingâ€¦": "Inatafutwa…",
    "search.prompt.one": "Nyumba ya vyumba 2 Kicukiro chini ya 300k",
    "search.prompt.two": "Nyumba tulivu karibu na usafiri mzuri",
    "search.prompt.three": "Nyumba nafuu kwa wanafunzi",
    "hero.location": "Kigali · Rwanda",
    "hero.kicker": "Nyumba mpya kila wiki",
    "hero.title": "Pata mahali panapohisi",
    "hero.titleEm": "kama kwako.",
    "hero.lead": "Nyumba zilizoorodheshwa kwa uangalifu, maelezo ya kweli na watu wa eneo wanaoaminika. Anwani yako inayofuata inaanzia hapa.",
    "Search homes, Kigali...": "Tafuta nyumba, Kigali...",
    "Light": "Mwanga",
    "Dark": "Giza",
    "See more": "Tazama zaidi",
    "Kigali · Rwanda": "Kigali · Rwanda",
    "New homes every week": "Nyumba mpya kila wiki",
    "Find a place that feels like yours.": "Pata mahali panapohisi kama kwako.",
    "Thoughtfully listed homes, honest details, and trusted local people.": "Nyumba zilizoorodheshwa kwa uangalifu, maelezo ya kweli na watu wa eneo wanaoaminika.",
    "Your next address starts here.": "Anwani yako inayofuata inaanzia hapa.",
    "Featured homes": "Nyumba maalum",
    "Start with a few details": "Anza na maelezo machache",
    "Find the right fit.": "Pata nyumba inayokufaa.",
    "Search verified homes across Rwanda": "Tafuta nyumba zilizothibitishwa kote Rwanda",
    "Search": "Tafuta",
    "or refine with filters": "au boresha kwa vichujio",
    "Anywhere in Rwanda": "Popote Rwanda",
    "Property type": "Aina ya nyumba",
    "Any type": "Aina yoyote",
    "Bedrooms": "Vyumba vya kulala",
    "Any bedrooms": "Vyumba vyovyote",
    "Search homes →": "Tafuta nyumba →",
    "The Umutungo way": "Njia ya Umutungo",
    "More than a listing.": "Zaidi ya tangazo.",
    "A better decision.": "Uamuzi bora.",
    "Trust, built in": "Uaminifu umejengwa ndani",
    "Know before": "Jua kabla",
    "you move.": "ya kuhamia.",
    "Verified owners": "Wamiliki waliothibitishwa",
    "Identity checked": "Utambulisho umekaguliwa",
    "Verified homes": "Nyumba zilizothibitishwa",
    "Listing reviewed": "Tangazo limekaguliwa",
    "Verified locations": "Maeneo yaliyothibitishwa",
    "Place confirmed": "Mahali pamehakikishwa",
    "Trusted agents": "Mawakala wanaoaminika",
    "Partners, not middlemen": "Washirika, si madalali",
    "A clearer rental journey": "Safari iliyo wazi ya kukodisha",
    "From searching": "Kutoka kutafuta",
    "to settling in.": "hadi kuhamia.",
    "Discover": "Gundua",
    "Verify": "Thibitisha",
    "View": "Tembelea",
    "Agree": "Kubali",
    "Rent": "Kodisha",
    "Explore Rwanda": "Gundua Rwanda",
    "Open the map →": "Fungua ramani →",
    "Rental intelligence": "Taarifa za soko la kodi",
    "A smarter view": "Mtazamo bora",
    "of the market.": "wa soko.",
    "Property concierge": "Mshauri wa nyumba",
    "What kind of property are you looking for?": "Unatafuta nyumba ya aina gani?",
    "Ask AI": "Uliza AI",
    "We are here to help you get the houses in Rwanda that fits your wishes at reasonable prices.": "Tuko hapa kukusaidia kupata nyumba Rwanda zinazokidhi matakwa yako kwa bei za wastani.",
    "About us": "Kuhusu sisi",
    "Privacy": "Faragha",
    "Terms": "Masharti",
    "Contact": "Wasiliana",
  },
};

export function TranslationProvider() {
  useEffect(() => {
    type TextState = { original: string; translated: string };
    type AttributeState = { original: string; translated: string };
    const textStates = new WeakMap<Text, TextState>();
    const attributeStates = new WeakMap<Element, Map<string, AttributeState>>();
    const translatableAttributes = ["placeholder", "aria-label", "title"];
    const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

    const translate = (language: Language) => {
      document.documentElement.lang = language;
      const map = language === "en"
        ? {}
        : { ...dictionary[language], ...interfaceTranslations[language], ...navigationTranslations[language] };
      const normalizedMap = new Map(
        Object.entries(map).map(([key, value]) => [normalize(key), value])
      );
      document.body.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
        const key = element.dataset.i18n ?? "";
        const original = element.dataset.i18nDefault ?? element.textContent ?? "";
        const translated = map[key] ?? original;
        if (element.textContent !== translated) element.textContent = translated;
      });
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const text = node as Text;
        const parent = text.parentElement;
        if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) continue;
        if (parent.closest("[data-i18n]")) continue;

        const current = text.data;
        const previous = textStates.get(text);
        const original = !previous || current !== previous.translated
          ? current
          : previous.original;
        const key = normalize(original);
        const translated = normalizedMap.get(key) ?? original;
        const leading = original.match(/^\s*/)?.[0] ?? "";
        const trailing = original.match(/\s*$/)?.[0] ?? "";
        const nextValue = key ? `${leading}${translated}${trailing}` : original;

        textStates.set(text, { original, translated: nextValue });
        if (current !== nextValue) text.data = nextValue;
      }

      document.body.querySelectorAll<HTMLElement>("[placeholder], [aria-label], [title]").forEach((element) => {
        const states = attributeStates.get(element) ?? new Map<string, AttributeState>();
        translatableAttributes.forEach((attribute) => {
          const current = element.getAttribute(attribute);
          if (current === null) return;
          const previous = states.get(attribute);
          const original = !previous || current !== previous.translated
            ? current
            : previous.original;
          const translated = normalizedMap.get(normalize(original)) ?? original;
          states.set(attribute, { original, translated });
          if (current !== translated) element.setAttribute(attribute, translated);
        });
        attributeStates.set(element, states);
      });
    };
    const saved = (localStorage.getItem("umutungo-language") as Language | null) ?? "en";
    translate(saved);
    let currentLanguage = saved;
    const onLanguage = (event: Event) => {
      currentLanguage = (event as CustomEvent<Language>).detail;
      translate(currentLanguage);
    };
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      queueMicrotask(() => {
        queued = false;
        translate(currentLanguage);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("umutungo:language", onLanguage);
    return () => { observer.disconnect(); window.removeEventListener("umutungo:language", onLanguage); };
  }, []);
  return null;
}
