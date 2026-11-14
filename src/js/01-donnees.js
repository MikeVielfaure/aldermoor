/* ================= DONNÉES ================= */
const ELEM={
 arcane:{c:0xff7ae0,n:'Arcane',a:'arcanique',fx:'Fait léviter caisses, tonneaux, citrouilles et rochers.'},
 feu:{c:0xff7a2e,n:'Feu',a:'de braise',fx:'Enflamme arbres, caisses, plantes et ronces ; fait fondre la glace.'},
 glace:{c:0x9ee8ff,n:'Glace',a:'de givre',fx:'Gèle le lac (on peut marcher dessus !), éteint les feux, fige les créatures.'},
 eau:{c:0x3d8bff,n:'Eau',a:'des marées',fx:'Jet en cloche : éteint les incendies, repousse les créatures, fait éclore des fleurs.'},
 vent:{c:0xc9ffe0,n:'Vent',a:'des cimes',fx:'Bourrasque en cône : projette objets et créatures, attise les flammes.'},
 nature:{c:0x6fe36f,n:'Nature',a:'sylvestre',fx:'Fait pousser fleurs et buissons, régénère les arbres brûlés, enracine les créatures, des nénuphars sur l’eau.'},
 lumiere:{c:0xfff1a0,n:'Lumière',a:'d’aurore',fx:'Orbe qui éclaire la nuit 25 s, révèle les parchemins cachés, éblouit.'},
 ombre:{c:0xa170ff,n:'Ombre',a:'nocturne',fx:'Nuée d’ombre : éteint les lanternes, rend les créatures confuses.'}
};
const ELS=Object.keys(ELEM);
const hex=c=>'#'+c.toString(16).padStart(6,'0');
const FORMS={trait:{n:'Attaque',ic:'➶',cost:8},zone:{n:'Zone',ic:'◎',cost:28},util:{n:'Utilitaire',ic:'✧',cost:20}};
const FORMFX={
 arcane:{zone:'Onde : fait léviter tout ce qui t’entoure et étourdit les créatures.',util:'Télékinésie : attire à toi le parchemin ou l’objet le plus proche.'},
 feu:{zone:'Anneau de flammes autour de toi : brûle tout dans le rayon.',util:'Bond de braise : propulsion fulgurante vers l’avant.'},
 glace:{zone:'Onde de gel : fige les créatures, éteint les feux, gèle l’eau proche.',util:'Pont de givre : trace un chemin de glace devant toi (traverse le lac !).'},
 eau:{zone:'Averse localisée : éteint tout, fait fleurir, repousse les créatures.',util:'Pas de l’onde : tu marches sur l’eau pendant 12 s.'},
 vent:{zone:'Tourbillon : projette tout ce qui t’entoure.',util:'Pas du vent : super saut puis vol plané.'},
 nature:{zone:'Cercle de racines : enracine, fait pousser, régénère la forêt.',util:'Champignon sauteur : un trampoline géant devant toi.'},
 lumiere:{zone:'Aube soudaine : éclair qui blesse les créatures et révèle les parchemins à 25 m.',util:'Lueur-guide : un feu follet te mène au parchemin le plus proche.'},
 ombre:{zone:'Nuée nocturne : créatures confuses, lanternes éteintes, tu deviens discret.',util:'Pas de l’ombre : téléportation de 9 m vers l’avant.'}
};
const fxOf=sp=>(!sp.form||sp.form==='trait')?ELEM[sp.el].fx:FORMFX[sp.el][sp.form];
const POOL=[
 {name:'Étincelle',inc:'Scintilla',el:'arcane',form:'trait',desc:'Une gerbe d’énergie pure. Le premier sort de tout apprenti.'},
 {name:'Onde arcanique',inc:'Vagus Arcana',el:'arcane',form:'zone',desc:'Une vague d’énergie qui allège tout ce qu’elle touche.'},
 {name:'Sceau arcanique',inc:'Signum Vel',el:'arcane',form:'util',desc:'Soulève ce que les mains ne peuvent porter… et l’attire à toi.'},
 {name:'Flamme vive',inc:'Ardentis',el:'feu',form:'trait',desc:'Une boule de feu crépitante.'},
 {name:'Lame de braise',inc:'Cindrel',el:'feu',form:'trait',desc:'Un trait de braise rapide et précis.'},
 {name:'Anneau de braise',inc:'Circulum Ignis',el:'feu',form:'zone',desc:'Un cercle de flammes jaillit autour de toi.'},
 {name:'Bond de braise',inc:'Saltus Ignis',el:'feu',form:'util',desc:'Une explosion maîtrisée te propulse en avant.'},
 {name:'Souffle de givre',inc:'Glacimor',el:'glace',form:'trait',desc:'Un éclat de glace qui fige tout ce qu’il touche.'},
 {name:'Prison de cristal',inc:'Krystalor',el:'glace',form:'zone',desc:'Le froid se répand tout autour de toi.'},
 {name:'Pont de givre',inc:'Pontis Gelu',el:'glace',form:'util',desc:'Un ruban de glace se déroule devant tes pieds.'},
 {name:'Vague courte',inc:'Undara',el:'eau',form:'trait',desc:'Fait jaillir un jet d’eau puissant.'},
 {name:'Pluie d’argent',inc:'Pluvessa',el:'eau',form:'zone',desc:'Une averse magique et localisée.'},
 {name:'Pas de l’onde',inc:'Undiris',el:'eau',form:'util',desc:'L’eau devient ferme sous tes pas.'},
 {name:'Bourrasque',inc:'Ventolis',el:'vent',form:'trait',desc:'Une rafale qui balaie tout devant toi.'},
 {name:'Tourbillon',inc:'Vortexa',el:'vent',form:'zone',desc:'Un cyclone miniature se forme autour de toi.'},
 {name:'Pas du vent',inc:'Aeris Gradus',el:'vent',form:'util',desc:'Le vent te soulève et te porte.'},
 {name:'Éveil des ronces',inc:'Verdaliss',el:'nature',form:'trait',desc:'Une graine qui germe instantanément.'},
 {name:'Murmure des racines',inc:'Radixa',el:'nature',form:'zone',desc:'Parle aux racines et soigne la terre.'},
 {name:'Champignon sauteur',inc:'Fungor Saltus',el:'nature',form:'util',desc:'Un champignon géant, très élastique.'},
 {name:'Orbe de clarté',inc:'Lucerna',el:'lumiere',form:'trait',desc:'Une sphère de lumière qui flotte et révèle le caché.'},
 {name:'Aube soudaine',inc:'Solenna',el:'lumiere',form:'zone',desc:'Un éclat de lumière aveuglant.'},
 {name:'Lueur-guide',inc:'Lucis Iter',el:'lumiere',form:'util',desc:'Un petit feu follet curieux qui sait où se cachent les grimoires.'},
 {name:'Voile d’ombre',inc:'Umbrisa',el:'ombre',form:'trait',desc:'Une nuée qui avale la lumière.'},
 {name:'Murmure nocturne',inc:'Noctiel',el:'ombre',form:'zone',desc:'Les ombres s’épaississent autour de toi.'},
 {name:'Pas de l’ombre',inc:'Umbra Gradus',el:'ombre',form:'util',desc:'Tu te dissous dans l’ombre et réapparais plus loin.'}
];
const COMBOS=[
 {id:'tornade',n:'Tornade de feu',a:'vent',b:'feu',hint:'Que se passe-t-il si le vent rencontre des flammes ?',d:'Une colonne de feu tourbillonnante avance et embrase tout sur son passage.'},
 {id:'patinoire',n:'Patinoire',a:'eau',b:'glace',hint:'Mouille le sol… puis gèle-le.',d:'Le sol devient une patinoire : tu glisses à toute vitesse.'},
 {id:'arc',n:'Arc-en-ciel',a:'lumiere',b:'eau',hint:'La lumière et l’eau, ensemble au même endroit…',d:'Un arc-en-ciel révèle tous les parchemins cachés alentour.'},
 {id:'floraison',n:'Floraison de mana',a:'eau',b:'nature',hint:'Arrose ce que tu fais pousser.',d:'Une fleur de mana éclot : cueille-la pour recharger toute ta magie.'},
 {id:'eclipse',n:'Éclipse',a:'lumiere',b:'ombre',hint:'Mêle la lumière et l’ombre au même endroit.',d:'Toutes les créatures proches sont foudroyées.'},
 {id:'meteore',n:'Météore',a:'arcane',b:'feu',hint:'Enflamme un objet qui lévite…',d:'L’objet enflammé retombe et explose.'},
 {id:'blizzard',n:'Blizzard',a:'glace',b:'vent',hint:'Le vent peut porter le froid.',d:'Une tempête de neige fige tout sur son passage, même l’eau du lac.'}
];
const UNIQ={feu:{n:'Embrasement',d:'Tes boules de feu explosent sur une large zone et enflamment les créatures.'},glace:{n:'Glace éternelle',d:'La glace sur le lac dure 3 minutes.'},eau:{n:'Source vive',d:'Chaque sort d’eau te rend 12 mana.'},vent:{n:'Plume',d:'Maintiens Saut en tombant pour planer.'},nature:{n:'Racines voraces',d:'Les créatures enracinées perdent des forces.'},lumiere:{n:'Clairvoyance',d:'Les parchemins cachés scintillent de loin.'},ombre:{n:'Silhouette',d:'La nuit, les créatures ne te poursuivent plus, et Pas de l’ombre ne coûte plus de mana.'},arcane:{n:'Maîtrise arcanique',d:'La lévitation dure 2× plus longtemps et les objets projetés blessent les créatures.'}};
const TAL_GEN=[
 {id:'reserve',n:'Réserve arcanique',max:3,d:'+25 mana max par rang.'},
 {id:'flux',n:'Flux vital',max:3,d:'+30 % de régénération de mana par rang.'},
 {id:'agil',n:'Agilité',max:2,d:'+10 % de vitesse par rang ; au rang 2 : double saut.'},
 {id:'conc',n:'Concentration',max:2,d:'−15 % de coût en mana par rang.'}
];
const RANKS=[{min:1,n:'Apprenti',slots:2},{min:5,n:'Adepte',slots:3},{min:10,n:'Mage',slots:4},{min:15,n:'Archimage',slots:5}];
const LOCS=[
 {id:'cour',name:'Grande Cour',x:0,z:2,r:11,spot:{x:3.9,z:5}},
 {id:'chateau',name:'Château d’Aldermoor',x:0,z:-35,r:12,spot:{x:0,z:-32}},
 {id:'biblio',name:'Tour-Bibliothèque',x:-30,z:-29,r:9,spot:{x:-27,z:-24}},
 {id:'observatoire',name:'Observatoire',x:30,z:-29,r:9,spot:{x:27,z:-24}},
 {id:'serre',name:'Serres enchantées',x:-36,z:13,r:10,spot:{x:-36,z:18}},
 {id:'lac',name:'Lac des Murmures',x:38,z:26,r:17,spot:{x:26,z:24}},
 {id:'foret',name:'Forêt de Sombrebois',x:-48,z:52,r:20,spot:{x:-46,z:50}},
 {id:'village',name:'Village de Brumepont',x:12,z:62,r:15,spot:{x:14.5,z:62}},
 {id:'cercle',name:'Cercle de pierres',x:58,z:-6,r:9,spot:{x:61,z:-6}},
 {id:'arene',name:'Arène des duels',x:-12,z:30,r:9,spot:{x:-12,z:30}},
 {id:'hauteurs',name:'Hauteurs de Brisevent',x:52,z:-56,r:13,spot:{x:50,z:-55}},
 {id:'moulin',name:'Moulin du Ru',x:40,z:-16,r:7,spot:{x:37.2,z:-14.2}},
 {id:'marais',name:'Marais des Lucioles',x:56,z:54,r:12,spot:{x:52.5,z:52.5},from:[26,58]},
 {id:'ruines',name:'Ruines d’Ysmer',x:-66,z:-24,r:11,spot:{x:-57.5,z:-24},from:[-30,-22]},
 {id:'bosquet',name:'Bosquet des Murmures',x:-80,z:22,r:10,spot:{x:-76.5,z:22},hidden:true}
];
const LOCBY={};LOCS.forEach(l=>LOCBY[l.id]=l);
const LAKE={x:42,z:26,r:12.6};
const NPCS=[
 {id:'orvane',name:'Pr. Orvane',role:'professeur de sortilèges, sévère mais juste',home:'chateau',els:['arcane','feu'],cl:['chateau','arene','cour'],look:{skin:0xe2bf9c,hair:0xc8c8c8,style:'short',beard:0xe0e0e0,hat:0x2a1846,robe:0x4b2a78,trim:0xd4af37,h:1.08}},
 {id:'mirelle',name:'Pr. Mirelle Fougère',role:'professeure de botanique magique, joviale et distraite',home:'serre',els:['nature','eau'],cl:['serre','foret','lac'],look:{skin:0xf0c8a0,hair:0xc0602a,style:'bun',hat:0x6b4a22,robe:0x2f6b3a,trim:0xe8c060,h:0.95}},
 {id:'cassius',name:'Cassius Noirval',role:'astronome excentrique qui parle aux étoiles',home:'observatoire',els:['lumiere','ombre'],cl:['observatoire','cercle'],look:{skin:0xb88a64,hair:0x1a1a1a,style:'long',beard:0x1a1a1a,hat:0x0d1638,robe:0x1f2f6b,trim:0xbfd0ff,h:1.0}},
 {id:'ysolde',name:'Ysolde',role:'bibliothécaire mystérieuse, gardienne de grimoires vivants',home:'biblio',els:['ombre','vent','glace'],cl:['biblio','lac','cercle'],look:{skin:0xf4dcc8,hair:0xe8e8f4,style:'long',robe:0x5a4420,trim:0x9a7a3a,h:1.02}},
 {id:'bram',name:'Bram',role:'garde-chasse bourru, connaît chaque créature de la forêt',home:'foret',els:['nature','glace','vent'],cl:['foret','lac','arene'],look:{skin:0xb98058,hair:0x5a3a1a,style:'short',beard:0x5a3a1a,robe:0x5a3a22,trim:0x3a2614,h:1.15,w:1.2}},
 {id:'lila',name:'Lila Brisevent',role:'élève espiègle, rivale amicale du joueur',home:'cour',els:[],cl:[],look:{skin:0xf0c8a0,hair:0x2a1a10,style:'pony',hat:0x6a1426,robe:0x8a2a4a,trim:0xf3cf7a,h:0.9}},
 {id:'tobias',name:'Tobias',role:'aubergiste du village, adore les ragots',home:'village',els:[],cl:[],look:{skin:0xe0b090,hair:0x6a4a2a,style:'bald',beard:0x6a4a2a,robe:0x8a6a3a,trim:0xf0e6d0,h:1.0,w:1.25}},
 {id:'gaspard',name:'Gaspard',role:'meunier bougon mais généreux, garde le Moulin du Ru',home:'moulin',els:[],cl:[],look:{skin:0xe8c0a0,hair:0xd8d0c0,style:'short',beard:0xe0d8c8,robe:0x7a6a4a,trim:0xe8e0d0,h:1.06,w:1.15}},
 {id:'brindille',name:'Mère Brindille',role:'herboriste excentrique du Marais des Lucioles, experte en potions',home:'marais',els:['nature','eau'],cl:['marais','foret'],look:{skin:0xd8b8a0,hair:0x8a9a7a,style:'long',hat:0x3a4a2a,robe:0x4a5a3a,trim:0xb8a060,h:0.92}}
];
const NPCBY={};NPCS.forEach(n=>NPCBY[n.id]=n);
const PROFS=NPCS.filter(n=>n.cl.length);
const LINES={
 orvane:['Trois sceaux gardent les Souterrains. N’y descendez pas sans préparation.','La discipline est la mère de tout sortilège, jeune apprenti.','Tu traînes encore ? Le savoir n’attend personne.','Un sort mal prononcé peut transformer ton nez en chandelier. Concentre-toi.'],
 mirelle:['Oh ! Attention aux mordillantes, elles sont grognonnes aujourd’hui.','Une plante heureuse, c’est un sort à moitié lancé !','Si tu brûles mes citrouilles, je te transforme en radis.'],
 cassius:['Les braseros du Cercle ont un ordre. La lumière le connaît.','Les étoiles murmurent ton nom… ou peut-être est-ce le vent.','Cette nuit, la constellation du Hibou-Lyre est alignée. Étrange…','Le ciel a changé depuis hier. Quelque chose se prépare.'],
 ysolde:['On dit qu’un glyphe dort sur le flanc ouest de ma tour… invisible sans lumière.','L’oracle des ruines a deux voix, dit-on : une pour le jour… et une pour la nuit.','Chut. Les livres écoutent.','Certains grimoires choisissent leur lecteur. Pas l’inverse.','On dit qu’un sort de lumière révèle ce que les yeux ne voient pas.'],
 bram:['Reste sur le sentier, petit. Et ne mets pas le feu à ma forêt.','Paraît qu’en gelant le lac, on peut atteindre des endroits… intéressants.','Les bestioles sont nerveuses. Mauvais présage.'],
 lila:['Je parie que j’apprends trois sorts avant toi !','T’as vu les lueurs près du Cercle de pierres ? Ça sent l’aventure.','J’ai fait léviter un tonneau sur la tête d’Orvane. Retenue. Encore.'],
 tobias:['Un chocolat aux épices de comète ? C’est la maison qui offre.','Paraît qu’on a vu un parchemin voler au-dessus du village !','Si tu touches à mes tonneaux, tu les ramasses.'],
 gaspard:['Ma roue tourne depuis quarante ans. Enfin… quand personne ne la gèle.','La farine d’ici a un goût de pluie et de lune. C’est la rivière.','Un coup de vent dans la roue et la meule chante ! Mais pas de glace, hein.','Le vent et l’eau, voilà mes seuls patrons.'],
 brindille:['Les lucioles savent où poussent les champignons lunaires. Suis-les, la nuit.','Hé hé… un marais, c’est une soupe qui mijote depuis mille ans.','Ne bois jamais l’eau verte. Sauf si tu veux parler aux grenouilles.','Mon chaudron est à toi, petit. Les ingrédients, par contre…','Les ruines à l’ouest ? L’oracle ne parle qu’une fois par jour. Écoute-le bien.']
};
const ITEMS=['une fiole de rosée lunaire','une plume de griffon','un vieux grimoire','une clé d’argent','un cristal chantant','une racine de mandragore','une boussole qui indique le nord… de travers','un œuf de salamandre tiède'];
const EVT=[
 {t:'Incendie dans les serres',d:'Des plantes-braises se sont enflammées !',need:'eau',loc:'serre'},
 {t:'Brume chuchotante',d:'Une brume qui murmure des secrets recouvre les lieux.',need:'vent'},
 {t:'Ombres errantes',d:'Des ombres se détachent des murs et rôdent.',need:'lumiere'},
 {t:'Ronces vivantes',d:'Des ronces enchantées bloquent le passage.',need:'feu'},
 {t:'Fontaine déchaînée',d:'L’eau jaillit en tous sens, ensorcelée.',need:'glace',loc:'cour'},
 {t:'Arbre assoiffé',d:'Un vieil arbre se dessèche à vue d’œil.',need:'nature'},
 {t:'Glyphe instable',d:'Un glyphe gravé crépite d’énergie folle.',need:'arcane'},
 {t:'Lanterne trop brillante',d:'Une lanterne folle aveugle tout le monde.',need:'ombre'}
];
const CREA=[
 {name:'Feux follets',look:'feu',weak:'eau'},{name:'Lutins de givre',look:'glace',weak:'feu'},
 {name:'Esprits d’ombre',look:'ombre',weak:'lumiere'},{name:'Farfadets tapageurs',look:'nature',weak:'vent'},
 {name:'Étincelles sauvages',look:'arcane',weak:'ombre'}
];

