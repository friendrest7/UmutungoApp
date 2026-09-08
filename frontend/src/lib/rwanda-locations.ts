/**
 * Rwanda administrative divisions: Province → District → Sector → Cell → Village
 * Source: https://github.com/ngabovictor/Rwanda
 *
 * Structure:
 *   RWANDA_LOCATIONS[province][district][sector][cell] = string[] (villages)
 */

export type RwandaData = {
  [province: string]: {
    [district: string]: {
      [sector: string]: {
        [cell: string]: string[];
      };
    };
  };
};

// Full dataset — Province > District > Sector > Cell > Villages
// Kigali City districts are under "Kigali" province
export const RWANDA_LOCATIONS: RwandaData = {
  Kigali: {
    Gasabo: {
      Bumbogo: {
        Kinyaga: ["Akakaza","Kigarama","Kingabo","Muhozi","Rubungo","Ryakigogo","Zindiro"],
        Musave: ["Kagarama","Kayumba","Ramba","Rebero","Rugando"],
        Mvuzo: ["Kigabiro","Kiyoro","Murarambo","Nkona","Nyakabingo","Rukoma"],
        Ngara: ["Birembo","Gisasa","Munini","Ruhinga","Uwaruraza"],
        Nkuzuzu: ["Akabenejuru","Akasedogo","Akimpama","Burima","Kityazo"],
      },
      Gatsata: {
        Karuruma: ["Akamamana","Akimihigo","Bigega","Busasamana","Kingasire","Kumuyange","Muremera","Nyagasozi","Rugoro","Rwesero","Tetero"],
        Nyamabuye: ["Agakomeye","Gashubi","Gisiza","Hanika","Juru","Kibaya","Mpakabavu","Musango","Ndengo","Nyakabande","Nyakanunga","Rubonobono","Runyonza","Rusoro","Ruvumero","Uwagatovu"],
        Nyamugari: ["Agataramo","Akamwunguzi","Akarubimbura","Akisoko","Amarembo","Amizero","Bwiza","Ihuriro","Isangano","Kanyonyomba","Nyakariba","Rwakarihejuru"],
      },
      Gikomero: {
        Gasagara: ["Bwimiyange","Bwingeyo","Gasagara","Rugwiza"],
        Gicaca: ["Ntaganzwa","Nyagasozi","Nyagisozi","Ruganda"],
        Kibara: ["Gahinga","Gasharu","Kibobo","Nombe"],
        Munini: ["Munini","Mutokerezwa","Rudakabukirwa","Runyinya"],
        Murambi: ["Kimisebeya","Kivugiza","Rugarama","Twina"],
      },
      Gisozi: {
        Musezero: ["Amajyambere","Amarembo","Byimana","Gasave","Gasharu","Kagara","Nyakariba","Rwinyana"],
        Ruhango: ["Kanyinya","Kumukenke","Murambi","Ntora","Rukeri","Umurava"],
      },
      Jabana: {
        Akamatamu: ["Akamatamu","Cyeyere","Murehe","Nyacyonga","Nyagasozi","Nyarukurazo"],
        Bweramvura: ["Agakenke","Agatare","Akinyana","Gikingo","Gitega","Gitenga","Nyakabingo","Nyarurama","Rugogwe","Taba"],
        Kabuye: ["Amakawa","Amasangano","Buliza","Ihuriro","Kabeza","Karuruma","Murama","Nyagasozi","Rebero","Rugarama","Tetero"],
        Kidashya: ["Agasekabuye","Agatare","Amasangano","Mubuga","Nyamweru"],
        Ngiryi: ["Agahama","Agasharu","Akabuga","Jurwe","Kiberinka","Nyakirehe","Nyarubuye","Rubona","Rwanyanza","Uwanyange"],
      },
      Jali: {
        Agateko: ["Bugarama","Bukamba","Byimana","Kabizoza","Kinunga","Urunyinya","Rwankuba"],
        Buhiza: ["Kabande","Gatare","Nyamugali","Nyarubuye"],
        Muko: ["Gahinga","Gatare","Umunyinya"],
        Nkusi: ["Agatwa","Kabagina","Kajevuba","Kigarama","Nyagasayo"],
        Nyabuliba: ["Nyaburira","Kirehe","Mataba","Nyarurembo","Rubona"],
        Nyakabungo: ["Bwocya","Gitaba","Karenge","Rugina","Ruhihi"],
        Nyamitanga: ["Agasharu","Agatare","Kabuga","Runyinya"],
      },
      Kacyiru: {
        Kamatamu: ["Amajyambere","Bukinanyana","Cyimana","Gataba","Itetero","Kabare","Kamuhire","Karukamba","Nyagacyamo","Rwinzovu","Urugwiro","Uruhongore"],
        Kamutwa: ["Agasaro","Gasharu","Inkingi","Kanserege","Kigugu","Ruganwa","Umuco","Umutekano","Urugero","Urwibutso"],
        Kibaza: ["Amahoro","Bwiza","Ihuriro","Ineza","Inyange","Iriba","Kabagari","Ubumwe","Umutako","Urukundo","Virunga"],
      },
      Kimihurura: {
        Kamukina: ["Inyamibwa","Isangano","Isano","Ituze","Izuba","Juru","Nyenyeri","Umurava","Urumuri"],
        Kimihurura: ["Amahoro","Amajyambere","Imihigo","Intambwe","Mutara","Rugarama","Ubumwe","Umutekano","Urwego"],
        Rugando: ["Gasange","Gasasa","Marembo","Rebero","Taba"],
      },
      Kimironko: {
        Bibare: ["Abatuje","Amariza","Imanzi","Imena","Imitari","Inganji","Ingenzi","Ingeri","Inshuti","Intashyo","Intwari","Inyamibwa","Inyange","Ubwiza","Umwezi"],
        Kibagabaga: ["Akintwari","Buranga","Gasharu","Ibuhoro","Kageyo","Kamahinda","Karisimbi","Karongi","Nyirabwana","Ramiro","Rindiro","Rugero","Rukurazo","Urumuri"],
        Nyagatovu: ["Ibukinanyana","Ibuhoro","Ijabiro","Isangano","Itetero","Urugwiro"],
      },
      Kinyinya: {
        Gacuriro: ["Agatare","Akanyamugabo","Akarambo","Akaruvusha","Bishikiri","Cyeru","Estate 2020","Kabuhunde II","Kirira","Urubanda","Urugarama"],
        Gasharu: ["Agatare","Gasharu","Kami","Rwankuba"],
        Kagugu: ["Dusenyi","Gicikiza","Giheka","Kabuhunde I","Kadobogo","Kagarama","Muhororo","Nyakabungo","Rukingu"],
        Murama: ["Binunga","Ngaruyinka","Rusenyi","Taba"],
      },
      Ndera: {
        Bwiza: ["Akarwasa","Akasemuromba","Bucyemba","Gasharu","Mukagarama","Ruhangare"],
        Cyaruzinge: ["Ayabakora","Cyaruzinge","Gashure","Gatare","Gisura","Karubibi","Mulindi"],
        Kibenga: ["Bahoze","Berwa","Buhoro","Burunga","Gitaraga","Kira","Nezerwa","Rugazi","Runyonza","Tumurere","Ururembo"],
        Masoro: ["Byimana","Kabeza","Masoro","Matwari","Mubuga","Munini"],
        Mukuyu: ["Akamusare","Akimana","Gasharu","Jurwe","Karambo","Kigabiro","Ruseno"],
        Rudashya: ["Kacyinyaga","Kamahoro","Munini","Nyakagezi","Ruhangare","Ruhogo"],
      },
      Nduba: {
        Butare: ["Kanani","Kidahe","Kigabiro","Nyamurambi","Nyarubuye","Nyura"],
        Gasanze: ["Gatagara","Kagarama","Nyabitare","Nyakabungo","Nyarubande","Uruhetse"],
        Gasura: ["Agacyamo","Gashinya","Gikombe","Kazi","Kigufi","Nyirakibehe","Uruhahiro"],
        Gatunga: ["Agasharu","Amataba","Burungero","Karama","Nyange","Rebero","Uruyange"],
        Muremure: ["Gatobotobo","Kibungo","Musezero","Nyaburoro","Taba"],
        Sha: ["Bikumba","Gakizi","Gatare","Kamuyange","Kigarama","Ngara"],
        Shango: ["Akazi","Kaduha","Kamuhoza","Mirambi","Munini","Ndanyoye","Nyamigina","Rugarama"],
      },
      Remera: {
        Nyabisindu: ["Amarembo I","Amarembo Il","Gihogere","Kagara","Kinunga","Nyabisindu","Rugarama"],
        Nyarutarama: ["Gishushu","Juru","Kamahwa","Kangondo I","Kangondo II","Kibiraro I","Kibiraro II"],
        "Rukiri I": ["Agashyitsi","Amajyambere","Izuba","Gisimenti","Ubumwe","Ukwezi","Urumuri"],
        "Rukiri II": ["Amahoro","Rebero","Ruturusu I","Ruturusu II","Ubumwe"],
      },
      Rusororo: {
        Bisenga: ["Bisenga","Gakenyeri","Gasiza","Kidogo"],
        Gasagara: ["Agatare","Gasagara","Kamasasa","Rugagi","Ryabazana"],
        "Kabuga I": ["Abatangampundu","Amahoro","Isangano","Kabeza","Kalisimbi","Masango"],
        "Kabuga II": ["Bwiza","Cyanamo","Gatare","Kamashashi","Mataba","Nyagakombe","Ruhangare"],
        Kinyana: ["Busenyi","Kigabiro","Kinyana","Nyagisozi"],
        Mbandazi: ["Cyeru","Karambo","Kataruha","Mugeyo","Rugarama","Samuduha"],
        Nyagahinga: ["Gisharara","Kabutare","Kanyinya","Kigarama","Nyarucundura","Runyonza","Urumuri"],
        Ruhanga: ["Kinyaga","Mirama","Nyagacyamo","Rugende","Ruhanga"],
      },
      Rutunga: {
        Gasabo: ["Gasharu","Mulindi","Vugavuge"],
        Indatemwa: ["Kabarera","Kamusengo","Karekare","Karuranga","Nyakabande"],
        Kabaliza: ["Kabaliza","Nyamise","Rwanyanza"],
        Kacyatwa: ["Cyili","Kacyatwa","Kandamira","Kantabana","Munini"],
        Kibenga: ["Abanyangeyo","Kibenga","Nyamvumvu"],
        Kigabiro: ["Kamusare","Karwiru","Kigabiro","Rukerereza","Rwintare"],
      },
    },
    Kicukiro: {
      Gahanga: {
        Gahanga: ["Gahanga","Gatare","Gatovu","Rinini","Rwinanka","Ubumwe"],
        Kagasa: ["Kabeza","Kabidandi","Kiyanja","Nyacyonga","Nyagafunzo","Nyakuguma","Rugando II"],
        Karembure: ["Amahoro","Bigo","Kabeza","Kamuyinga","Karembure","Kimena","Mubuga","Rwamaya"],
        Murinja: ["Kampuro","Kigasa","Mashyiga","Nyabigugu","Nyamuharaza","Rukore","Runyoni","Sabununga"],
        Nunga: ["Kigarama","Kinyana","Mugendo","Nunga I","Nunga II","Rugasa"],
        Rwabutenge: ["Gahosha","Gashubi","Kaboshya","Karambo","Rebero","Rugando I"],
      },
      Gatenga: {
        Gatenga: ["Amahoro","Gakoki","Gatenga","Ihuriro","Isangano","Rugari"],
        Karambo: ["Gwiza","Ihuriro","Jyambere","Kamabuye","Mahoro","Ramiro","Rebero","Rugwiro","Ruhuka","Sangwa"],
        Nyanza: ["Bwiza","Cyeza","Gasabo","Ihuriro","Isonga","Juru","Marembo","Murambi","Nyanza","Rebero","Rusororo","Sabaganga","Taba"],
        Nyarurama: ["Bigo","Bisambu","Kabeza","Nyabikenke"],
      },
      Gikondo: {
        Kagunga: ["Gatare","Kabuye I","Kabuye II","Kagunga I","Kagunga II","Rebero"],
        Kanserege: ["Kanserege I","Kanserege II","Kanserege III","Marembo I","Marembo II","Marembo III"],
        Kinunga: ["Kigugu I","Kigugu II","Kigugu III","Kinunga","Ruganwa I","Ruganwa II","Ruganwa III"],
      },
      Kagarama: {
        Kanserege: ["Bwiza","Byimana","Ituze","Kanserege","Kinunga"],
        Muyange: ["Kamuna","Mugeyo","Muyange","Rugunga"],
        Rukatsa: ["Inshuti","Mpingayanyanza","Nyacyonga","Nyanza","Rukatsa","Taba"],
      },
      Kanombe: {
        Busanza: ["Amahoro","Antene","Bamporeze I","Bamporeze II","Gashyushya","Gishikiri","Hope","Kariyeri","Nyarugugu","Radari","Rukore"],
        Kabeza: ["Akagera","Bwiza","Gasabo","Giporoso I","Giporoso II","Juru","Kabeza","Karisimbi","Muhabura","Mulindi","Nyarurembo","Nyenyeri","Rebero"],
        Karama: ["Bitare","Byimana","Cyurusagara","Gakorokombe","Gikundiro","Gitarama","Karama","Nyabyunyu","Nyarutovu","Urukundo"],
        Rubirizi: ["Beninka","Bukunzi","Cyeru","Intwari","Itunda","Kavumu","Susuruka","Ubumwe","Umunara","Uwabarezi","Zirakamwa"],
      },
      Kicukiro: {
        Gasharu: ["Amajyambere","Gasharu","Sakirwa","Umunyinya"],
        Kagina: ["Gashiha","Iriba","Multimedia","Umunyinya","Umuremure","Urugero"],
        Kicukiro: ["Gasave","Isoko","Karisimbi","Kicukiro","Triangle","Ubumwe"],
        Ngoma: ["Ahitegeye","Intaho","Iriba","Isangano","Urugero"],
      },
      Kigarama: {
        Bwerankori: ["Gakokobe","Gatare","Imena","Ituze","Kabutare","Kimisange","Nyenyeri","Ubumenyi"],
        Karugira: ["Ibuga","Ihuriro","Murambi","Rutoki","Taba","Terimbere","Ubutare","Umurimo"],
        Kigarama: ["Akimana","Amahoro","Byimana","Indatwa","Ingenzi","Kabeza","Karurayi","Mataba","Umucyo"],
        Nyarurama: ["Kamabuye","Karuyenzi","Kivu","Rebero","Twishorezo","Zuba"],
        Rwampara: ["Amajyambere","Bwiza","Nyarurembo","Ubumwe","Umutekano","Urumuri","Uwateke"],
      },
      Masaka: {
        Ayabaraya: ["Kababyeyi","Ayabaraya","Nyamico","Nyamyijima","Nyirakavomo","Rususa"],
        Cyimo: ["Biryogo","Bwiza","Cyimo","Kabeza","Kiyovu","Masaka","Murambi","Nyakagunga","Urugwiro"],
        Gako: ["Bamporeze","Butangampundu","Butare","Cyugamo","Gicaca","Gihuke","Kabeza","Kibande","Rebero","Rugende","Ruyaga"],
        Gitaraga: ["Gitaraga","Kabeza","Kajevuba","Nyakarambi","Nyange","Ruhanga","Rwintare"],
        Mbabe: ["Kabeza","Kamashashi","Mbabe","Murambi","Ngarama","Sangano"],
        Rusheshe: ["Cyankongi","Cyeru","Gatare","Kagese","Kanyetabi","Mubano","Ruhosha"],
      },
      Niboye: {
        Gatare: ["Byimana","Gatare","Imena","Kamahoro","Kigarama","Rugunga","Rurembo","Taba"],
        Niboye: ["Buhoro","Gaseke","Gateke","Gorora","Kigabiro","Kinunga","Kiruhura","Munini","Murehe","Mwijabo","Mwijuto","Nyarubande","Rwezamenyo","Sovu","Taba"],
        Nyakabanda: ["Amahoro","Amarebe","Amarembo","Bigabiro","Bukinanyana","Bumanzi","Bwiza","Gatsibo","Gikundiro","Indakemwa","Indamutsa","Indatwa","Inyarurembo","Isangano","Karama","Kinyana","Rugwiro","Umurava"],
      },
      Nyarugunga: {
        Kamashashi: ["Akindege","Indatwa","Intwari","Kabagendwa","Kibaya","Mukoni","Mulindi","Umucyo","Uruhongore"],
        Nonko: ["Gasaraba","Gihanga","Gitara","Kavumu","Mahoro","Nyarutovu","Rugali","Runyonza"],
        Rwimbogo: ["Gabiro","Kabaya","Kanogo","Marembo","Umushumba Mwiza","Nyandungu","Ruragendwa","Rwinyana","Rwinyange","Rwiza","Urwibutso"],
      },
    },
    Nyarugenge: {
      Gitega: {
        Akabahizi: ["Gihanga","Iterambere","Izuba","Nyaburanga","Nyenyeri","Ubukorikori","Ubumwe","Ubwiyunge","Umucyo","Umurabyo","Umuseke","Vugizo"],
        Akabeza: ["Akinyambo","Amayaga","Gitwa","Ituze","Mpazi"],
        Gacyamo: ["Amahoro","Impuhwe","Intsinzi","Kivumu","Ubumwe","Urukundo","Ururembo"],
        Kigarama: ["Ingenzi","Sangwa","Umubano","Umucyo","Umuhoza","Umurava"],
        Kinyange: ["Akabugenewe","Ihuriro","Isangano","Isano","Karitasi","Ubumanzi","Uburezi","Ubwiza","Umucyo","Umwembe","Urugano"],
        Kora: ["Isangano","Kanunga","Kinyambo","Kivumu","Kora","Mpazi","Rugano","Rugari","Ubumwe"],
      },
      Kanyinya: {
        Nyamweru: ["Bwimo","Gatare","Mubuga","Nyakirambi","Nyamweru","Ruhengeri"],
        Nzove: ["Bibungo","Bwiza","Gateko","Kagasa","Nyabihu","Rutagara I","Rutagara II","Ruyenzi"],
        Taba: ["Kagaramira","Ngendo","Nyarurama","Nyarusange","Rwakivumu","Taba"],
      },
      Kigali: {
        Kigali: ["Akirwanda","Gisenga","Kadobogo","Kagarama","Kibisogi","Muganza","Murama","Rubuye","Ruhango","Ryasharangabo"],
        Mwendo: ["Agakomeye","Akagugu","Amahoro","Amajyambere","Birambo","Isangano","Kanyabami","Karambo","Mwendo","Ruhuha","Ubuzima","Umutekano"],
        Nyabugogo: ["Gakoni","Gatare","Giticyinyoni","Kadobogo","Kamenge","Karama","Kiruhura","Nyabikoni","Nyabugogo","Ruhondo"],
        Ruriba: ["Misibya","Nyabitare","Ruhango","Ruharabuge","Ruriba","Ruzigimbogo","Ryamakomari","Tubungo"],
        Rwesero: ["Akanyamirambo","Akinama","Makaga","Musimba","Ruhogo","Rwesero","Rweza","Vuganyana"],
      },
      Kimisagara: {
        Kamuhoza: ["Buhoro","Busasamana","Isimbi","Ituze","Karama","Karwarugabo","Kigabiro","Mataba","Munini","Ntaraga","Nunga","Rurama","Rutunga","Tetero"],
        Katabaro: ["Akamahoro","Akishinge","Akishuri","Amahumbezi","Inganzo","Kigarama","Mpazi","Mugina","Ubumwe","Ubusabane","Umubano","Umurinzi","Uruyange"],
        Kimisagara: ["Akabeza","Amahoro","Birama","Buhoro","Bwiza","Byimana","Gakaraza","Gaseke","Ihuriro","Inkurunziza","Karambi","Kigina","Kimisagara","Kove","Muganza","Nyabugogo","Nyagakoki","Nyakabingo","Nyamabuye","Sangwa","Sano"],
      },
      Mageregere: {
        Kankuba: ["Kamatamu","Kankuba","Karukina","Musave","Nyarumanga","Rugendabari"],
        Kavumu: ["Ayabatanga","Kankurimba","Kavumu","Mubura","Murondo","Nyakabingo","Nyarubuye"],
        Mataba: ["Burema","Gahombo","Kabeza","Karambi","Kwisanga","Mageragere","Mataba","Rushubi"],
        Ntungamo: ["Akanakamageragere","Gatovu","Nyabitare","Nyarubande","Rubungo","Rwindonyi"],
        Nyarufunzo: ["Akabungo","Akamashinge","Maya","Nyarufunzo","Nyarurama","Rubete"],
        Nyarurenzi: ["Amahoro","Ayabaramba","Gikuyu","Iterambere","Nyabirondo","Nyarurenzi"],
        Runzenze: ["Gisunzu","Mpanga","Nkomero","Runzenze","Uwurugenge"],
      },
      Muhima: {
        Amahoro: ["Amahoro","Amizero","Inyarurembo","Kabirizi","Ubuzima","Uruhimbi"],
        Kabasengerezi: ["Icyeza","Ikana","Intwari","Kabasengerezi"],
        Kabeza: ["Hirwa","Ikaze","Imanzi","Ingenzi","Ituze","Sangwa","Umwezi"],
        Nyabugogo: ["Abeza","Icyerekezo","Indatwa","Rwezangoro","Ubucuruzi","Umutekano"],
        Rugenge: ["Imihigo","Impala","Rugenge","Ubumanzi"],
        Tetero: ["Indamutsa","Ingoro","Inkingi","Intiganda","Iwacu","Tetero"],
        Ubumwe: ["Bwahirimba","Duterimbere","Isangano","Nyanza","Urugwiro","Urwego"],
      },
      Nyakabanda: {
        "Munanira I": ["Kabusunzu","Munanira","Ntaraga","Nyagasozi","Rurembo"],
        "Munanira II": ["Gasiza","Kamwiza","Kanyange","Karudandi","Kigabiro","Kokobe","Mucyuranyana","Nkundumurimbo"],
        "Nyakabanda I": ["Akinkware","Gapfupfu","Gasiza","Kariyeri","Kokobe","Munini","Nyakabanda","Rwagitanga"],
        "Nyakabanda II": ["Ibuhoro","Kabeza","Kanyiranganji","Karujongi","Kigarama","Kirwa"],
      },
      Nyamirambo: {
        Cyivugiza: ["Amizero","Gabiro","Imanzi","Ingenzi","Intwari","Karisimbi","Mahoro","Mpano","Muhabura","Muhoza","Munini","Rugero","Shema"],
        Gasharu: ["Kagunga","Karukoro","Rwintare"],
        Mumena: ["Akanyana","Akanyirazaninka","Akarekare","Akatabaro","Irembo","Itaba","Kiberinka","Mumena","Rwampara"],
        Rugarama: ["Gatare","Kiberinka","Munanira","Riba","Rubona","Rugarama","Runyinya","Rusisiro","Tetero"],
      },
      Nyarugenge: {
        Agatare: ["Agatare","Amajyambere","Inyambo","Meraneza","Uburezi","Umucyo","Umurava"],
        Biryogo: ["Biryogo","Gabiro","Isoko","Nyiranuma","Umurimo"],
        Kiyovu: ["Amizero","Cercle Sportif","Ganza","Imena","Indangamirwa","Ingenzi","Inyarurembo","Ishema","Isibo","Muhabura","Rugunga","Sugira"],
        Rwampara: ["Amahoro","Gacaca","Intwari","Rwampara","Umucyo","Umuganda"],
      },
      Rwezamenyo: {
        "Kabuguru I": ["Muhoza","Muhuza","Mumararungu","Murambi"],
        "Kabuguru II": ["Buhoro","Gasabo","Mutara","Ubusabane"],
        "Rwezamenyo I": ["Abatarushwa","Indatwa","Inkerakubanza","Intwari"],
        "Rwezamenyo II": ["Amahoro","Umucyo","Urumuri"],
      },
    },
  },
  East: {
    Bugesera: {
      Gashora: {
        Biryogo: ["Bidudu","Biryogo","Buhoro","Gihanama","Kagarama","Kanyonyomba","Karutete","Kivugiza","Rugunga"],
        Kabuye: ["Bidudu","Kabuye","Karizinge","Rwagasiga","Rweteto"],
        Kagomasi: ["Akagako","Kagomasi","Kiruhura","Kuruganda","Runzenze","Rushubi"],
        Mwendo: ["Gaharwa","Gisenyi","Kayovu","Ruhanga","Ruhanura","Rutanga"],
        Ramiro: ["Dihiro","Kagasa I","Kagasa II","Karusine I","Karusine II","Migina","Munyinya","Rweru I","Rweru II"],
      },
      Juru: {
        Juru: ["Ayabakiza","Bisagara","Nyamigende","Rugarama","Rwamakara","Twabagarama"],
        Kabukuba: ["Gikana","Gikurazo","Kabukuba","Kamatongo","Majanja","Mbuye","Rushubi"],
        Mugorore: ["Cyirabo","Gatora","Kajevuba","Mugorore","Murambi","Rebero","Rwamurama","Tabarari"],
        Musovu: ["Bitega","Cyabasonga","Cyingaju","Kabeza","Nyaruhuru"],
        Rwinume: ["Gisororo","Kabeza","Katarara","Kinihira","Rwimpyisi","Uwimpunga"],
      },
      Kamabuye: {
        Biharagu: ["Akanigo","Biharagu","Kanyonyera","Munazi","Muyigi","Nyarurama","Rubugu"],
        Burenge: ["Akabazeyi","Kagenge","Murambo","Nyabyondo","Nyakariba","Rebero","Senga"],
        Kampeka: ["Byimana","Kampeka","Mabuye","Masangano","Mbuganzeri","Mparo","Ndama","Pamba I","Pamba II"],
        Nyakayaga: ["Akaje","Fatinkanda","Murago","Murambi","Ntungamo I","Ntungamo II","Nyakayaga"],
        Tunda: ["Cyogamuyaga","Mububa I","Mububaya II","Rubirizi","Rusibya","Tunda","Twuruziramire","Uwibiraro I","Uwibiraro II","Uwumusave"],
      },
    },
    Kayonza: {
      Gahini: {
        Juru: ["Gisenga","Juru","Kamudongo","Kimana","Kwisoko","Mikinga","Miyaga","Musimbi","Nyabombe","Nyabugogo","Nyakabungo","Rubariro"],
        Kahi: ["Akabare","Nyamiyaga","Rukore","Tsima","Uruhuha"],
        Kiyenzi: ["Kabuye","Kinyinya","Kiyenzi","Nyagahandagaza","Nyirampaca"],
        Urugarama: ["Akabahizi","Akabeza","Akamuyenzi","Akimpara","Buyanja","Ibiza","Myatano","Nyagitabire","Rwinkuba","Umwiga","Urugarama","Videwo"],
      },
    },
    Kirehe: {
      Gahara: {
        Butezi: ["Cyamabuye","Cyasusa I","Cyasusa II","Irama Centre","Kabeza","Kijumbura I","Kijumbura II","Kijumbura III","Kivogera","Rwabarimba","Rwabiyombe","Rwamabenga","Rwamuzima","Samuko","Umubano I","Umubano II"],
        Muhamba: ["Bukorasi","Cyobaharaye","Gacaca","Gasaka","Gasasa","Kabeza","Muhero","Murama","Muyange","Ntaruka","Nyabitare","Rusisiro"],
      },
    },
    Ngoma: {
      Gashanda: {
        Cyerwa: ["Cyerwa","Gako","Mizibiri","Muyange","Nyamugali","Ruyema I","Ruyema II"],
        Giseri: ["Kibimba","Murambi","Nyagitabire","Rubambantare","Rwambohero","Rwanyamigono"],
        Munege: ["Gakuto","Kanege","Nyagasenga","Rugarama"],
        Mutsindo: ["Cyanama","Gisenyi","Kanyinya","Kirundo","Nyakarambo","Nyamasare","Rwakavuna","Rwinkuba","Ryangiriye"],
      },
    },
    Nyagatare: {
      Gatunda: {
        Cyagaju: ["Hanganyundo","Iramiro","Isangano","Kabeza","Kibisabo"],
        Kabeza: ["Huriro","Kabeza","Muvumba","Muyenzi","Nyamirambo","Rebero"],
        Nyamikamba: ["Byimana","Gikunyu","Gitega","Gitovu","Kaburimbo","Kibuye","Nyamikamba","Rwebare","Ryabuvara","Ryarukabura"],
      },
      Nyagatare: {
        Barija: ["Barija A","Barija B","Burumba","Kinihira"],
        Bushoga: ["Bushoga","Cyabahanga","Cyonyo","Ruhuha I","Ruhuha II","Ryinkuyu"],
        Cyabayaga: ["Akamonyi","Bihinga","Cyabayaga","Nyakabuye","Urugero"],
        Gakirage: ["Gakirage","Kiboga I","Kiboga II","Mihingo","Nkongi","Urumuri"],
        Kamagiri: ["Kamagiri","Karungi","Nkerenke"],
        Nsheke: ["Kabare","Nsheke","Nyegeza"],
        Nyagatare: ["Mirama I","Mirama II","Nyagatare I","Nyagatare II","Nyagatare III"],
        Rutaraka: ["Gihorobwa","Mugari","Nkonji","Rutaraka","Ryabega"],
        Ryabega: ["Marongero","Rugendo","Ryabega"],
      },
    },
    Rwamagana: {
      Fumbwe: {
        Mununu: ["Cyingara","Janjagiro","Kabeza","Kabuga","Ndinda","Nyirabiteri"],
        Nyagasambu: ["Mataba","Rambura","Rebero","Rugarama","Rugenge"],
        Nyakagunga: ["Akabeza","Kibaza","Kirehe","Rugarama"],
      },
      Gahengeri: {
        Gihumuza: ["Cyanga","Gatare","Kabeza","Kajevuba","Nyirabujari","Rebero"],
        Kagezi: ["Akabuga","Kabonero","Rwarugaju","Samatare"],
      },
    },
  },
  North: {
    Burera: {
      Bungwe: {
        Bungwe: ["Bungwe","Gakeri","Gatenga","Kinihira","Nyabyondo","Rweru","Zaneza"],
        Bushenya: ["Buhinga","Bushenya","Gifumba","Mbuga","Ryamayaya"],
        Mudugari: ["Buzaniro","Kivumo","Mubuga","Rubayo","Sangabuzi","Vunga"],
        Tumba: ["Byorera","Karwema","Mubuga","Murambo","Mutungo","Nama","Nyarukore","Tumba"],
      },
    },
    Gakenke: {
      Busengo: {
        Birambo: ["Birambo","Gitwa","Kirwa","Nyarubande"],
        Butereri: ["Buhuga","Butereri","Gasakuza","Kirwa","Rubaga","Rugendabari","Rwinkuba"],
        Byibuhiro: ["Gatoke","Kamina","Karambi","Nyagasozi","Ruboza"],
      },
    },
    Gicumbi: {
      Byumba: {
        Gacurabwenge: ["Gacurabwenge","Gasharu","Gashirwe","Rubyiniro","Ruyaga","Rwasama"],
        Gisuna: ["Bereshi","Gatare","Gisuna","Kinihira I","Kinihira II","Rebero","Ruhashya","Rwiri"],
        Kibali: ["Gakenke","Mugorore","Rugarama","Ruzo"],
      },
    },
    Musanze: {
      Busogo: {
        Gisesero: ["Gahanga","Jabiro","Kabaya","Nengo"],
        Kavumu: ["Gatovu","Karema","Karuriza","Mutaboneka","Rugeshi"],
        Nyagisozi: ["Cyasure","Gora","Kabwenge","Kirezi","Rurembo"],
        Sahara: ["Nyarubuye","Nyiragaju","Rubaya","Ryamukutsi"],
      },
      Kinigi: {
        Bisoke: ["Bunyenyeri","Kamata","Karambi","Kazi","Kumazi","Shonero","Susa"],
        Kaguhu: ["Kabeza","Kaniga","Impano","Musingi","Myase","Nyarusizi","Nyundo","Rugeshi","Ruginga","Rurembo"],
        Kampanga: ["Kamakara","Muhe","Nyarubande","Nyejoro","Rubara","Rugi","Rutindo"],
        Nyabigoma: ["Cyabirego","Gahura","Gasizi","Kabatwa","Karyasenge","Mitobo","Nyakagezi","Nyakigina","Rebero"],
        Nyonirima: ["Bazizana","Butorwa I","Butorwa II","Gahisi","Gasura","Kansoro","Kanyampereri","Nyagisenyi"],
      },
      Muhoza: {
        Cyabararika: ["Buhuye","Bwuzuri","Gasanze","Gatare","Gatorwa","Kabogobogo","Yorodani"],
        Kigombe: ["Kavumu","Kiryi","Mugara","Nduruma","Nyamagumba","Nyamuremure","Rukereza"],
        Mpenge: ["Gikwege","Giramahoro","Mpenge","Rukoro","Rusagara"],
        Ruhengeri: ["Buhoro","Burera","Bushozi","Byimana","Kabaya","Muhe","Susa"],
      },
      Musanze: {
        Cyabagarura: ["Bitare","Bukane","Gaturo","Gikeri","Kabaya","Kageyo","Kanyabirayi","Kiroba","Rugeyo","Ruvumu"],
        Garuka: ["Cyanturo","Gacinyiro","Gapfuro","Kanganwa","Kanyaminaba"],
        Kabazungu: ["Bihinga","Kidendezi","Mufukuro","Nyabageni","Rucumu","Rwunga"],
        Nyarubuye: ["Bannyisuka","Kareba","Kavumbu","Murenzi","Nturo","Tero"],
        Rwambogo: ["Buhunge","Gakoro","Kirerema","Nyarubande","Runyangwe","Rwunga"],
      },
    },
    Rulindo: {
      Base: {
        Cyohoha: ["Bukangano","Buramba","Gihemba","Gitwa","Kabingo","Kabuga","Musenyi","Mushongi","Nyangoyi","Rubanda"],
        Gitare: ["Bushyiga","Gatete","Gihora","Gisiza","Kirwa","Mugenda I","Mugenda II","Nyamugali","Rugaragara","Rugerero"],
        Rwamahwa: ["Base","Cyondo","Gitovu","Kabahama","Kabeza","Karambi","Kiruli","Mutima"],
      },
    },
  },
  South: {
    Gisagara: {
      Gikonko: {
        Cyiri: ["Curusi","Cyendajuru","Cyimpuga","Katiro","Kigitega","Kinyana","Murambi","Musambi","Sanzu"],
        Gasagara: ["Agasenyi","Karukambira","Bibungo","Gasagara","Karehe","Mugusa","Remera","Mubezi"],
        Gikonko: ["Gahabwa","Karubondo","Manyinya","Rugarama","Runyinya"],
        Mbogo: ["Bukorota","Buremera","Kirivuga","Mbogo","Nyakabuye","Nyiramageni","Rwatano","Rwintare"],
      },
    },
    Huye: {
      Huye: {
        Muyogoro: ["Agacyamu","Agasharu","Akagarama","Akaruzi","Kigarama","Munini","Nkamatira","Nyarutovu","Nyarwumba","Rugerero","Rwankoni","Rwaza","Shuni"],
        Nyakagezi: ["Gatongati","Kamutima","Karuhinda","Kigarama","Kinyana","Kinyinya","Mbuba","Munanira","Nyarunazi","Rugarama"],
        Rukira: ["Agacyamu","Agahenerezo","Agakombe","Agasharu","Gitwa","Kanazi","Kaseramba","Kubutare","Magonde","Nyagasambu","Nyanza","Rugarama","Sabaderi"],
        Sovu: ["Gako","Gasongati","Gikombe","Kabagendera","Karambo","Karuhayi","Kigarama","Ngobagoba","Rwezamenyo"],
      },
      Ngoma: {
        Butare: ["Akabuye","Bukinanyana","Buye","Gasoro","Kabutare","Karubanda","Mamba","Busenyi","Taba"],
        Kaburemera: ["Gatoki","Kaguhu","Karambi","Nyabubare","Nyagapfizi","Rugarama","Runga"],
        Matyazo: ["Gafurwe","Kabeza","Kamucuzi","Nyabitare","Rurenda","Rusisiro","Ruvuzo"],
        Ngoma: ["Ngoma V","Ngoma I","Ngoma III","Ngoma IV","Ngoma VI","Ngoma II"],
      },
    },
    Kamonyi: {
      Gacurabwenge: {
        Gihinga: ["Kagarama","Kambyeyi","Karama","Nyagasozi","Nyarunyinya","Ryabitana"],
        Gihira: ["Bugaba","Kibanza","Kidaturwa","Migina","Nyabitare"],
        Kigembe: ["Buhoro","Kabatsi","Kagarama","Mushimba","Nyakabungo","Rugobagoba"],
        Nkingo: ["Juru","Kamonyi","Mataba","Nyamiryango","Nyamugari","Rubona"],
      },
    },
    Muhanga: {
      Nyamabuye: {
        Gahogo: ["Gihuma","Kamazuru","Kamugina","Kavumu","Nyarucyamu I","Nyarucyamu II","Nyarucyamu III","Rutenga","Ruvumera"],
        Gifumba: ["Gifumba","Gisiza","Kirebe","Rugarama","Rutarabana","Samuduha"],
        Gitarama: ["Gatika","Kagitarama","Kavumu","Nyabisindu","Nyarusiza","Nyarutovu"],
        Remera: ["Biti","Gasenyi","Gasharu","Kinyenkanda","Kirenge","Munini","Nete","Nyakabingo"],
      },
    },
    Nyamagabe: {
      Cyanika: {
        Gitega: ["Butare","Gaseke","Gasharu","Gitega","Kigarama","Miko","Munyereri","Musasa","Rusarasi","Rwingoma"],
        Karama: ["Birambo","Karaba","Karama","Mugamba","Munyinya","Nyamisave","Nyanza","Rwamagana"],
        Kiyumba: ["Gatare","Gatentwe","Gikomero","Gishike","Kagarama","Kaviri","Nyarucyamu"],
        Ngoma: ["Kabarera","Kamuhirwa","Kavumu","Kinga","Murama","Nyamirambo"],
        Nyanza: ["Buhiga","Kibingo","Mirama","Mugombwa","Nyabisindu","Rugaragara"],
        Nyanzoga: ["Bigazi","Gafuhisha","Kagarama","Karuvenya","Mbeho","Mugari","Nyamirama","Rusenyi"],
      },
    },
    Nyanza: {
      Busasamana: {
        Gahondo: ["Bigega","Bugura","Kamatovu","Karama","Kavumu","Kibaga","Kiberinka","Nyakwibereka","Nyarutovu"],
        Kavumu: ["Akirabo","Gihisi A","Gihisi B","Karukoranya A","Karukoranya B","Majyambere","Mugandamure A","Mugandamure B","Mukoni","Nyagatovu","Nyamagana B","Rukandiro","Ruvumera","Kavumu","Nyamagana A"],
        Kibinja: ["Kabuzuru","Kigarama","Mukindo","Ngorongari","Rebero","Rugarama","Rugari A","Rugari B"],
        Nyanza: ["Bunyeshywa","Gakenyeri A","Gakenyeri B","Gatare","Gatsinsino","Gatunguru","Gishike","Kavumu","Kigarama","Kivumu","Mugonzi","Nyanza","Nyarunyinya","Rubona"],
        Rwesero: ["Bukinankwavu","Gahanda","Gisando","Kabona","Kidaturwa","Murambi","Mwima","Nyabisindu","Rugarama","Rukari","Rwesero","Taba"],
      },
    },
    Nyaruguru: {
      Busanze: {
        Kirarangombe: ["Bukinanyana","Gisenyi","Gitwe","Kinyinya","Masiga","Uwindava"],
        Nkanda: ["Bitare","Mutarama","Mutobo","Nkanda","Uwamakumba"],
        Nteko: ["Gisoro","Kabavomo","Ndatemwa","Nteko","Nyarukeri","Nyarusange"],
        Runyombyi: ["Bugina","Gabiro","Musebeya","Rango","Ryabusagara","Shwima"],
        Shororo: ["Bukinga","Mirindi","Murambi","Runyami","Rutabo","Uwinteko"],
      },
    },
    Ruhango: {
      Ruhango: {
        Buhoro: ["Buhoro","Gako","Kabeza","Kantama","Karambo","Muhororo I","Muhororo II","Ntinyinshi","Nyagasozi","Nyangandika","Nyarutovu","Rwinkuba"],
        Bunyogombe: ["Bugarura","Busego","Gacoko","Gishegesha","Kabega","Kamugaru","Kamugaza","Karehe","Kasemahundo","Kavumu","Kigabiro","Kigarama","Murehe","Nyabibugu","Nyabisindu","Remera","Rubazi","Rusebeya","Rwankuba"],
        Gikoma: ["Gatengeri","Gikumba","Karama","Murambi","Nangurugomo","Nyarusange","Rebero","Rubiha","Rurembo","Ryabonyinka","Wimana"],
        Munini: ["Bisambu","Bugari","Bwiza","Cyeshero","Gahama","Gaseke","Gataka","Gitwa","Kabaja","Kaburanjwiri","Kanazi","Kibingo","Kigaga","Kirima","Kiruhura","Munini","Muremera","Nyabinyenga","Nyinya","Ruhuha","Rwezamenyo"],
      },
    },
  },
  West: {
    Karongi: {
      Bwishyura: {
        Burunga: ["Kabuga","Majuri","Matyazo","Nyabikenke","Nyamarebe","Ruyenzi","Twimbogo"],
        Gasura: ["Gafuruguto","Gatare","Gatoki","Gisayo","Nyabihanga","Nyagahinga","Nyarusange","Ruganda"],
        Gitarama: ["Gitarama","Gomba","Josi","Karambo","Kigezi","Kirambo","Kivomo","Nyamigina"],
        Kayenzi: ["Buhoro","Gitega","Mugomba","Nyabikenke","Ruhande","Sakinnyaga"],
        Kibuye: ["Gacumba","Gatwaro","Rurembo"],
        Kiniha: ["Karutete","Kiyovu","Maryohe","Nyabaguma","Nyakigezi","Nyarurembo","Nyegabo","Ruganda"],
        Nyarusazi: ["Birembo","Bupfune","Bwishyura","Kanyabusage","Karongi","Nyarusozi"],
      },
    },
    Ngororero: {
      Ngororero: {
        Kaseke: ["Cyandago","Gatare","Kabeza","Kabusunzu","Kanyinya","Nyabisindu","Nyamabuye","Nyarubari"],
        Kazabe: ["Butezi","Cyansi","Kazabe","Murambi","Ngororero"],
        Mugano: ["Gashinya","Kabuga","Mana","Manogo","Mpara","Nyabisindu","Nyenyeri","Ruhuha"],
        Nyange: ["Gatare","Gihe","Kabeza","Karama","Mazimeru","Nyakaganzo","Nyange","Turamigina"],
        Rususa: ["Cyumba","Gasarara","Kabagari","Nyarubingo","Rukaragata","Rususa"],
        Torero: ["Gatare","Kanama","Karera","Nyakariba","Nyamabuye","Nyamiyaga","Rwambariro"],
      },
    },
    Nyabihu: {
      Bigogwe: {
        Arusha: ["Arusha","Bukinanyana","Busasamana","Ngamba","Ngandu","Nyabishunguru","Nyagihinga"],
        Basumba: ["Buheke","Gasizi","Giticyinyoni","Ngando","Rusenge","Vuga"],
        Kijote: ["Bikingi","Bukinanyana","Busasamana","Gasiza","Gatagara","Kabaya","Kazuba","Kijote","Shaba","Zihari"],
      },
      Jenda: {
        Bukinanyana: ["Bibanza","Bugarama","Bukinanyana","Kageri","Karuhirwa","Kibaya","Nsakira"],
        Gasizi: ["Kagano","Kanyaru","Kanzenze","Kinyengagi","Mikingo","Munanira","Rwanamiza"],
      },
    },
    Nyamasheke: {
      Bushekeri: {
        Buvungira: ["Buhinga","Bushekeri","Buvungira","Gasebeya","Gisakura","Kinzovu","Mujabagiro","Nkenga","Ruvumbu","Rwumba","Winkamba","Yove"],
        Mpumbu: ["Bona","Gahondo","Kamina","Karambi","Kirombozi"],
        Ngoma: ["Bitare","Buhembe","Bukiro","Cyeshero","Kagarama","Kanyovu","Mashuhira","Rugeregere"],
        Nyarusange: ["Butangata","Gatoki","Kinini","Mubuga","Nyanza","Rundwe","Rweza"],
      },
    },
    Rubavu: {
      Gisenyi: {
        Amahoro: ["Amahoro","Isangano","Kitagabwa","Muhabura","Murakazaneza","Murisanga","Terimbere","Umunezero","Urugwiro"],
        Bugoyi: ["Amataba","Bugoyi","Giraneza","Irakiza","Isangano","Ituze","Kaminuza","Nyakabungo","Ubutabera","Ubwiza"],
        Kivumu: ["Giponda","Igisubizo","Itangazamakuru","Karisimbi","Kivumu","Muduha","Murisanga","Ubukerarugendo","Ubumwe","Ubutabazi","Umurava","Urumuri"],
        Mbugangari: ["Abahuje","Amajyambere","Gasutamo","Haguruka","Icyinyambo","Ihumure","Ikaze","Ikibuga","Inkurunziza","Iyobokamana","Karundo","Nyarubande","Rebero","Uburanga","Uburezi","Ubwiyunge","Umubano","Umutekano"],
        Nengo: ["Gacuba","Gikarani","Kivu","Nyabagobe","Nyaburanga","Ubucuruzi","Urubyiruko"],
        Rubavu: ["Gahojo","Kamayugi","Kanyarutambi","Munini","Rubavu","Ruliba"],
        Umuganda: ["Bonde","Dukore","Ihuriro","Kabuga","Majengo","Muhato","Umucyo","Umuganda","Umunyinya"],
      },
    },
    Rutsiro: {
      Boneza: {
        Bushaka: ["Bikono","Bugarura","Gaseke","Kabirizi","Kinunu","Muramba","Rutagara","Rwimbogo"],
        Kabihogo: ["Buhonongo","Bweramana","Gashoko","Kamuyaga","Rugamba","Rwabisururu"],
        Nkira: ["Gisiza","Gisoro","Kabuga","Karukamba","Kigarama","Munanira","Murambi"],
        Remera: ["Bigabiro","Buhoro","Kaganza","Kamuzigura","Kinunga","Muyange","Rusororo"],
      },
    },
    Rusizi: {
      Bugarama: {
        Nyange: ["Cité","Cyagara","Gatebe","Kabeza","Kamabuye","Mihabura","Misufi","Mubogora","Muko","Munini","Nyange","Rubumba","Rusayo"],
        Pera: ["Buhanga","Isangano","Ituze","Kabusunzu","Kabuye","Kinamba","Kiyovu","Majyambere","Murambi","Murwa","Mwaro","Pera"],
        Ryankana: ["Gihigano","Gombaniro","Kabuga","Kagarama","Kayenzi","Mahoro","Mubombo","Muyange","Nyehonga","Rubyiro","Ruhwa","Rusizi"],
      },
    },
  },
};

/**
 * Returns all provinces
 */
export function getProvinces(): string[] {
  return Object.keys(RWANDA_LOCATIONS);
}

/**
 * Returns all districts for a given province
 */
export function getDistricts(province: string): string[] {
  return Object.keys(RWANDA_LOCATIONS[province] ?? {});
}

/**
 * Returns all districts across all provinces (flat list)
 */
export function getAllDistricts(): string[] {
  const all: string[] = [];
  for (const province of Object.values(RWANDA_LOCATIONS)) {
    all.push(...Object.keys(province));
  }
  return [...new Set(all)].sort();
}

/**
 * Returns all sectors for a district (searches across all provinces)
 */
export function getSectors(district: string): string[] {
  for (const province of Object.values(RWANDA_LOCATIONS)) {
    if (province[district]) return Object.keys(province[district]);
  }
  return [];
}

/**
 * Returns all cells for a sector within a district
 */
export function getCells(district: string, sector: string): string[] {
  for (const province of Object.values(RWANDA_LOCATIONS)) {
    if (province[district]?.[sector]) {
      return Object.keys(province[district][sector]);
    }
  }
  return [];
}

/**
 * Returns all villages for a cell within a sector within a district
 */
export function getVillages(district: string, sector: string, cell: string): string[] {
  for (const province of Object.values(RWANDA_LOCATIONS)) {
    const villages = province[district]?.[sector]?.[cell];
    if (villages) return villages;
  }
  return [];
}
