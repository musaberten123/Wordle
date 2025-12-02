// Wordle Clone JS: Multi-language & country support (initial skeleton)

// Global config
const LANGUAGES = [
  { code: 'tr', label: 'Türkçe' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'it', label: 'Italiano' },
  { code: 'lol', label: 'LoL Champions' }
];

const COUNTRY_TO_LANG = {
  'TR': 'tr',
  'DE': 'de',
  'NL': 'nl',
  'BE': 'nl',
  'IT': 'it',
  'CH': 'de', // (default Schweiz Almanca)
  'AT': 'de',
  'LU': 'de',
  // ...others
};

const MANUAL_LANG_KEY = 'wordle_manual_lang';

let currentLang = 'en';
let autoDetectedLang = 'en';
let wordLists = {};
let gameMode = 'daily'; // 'daily' or 'unlimited'

// ---- İPUCU VERİSİ ----
const HINTS_TR = {
  "ADRES": "Bir yerin bulunduğu konum, sokak ve numara bilgisi.",
  "AHLAK": "İnsanın doğru ve yanlış davranışları, ahlaki değerler.",
  "AKICI": "Akışkan, pürüzsüz, akıcı bir şekilde akan.",
  "AKŞAM": "Günün sonunda, akşam yemeği zamanı.",
  "ARABA": "Tekerlekli, motorlu kara taşıtı.",
  "ARAMA": "Bir şeyi bulmak için yapılan işlem.",
  "ARMUT": "Ağaçta yetişen, tatlı meyve.",
  "BAHAR": "İlkbahar mevsimi, çiçeklerin açtığı zaman.",
  "BAHÇE": "Evlerin etrafında bitki yetiştirilen alan.",
  "BAKIM": "Bir şeyin düzenli olarak kontrol edilmesi ve korunması.",
  "BALIK": "Suda yaşayan, solungaçlı hayvan.",
  "BANKA": "Para işlemleri yapılan finansal kurum.",
  "BANYO": "Yıkanma odası, banyo yapılan yer.",
  "BASIT": "Kolay, karmaşık olmayan, sade.",
  "BAŞKA": "Farklı, diğer, öteki.",
  "BELKİ": "Muhtemelen, olabilir, ihtimal var.",
  "BEYAZ": "Kar ve süt rengi, en açık renk.",
  "BIÇAK": "Kesmek için kullanılan keskin alet.",
  "BULUT": "Gökyüzünde su buharından oluşan beyaz veya gri kütle.",
  "BURUN": "Yüzün ortasında, koku alma organı.",
  "BÖREK": "Hamur içine peynir, et vb. konularak yapılan yiyecek.",
  "BÜYÜK": "Küçük olmayan, iri, geniş.",
  "BİBER": "Acı veya tatlı, yemeklerde kullanılan sebze.",
  "BİLGİ": "Öğrenilen, bilinen şey, malumat.",
  "CADDE": "Şehirlerde geniş, ana yol.",
  "CANLI": "Yaşayan, hayatı olan.",
  "CEKET": "Üst giyim eşyası, dış giyim.",
  "DAHİL": "İçinde, kapsamında, dahil olan.",
  "DALGA": "Deniz veya gölde suyun yükselip alçalması.",
  "DAMAR": "Vücutta kan taşıyan boru.",
  "DAİRE": "Apartmanlarda yaşanılan bölüm, ev.",
  "DEMEK": "Söylemek, ifade etmek.",
  "DEMİR": "Sert, güçlü metal, inşaat malzemesi.",
  "DENEY": "Bilimsel test, deneme.",
  "DENGE": "Düzen, uyum, dengeli olma.",
  "DENİZ": "Büyük su kütlesi, okyanus kenarı.",
  "DERGİ": "Periyodik yayın, dergi.",
  "DERİN": "Yüzeyden aşağıya doğru uzak, derinlik.",
  "DEĞER": "Kıymet, önem, değerli olan.",
  "DEĞİŞ": "Farklılaşma, değişiklik.",
  "DOKUZ": "Sayı, 8'den sonra gelen.",
  "DOLAP": "Eşya koymak için kapaklı mobilya.",
  "DOSYA": "Bilgisayarda veri saklama birimi.",
  "DURAK": "Otobüs, tramvay vb. durduğu yer.",
  "DURUM": "Hal, vaziyet, durum.",
  "DUVAR": "Binalarda bölme veya çevre yapısı.",
  "DÜNYA": "Üzerinde yaşadığımız gezegen.",
  "DÜZEN": "Sıra, tertip, düzenli olma.",
  "DÜZEY": "Seviye, derece, düzey.",
  "EKMEK": "Temel besin, un ve sudan yapılan.",
  "ELMA": "Ağaçta yetişen, kırmızı veya yeşil meyve.",
  "EYLÜL": "Yılın 9. ayı, sonbahar başlangıcı.",
  "FİYAT": "Bir şeyin para karşılığı, ücret.",
  "GÜNEŞ": "Gündüz gökyüzünde parlayan yıldız, ışık ve sıcaklık verir.",
  "HABER": "Yeni bilgi, haber, duyuru.",
  "HAFTA": "7 günlük zaman dilimi.",
  "HANGİ": "Soru kelimesi, hangi olan.",
  "HAVLU": "Kurulanmak için kullanılan bez.",
  "HAVUÇ": "Turuncu renkli, toprak altında yetişen sebze.",
  "HAYAT": "Doğumdan ölüme kadar geçen süreç.",
  "HAYIR": "Olumsuz cevap, reddetme.",
  "KABAK": "Sarı veya yeşil, yuvarlak sebze.",
  "KAHVE": "Sabahları içilen sıcak içecek, kahverengi renkli.",
  "KALEM": "Yazı yazmak için kullanılan araç.",
  "KASIM": "Yılın 11. ayı, sonbahar.",
  "KAVUN": "Yaz meyvesi, sulu ve tatlı.",
  "KAŞIK": "Yemek yemek için kullanılan alet.",
  "KOYUN": "Yünü için yetiştirilen hayvan.",
  "KREMA": "Cilt bakımı veya yemek için kullanılan krem.",
  "KÖPEK": "Evcil hayvan, insanın en iyi dostu.",
  "KİRAZ": "Kırmızı, küçük, tatlı meyve.",
  "KİTAP": "Okumak için sayfalar halinde basılmış eser.",
  "MACUN": "Diş temizliği için kullanılan, diş macunu.",
  "MANTI": "Hamur içine kıyma konularak yapılan, üzerine yoğurt dökülen yemek.",
  "MASKE": "Yüzü korumak için takılan örtü.",
  "MAYIS": "Yılın 5. ayı, bahar.",
  "MESAJ": "İleti, haber, mesaj.",
  "MEYVE": "Ağaçlardan toplanan tatlı yiyecek.",
  "MUTLU": "Sevinçli, neşeli, mutlu olan.",
  "MÜZİK": "Seslerden oluşan sanat, müzik.",
  "NASIL": "Soru kelimesi, nasıl olan.",
  "NEDEN": "Soru kelimesi, sebep sormak için.",
  "NEHİR": "Büyük akarsu, ırmak.",
  "NİSAN": "Yılın 4. ayı, bahar.",
  "OLMAZ": "Mümkün değil, olmayacak.",
  "ORMAN": "Ağaçlarla kaplı geniş alan.",
  "PASTA": "Tatlı, şekerli hamur işi.",
  "PAZAR": "Haftanın son günü veya alışveriş yeri.",
  "PEMBE": "Açık kırmızı renk.",
  "PERDE": "Pencereyi örten kumaş.",
  "POŞET": "Alışveriş için kullanılan torba.",
  "PİLAV": "Pirinçten yapılan yemek.",
  "RADYO": "Ses yayını yapan cihaz.",
  "REKLAM": "Ürün veya hizmeti tanıtmak için yapılan duyuru.",
  "RESİM": "Çizilmiş veya boyanmış görsel sanat.",
  "SABAH": "Günün ilk saatleri, uyanma zamanı.",
  "SABUN": "Yıkanmak için kullanılan temizlik maddesi.",
  "SAHNE": "Tiyatro veya konserde gösteri yapılan alan.",
  "SEBZE": "Yemeklerde kullanılan bitkisel yiyecek.",
  "SEKİZ": "Sayı, 7'den sonra gelen.",
  "SERİN": "Soğuk değil ama sıcak da değil, serin.",
  "SICAK": "Yüksek sıcaklık, sıcak olan.",
  "SIFIR": "Sayı, hiçbir şey, sıfır.",
  "SINAV": "Bilgi ölçme testi, sınav.",
  "SINIF": "Okulda öğrencilerin ders gördüğü oda.",
  "SOKAK": "Şehirlerde evlerin arasındaki yol.",
  "SOĞAN": "Yemeklerde kullanılan, acı sebze.",
  "SOĞUK": "Düşük sıcaklık, soğuk olan.",
  "SİLGİ": "Yazı silmek için kullanılan araç.",
  "SİYAH": "En koyu renk, siyah.",
  "TABAK": "Yemek koymak için kullanılan düz kap.",
  "TAMAM": "Olur, kabul, tamam.",
  "TARAK": "Saç düzeltmek için kullanılan alet.",
  "TATLI": "Şekerli yiyecek, tatlı.",
  "TAVUK": "Yumurta ve et için yetiştirilen hayvan.",
  "TORBA": "Eşya taşımak için kullanılan çanta.",
  "VÜCUT": "İnsan veya hayvan bedeni.",
  "YATAK": "Uyumak için kullanılan mobilya.",
  "YAZAR": "Kitap, makale veya hikaye yazan kişi.",
  "YEMEK": "Beslenmek için tüketilen yiyecek.",
  "YEŞİL": "Çimen ve yaprak rengi.",
  "YİRMİ": "Sayı, 19'dan sonra gelen.",
  "ÇANTA": "Eşya taşımak için kullanılan torba.",
  "ÇATAL": "Yemek yemek için kullanılan çatal.",
  "ÇORAP": "Ayaklara giyilen giysi.",
  "ÇORBA": "Sulu, sıcak yemek.",
  "ÇİLEK": "Kırmızı, tatlı meyve, yaz meyvesi.",
  "ÇİÇEK": "Bitkilerin renkli, güzel kısmı.",
  "ÜZGÜN": "Mutsuz, üzüntülü olan.",
  "ŞAPKA": "Başa giyilen giysi.",
  "ŞEHİR": "Büyük yerleşim yeri, kent.",
  "ŞEKİL": "Biçim, şekil, form.",
  "ŞUBAT": "Yılın 2. ayı, kış."
};
const HINTS_EN = {
  "AGAIN": "Once more, another time.",
  "APPLE": "A popular round fruit, usually red or green.",
  "APRIL": "The fourth month of the year.",
  "BLOOD": "Red fluid that flows through the body.",
  "BRAIN": "The organ of thought and intelligence.",
  "BREAD": "A food made from flour and water, baked in an oven.",
  "CHAIR": "A piece of furniture to sit on.",
  "CLOCK": "A device that shows time.",
  "COLOR": "A visual property of objects, like red or blue.",
  "CREAM": "A thick liquid or soft solid, often used in cooking.",
  "DREAM": "Images and thoughts that occur during sleep.",
  "DRESS": "A one-piece garment for women.",
  "DRINK": "A liquid consumed for refreshment.",
  "EARTH": "The planet we live on.",
  "EIGHT": "The number 8.",
  "FIFTY": "The number 50.",
  "FLOOR": "The bottom surface of a room.",
  "FLOUR": "Powder made from grains, used in baking.",
  "FORTY": "The number 40.",
  "FRUIT": "Sweet edible part of a plant.",
  "GRAPE": "Small round fruit that grows on vines.",
  "HEART": "The organ that pumps blood.",
  "HOTEL": "A place where travelers can stay overnight.",
  "HOUSE": "A building where people live.",
  "JUICE": "Liquid from fruits or vegetables.",
  "LEARN": "To gain knowledge or skill.",
  "LEAVE": "To go away from a place.",
  "LIGHT": "Illumination, brightness.",
  "LIVER": "A large organ in the abdomen that processes nutrients.",
  "MARCH": "The third month of the year.",
  "MAYBE": "Perhaps, possibly.",
  "MONEY": "Currency used for buying things.",
  "MOUSE": "A small rodent or a computer pointing device.",
  "MOUTH": "The opening for eating and speaking.",
  "MOVIE": "A motion picture, film.",
  "MUSIC": "Sounds organized in time.",
  "NERVE": "A fiber that transmits impulses in the body.",
  "NEVER": "At no time, not ever.",
  "NIGHT": "The time between sunset and sunrise.",
  "ONION": "A vegetable with layers, often makes you cry when cut.",
  "PAINT": "A colored liquid used for painting.",
  "PAPER": "Material for writing or printing.",
  "PHONE": "A device for making calls.",
  "PLANT": "A living organism that grows in soil.",
  "PRICE": "The cost of something.",
  "QUITE": "To a certain extent, fairly.",
  "REPLY": "To respond to something.",
  "SALAD": "A dish of mixed raw vegetables.",
  "SEVEN": "The number 7.",
  "SHAPE": "The form or outline of something.",
  "SHEET": "A large piece of fabric for a bed.",
  "SHIRT": "A garment for the upper body.",
  "SMILE": "What you do when you are happy.",
  "SPINE": "The backbone, the central support of the body.",
  "STONE": "A hard solid mineral material.",
  "STORE": "A shop where goods are sold.",
  "SUGAR": "A sweet crystalline substance.",
  "TABLE": "A piece of furniture with a flat top and legs.",
  "THREE": "The number 3.",
  "TOOTH": "Hard structure in the mouth used for chewing.",
  "TOWEL": "A cloth used for drying.",
  "TRAIN": "A vehicle that runs on tracks.",
  "WATER": "A clear liquid essential for life.",
  "WHERE": "In or at what place.",
  "WHICH": "What one or ones.",
  "WHOSE": "Belonging to whom.",
  "WORLD": "The earth and all its inhabitants."
};
const HINTS_DE = {
  "APFEL": "Eine beliebte, meist rote oder grüne Frucht.",
  "TIGER": "Eine große gestreifte Raubkatze."
};
const HINTS_NL = {
  "APPEL": "Populaire ronde vrucht, vaak rood of groen.",
  "STOEL": "Hierop kun je zitten."
};
const HINTS_LOL = {
  "AATROX": "Karanlık Kılıç Savaşçısı, Darkin.",
  "AHRI": "Dokuz kuyruklu tilki, büyücü.",
  "AKALI": "Ninja suikastçı, Kinkou düzeninden.",
  "AKSHAN": "Canlandırıcı nişancı, Shurima'dan.",
  "ALISTAR": "Minotaur tank, Noxus arenasından.",
  "AMUMU": "Yalnız mumya, Shurima çölünden.",
  "ANIVIA": "Buz kuşu, Freljord'un koruyucusu.",
  "ANNIE": "Ateş büyücüsü kız, küçük ama güçlü.",
  "APHELIOS": "Ay tapınağı savaşçısı, silah ustası.",
  "ASHE": "Buz okçu, Freljord'un kraliçesi.",
  "AURELIONSOL": "Yıldız yaratıcısı ejder, kozmik güç.",
  "AZIR": "Kum imparatoru, Shurima'nın hükümdarı.",
  "BARD": "Gezgin koruyucu, mistik varlık.",
  "BELVETH": "Boşluk kraliçesi, yıkıcı güç.",
  "BLITZCRANK": "Buhar robot, Zaun'dan.",
  "BRAND": "Ateş büyücüsü, yanık ruh.",
  "BRAUM": "Kalkan savaşçı, Freljord kahramanı.",
  "CAITLYN": "Şerif nişancı, Piltover'dan.",
  "CAMILLE": "Hextech savaşçı, Piltover ajanı.",
  "CASSIOPEIA": "Yılan kadın, Shurima büyücüsü.",
  "CHOGATH": "Boşluk canavarı, yiyici.",
  "CORKI": "Havacı cüce, Bandle şehri pilotu.",
  "DARIUS": "Noxus generali, baltalı savaşçı.",
  "DIANA": "Ay savaşçısı, Lunari rahibesi.",
  "DRAVEN": "Arena şampiyonu, Noxus gladyatörü.",
  "DRMUNDO": "Zombi doktor, Zaun'dan.",
  "EKKO": "Zaman gezgini, Zaun genci.",
  "ELISE": "Örümcek kraliçe, gölge adalarından.",
  "EVELYNN": "Şeytan, acı veren varlık.",
  "EZREAL": "Maceraperest kaşif, büyücü.",
  "FIDDLESTICKS": "Korku korkuluğu, eski tanrı.",
  "FIORA": "Düello ustası, Demacia soylusu.",
  "FIZZ": "Yordle balık, deniz şeytanı.",
  "GALIO": "Büyü koruyucu heykel, Demacia.",
  "GANGPLANK": "Korsan kaptan, Bilgewater'dan.",
  "GAREN": "Demacia şövalyesi, kılıç savaşçısı.",
  "GNAR": "Yordle dinozor, eski çağdan.",
  "GRAGAS": "Şarap fıçısı savaşçı, içki sever.",
  "GRAVES": "Çifte tüfekli, Bilgewater'dan.",
  "GWEN": "Kukla kız, gölge adalarından.",
  "HECARIM": "Ölüm süvarisi, gölge adalarından.",
  "HEIMERDINGER": "Yordle mucit, teknoloji dahisi.",
  "ILLAOI": "Kraken rahibesi, Bilgewater'dan.",
  "IRELIA": "Dansçı savaşçı, Ionia'dan.",
  "IVERN": "Doğa ruhu, yeşil baba.",
  "JANNA": "Rüzgar tanrıçası, Zaun koruyucusu.",
  "JARVAN": "Demacia prensi, mızrak savaşçısı.",
  "JAX": "Silah ustası, efsanevi savaşçı.",
  "JAYCE": "Hextech mucit, Piltover'dan.",
  "JHIN": "Sanatçı katil, Ionia'dan.",
  "JINX": "Çılgın nişancı, Zaun'dan.",
  "KAISA": "Boşluk savaşçısı, Shurima'dan.",
  "KALISTA": "İntikam ruhu, gölge adalarından.",
  "KARMA": "Ionia ruh lideri, reenkarnasyon.",
  "KARTHUS": "Ölüm şarkıcısı, gölge adalarından.",
  "KASSADIN": "Boşluk yürüyücü, Shurima'dan.",
  "KATARINA": "Noxus suikastçı, bıçak fırlatıcı.",
  "KAYLE": "Melek savaşçı, adalet dağıtıcı.",
  "KAYN": "Karanlık savaşçı, Ionia'dan.",
  "KENNEN": "Yordle ninja, Ionia'dan.",
  "KHAZIX": "Boşluk avcısı, evrim geçiren.",
  "KINDRED": "Ölüm tanrıları, kurt ve koyun.",
  "KLED": "Yordle süvari, Noxus askeri.",
  "KOGMAW": "Boşluk yavrusu, tükürücü.",
  "LEBLANC": "Büyücü hileci, Gölge Gül.",
  "LEESIN": "Kör dövüşçü, Ionia keşişi.",
  "LEONA": "Güneş savaşçısı, Solari rahibesi.",
  "LILLIA": "Rüya ruhu, Ionia ormanından.",
  "LISSANDRA": "Buz büyücüsü, Freljord'dan.",
  "LUCIAN": "Işık nişancı, ölüm avcısı.",
  "LULU": "Yordle büyücü, peri dostu.",
  "LUX": "Işık büyücüsü, Demacia'dan.",
  "MALPHITE": "Taş dev, Shurima'dan.",
  "MALZAHAR": "Boşluk peygamberi, Shurima'dan.",
  "MAOKAI": "Ağaç ruhu, gölge adalarından.",
  "MASTER": "Yi savaşçı, Ionia ustası.",
  "MILIO": "Ateş büyücüsü çocuk, Ixtal'dan.",
  "MISS": "Fortune nişancı, Bilgewater'dan.",
  "MORDEKAISER": "Demir reaper, ölüm kralı.",
  "MORGANA": "Düşmüş melek, gölge büyücü.",
  "NAAFIRI": "Köpek Darkin, Shurima'dan.",
  "NAMI": "Deniz kızı, su büyücüsü.",
  "NASUS": "Köpek tanrı, Shurima'dan.",
  "NAUTILUS": "Derin deniz titan, Bilgewater'dan.",
  "NEEKO": "Şekil değiştiren, Ixtal'dan.",
  "NIDALEE": "Avcı, Shurima ormanından.",
  "NILAH": "Su savaşçısı, Bilgewater'dan.",
  "NOCTURNE": "Kabus ruhu, gölge adalarından.",
  "NUNU": "Yeti ve çocuk, Freljord'dan.",
  "OLAF": "Berserker, Freljord savaşçısı.",
  "ORIANNA": "Mekanik kız, Piltover'dan.",
  "ORNN": "Demirci tanrı, Freljord'dan.",
  "PANTHEON": "Savaş tanrısı, Targon'dan.",
  "POPPY": "Yordle şövalye, Demacia'dan.",
  "PYKE": "Hayalet suikastçı, Bilgewater'dan.",
  "QIYANA": "Element büyücüsü, Ixtal'dan.",
  "QUINN": "Demacia nişancı, şahin ile.",
  "RAKAN": "Dansçı, Ionia'dan.",
  "RAMMUS": "Armadillo, Shurima'dan.",
  "REKSAI": "Boşluk yaratığı, Shurima'dan.",
  "RELL": "Demir büyücü, Noxus'dan.",
  "RENATA": "Kimyager, Zaun'dan.",
  "RENEKTON": "Timsah tanrı, Shurima'dan.",
  "RENGAR": "Avcı, Shurima'dan.",
  "RIVEN": "Sürgün savaşçı, Noxus'dan.",
  "RUMBLE": "Yordle mech pilotu, Bandle şehri.",
  "RYZE": "Büyücü, Runeterra'dan.",
  "SAMIRA": "Mercenary, Noxus'dan.",
  "SEJUANI": "Buz savaşçı, Freljord'dan.",
  "SENNA": "Işık nişancı, gölge adalarından.",
  "SERAPHINE": "Şarkıcı, Piltover'dan.",
  "SETT": "Arena patronu, Ionia'dan.",
  "SHACO": "Palyaço suikastçı, bilinmeyen.",
  "SHEN": "Gölge savaşçı, Ionia'dan.",
  "SHYVANA": "Ejder savaşçı, Demacia'dan.",
  "SINGED": "Kimyager, Zaun'dan.",
  "SION": "Zombi savaşçı, Noxus'dan.",
  "SIVIR": "Nişancı, Shurima'dan.",
  "SKARNER": "Kristal skorpion, Shurima'dan.",
  "SONA": "Müzik büyücüsü, Demacia'dan.",
  "SORAKA": "Yıldız şifacı, Targon'dan.",
  "SWAIN": "Noxus generali, karga büyücü.",
  "SYLAS": "Büyü hırsızı, Demacia'dan.",
  "SYNDRA": "Karanlık büyücü, Ionia'dan.",
  "TAHM": "Nehir kralı, Bilgewater'dan.",
  "TALIYAH": "Taş büyücüsü, Shurima'dan.",
  "TALON": "Bıçak suikastçı, Noxus'dan.",
  "TARIC": "Koruyucu, Targon'dan.",
  "TEEMO": "Yordle izci, Bandle şehri.",
  "THRESH": "Ruh toplayıcı, gölge adalarından.",
  "TRISTANA": "Yordle topçu, Bandle şehri.",
  "TRUNDLE": "Troll kral, Freljord'dan.",
  "TRYNDAMERE": "Barbar kral, Freljord'dan.",
  "TWISTED": "Fate büyücü, Bilgewater'dan.",
  "TWITCH": "Sıçan nişancı, Zaun'dan.",
  "UDYR": "Ruh yürüyücü, Freljord'dan.",
  "URGOT": "Mekanik savaşçı, Zaun'dan.",
  "VARUS": "Okçu, Ionia'dan.",
  "VAYNE": "Avcı, Demacia'dan.",
  "VEIGAR": "Karanlık büyücü, Bandle şehri.",
  "VELKOZ": "Boşluk göz, Shurima'dan.",
  "VEX": "Yordle gölge büyücü, gölge adalarından.",
  "VI": "Yumruk savaşçı, Piltover'dan.",
  "VIEGO": "Gölge kral, gölge adalarından.",
  "VIKTOR": "Mekanik büyücü, Zaun'dan.",
  "VLADIMIR": "Kan büyücü, Noxus'dan.",
  "VOLIBEAR": "Fırtına ayısı, Freljord tanrısı.",
  "WARWICK": "Kurt adam, Zaun'dan.",
  "WUKONG": "Maymun kral, Ionia'dan.",
  "XAYAH": "Kuş savaşçı, Ionia'dan.",
  "XERATH": "Enerji büyücü, Shurima'dan.",
  "XINZHAO": "Mızrak savaşçı, Demacia'dan.",
  "YASUO": "Rüzgar bıçakçı, Ionia'dan.",
  "YONE": "Ruh bıçakçı, Ionia'dan.",
  "YORICK": "Mezar bekçisi, gölge adalarından.",
  "YUUMI": "Kedi büyücü, Bandle şehri.",
  "ZAC": "Sıvı savaşçı, Zaun'dan.",
  "ZED": "Gölge suikastçı, Ionia'dan.",
  "ZERI": "Elektrik nişancı, Zaun'dan.",
  "ZIGGS": "Yordle bomba, Zaun'dan.",
  "ZILEAN": "Zaman büyücü, Icathia'dan.",
  "ZOE": "Büyü kız, Targon'dan.",
  "ZYRA": "Bitki büyücü, Ixtal'dan."
};

const HINTS_IT = {
  "ACQUA": "Liquido trasparente essenziale per la vita.",
  "AGLIO": "Verdura con bulbo, spesso fa piangere quando tagliato.",
  "AMARO": "Sapore non dolce, opposto di dolce.",
  "AMORE": "Sentimento profondo di affetto.",
  "ARGON": "Gas nobile, elemento chimico.",
  "ASPRO": "Sapore acido, non dolce.",
  "AZOTO": "Elemento chimico, componente dell'aria.",
  "BAGNO": "Stanza dove ci si lava.",
  "BARIO": "Elemento chimico metallico.",
  "BASSO": "Di piccola altezza, opposto di alto.",
  "BELLO": "Di aspetto gradevole, bello.",
  "BOCCA": "Apertura per mangiare e parlare.",
  "BORSA": "Contenitore per portare oggetti.",
  "BROMO": "Elemento chimico, liquido rosso scuro.",
  "BUONO": "Di qualità positiva, buono.",
  "BURRO": "Prodotto caseario fatto dalla panna.",
  "CAFFE": "Bevanda calda fatta dai chicchi.",
  "CALDO": "Alta temperatura, opposto di freddo.",
  "CARNE": "Cibo di origine animale.",
  "CARTA": "Materiale per scrivere o stampare.",
  "CESIO": "Elemento chimico metallico.",
  "CIELO": "Spazio sopra la terra, dove sono le nuvole.",
  "CLORO": "Elemento chimico, gas giallo-verde.",
  "CORPO": "Struttura fisica di una persona.",
  "CORTO": "Di piccola lunghezza, opposto di lungo.",
  "CORVO": "Uccello nero, molto intelligente.",
  "CREMA": "Liquido denso o solido morbido.",
  "CUORE": "Organo che pompa il sangue.",
  "DENTE": "Struttura dura in bocca per masticare.",
  "DIECI": "Il numero 10.",
  "DOLCE": "Sapore zuccherato, opposto di amaro.",
  "FALCO": "Uccello rapace, caccia altri uccelli.",
  "FERRO": "Metallo duro, usato in edilizia.",
  "FIORE": "Parte colorata e bella di una pianta.",
  "FORMA": "La figura o il contorno di qualcosa.",
  "FORSE": "Forse, possibilmente.",
  "FORTE": "Di grande forza, opposto di debole.",
  "FUORI": "All'esterno, opposto di dentro.",
  "GATTO": "Animale domestico, felino.",
  "IODIO": "Elemento chimico, solido viola scuro.",
  "LARGO": "Di grande larghezza, opposto di stretto.",
  "LATTE": "Liquido bianco prodotto dalle mucche.",
  "LENTO": "Di bassa velocità, opposto di veloce.",
  "LEONE": "Grande felino, re della giungla.",
  "LEPRE": "Animale simile al coniglio, molto veloce.",
  "LETTO": "Mobile per dormire.",
  "LIBRO": "Opera stampata con pagine da leggere.",
  "LITIO": "Elemento chimico, metallo leggero.",
  "LUNGO": "Di grande lunghezza, opposto di corto.",
  "MARZO": "Il terzo mese dell'anno.",
  "MELO": "Albero che produce mele.",
  "MONDO": "La terra e tutti i suoi abitanti.",
  "NERVI": "Fibre che trasmettono impulsi nel corpo.",
  "NOTTE": "Il tempo tra il tramonto e l'alba.",
  "PASTA": "Cibo fatto di farina e acqua.",
  "PELLE": "Rivestimento esterno del corpo.",
  "PESCE": "Animale che vive nell'acqua.",
  "PIEDE": "Estremità inferiore della gamba.",
  "POLMONE": "Organo per respirare.",
  "RENE": "Organo che filtra il sangue.",
  "SALE": "Sostanza cristallina bianca.",
  "SANGUE": "Liquido rosso che scorre nel corpo.",
  "SCARPA": "Calzatura per i piedi.",
  "SEDIA": "Mobile per sedersi.",
  "SEMPRE": "In ogni momento, per sempre.",
  "SERIO": "Grave, non scherzoso.",
  "SOLE": "Stella che illumina la terra di giorno.",
  "SPINA": "La colonna vertebrale.",
  "STELLA": "Corpo celeste che brilla nel cielo.",
  "STOMACO": "Organo dove il cibo viene digerito.",
  "TARDI": "In ritardo, opposto di presto.",
  "TAVOLO": "Mobile con superficie piana e gambe.",
  "TERRA": "Il pianeta su cui viviamo.",
  "TESTA": "Parte superiore del corpo.",
  "TRENTA": "Il numero 30.",
  "VENTI": "Il numero 20.",
  "VINO": "Bevanda alcolica fatta dall'uva.",
  "ZERO": "Il numero 0."
};

let lastHintText = "";

function getCurrentHint() {
  if (!solution || solution.length === 0) return "Oyun henüz başlamadı.";
  let s = solution.toUpperCase();
  if (currentLang === "tr") return HINTS_TR[s] || "Bu kelime için ipucu yok.";
  if (currentLang === "en") return HINTS_EN[s] || "No hint for this word.";
  if (currentLang === "de") return HINTS_DE[s] || "Kein Hinweis.";
  if (currentLang === "nl") return HINTS_NL[s] || "Geen hint beschikbaar.";
  if (currentLang === "it") return HINTS_IT[s] || "Nessun indizio.";
  if (currentLang === "lol") return HINTS_LOL[s] || "Bu karakter için ipucu yok.";
  return "Hint not found.";
}

function renderHintUi() {
  const btn = document.getElementById("hint-btn");
  const modal = document.getElementById("hint-modal");
  const hintText = document.getElementById("hint-text");
  const closeBtn = document.getElementById("hint-close-btn");
  
  if (!btn || !modal || !hintText || !closeBtn) return;
  
  // 5. satıra gelmeden önce ipucu pasif
  if (currentRow < 4) {
    btn.disabled = true;
    btn.style.opacity = '0.4';
    btn.title = 'İpucu için 5. satıra gelmeniz gerek!';
  } else {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.title = 'İpucu';
  }
  
  btn.onclick = () => {
    if (btn.disabled) return;
    const hint = getCurrentHint();
    hintText.textContent = hint;
    modal.classList.add("show");
    lastHintText = hint;
  };
  
  closeBtn.onclick = () => {
    modal.classList.remove("show");
  };
  
  // Modal dışına tıklanınca kapat
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.remove("show");
    }
  };
}

// ---- Wordle GAME LOGIC START ---- //

const WORD_LISTS = {
  tr: typeof WORDS_TR !== 'undefined' ? WORDS_TR : [],
  en: typeof WORDS_EN !== 'undefined' ? WORDS_EN : [],
  de: typeof WORDS_DE !== 'undefined' ? WORDS_DE : [],
  nl: typeof WORDS_NL !== 'undefined' ? WORDS_NL : [],
  it: typeof WORDS_IT !== 'undefined' ? WORDS_IT : [],
  lol: typeof WORDS_LOL !== 'undefined' ? WORDS_LOL : [],
};

const BOARD_ROWS = 6;
let BOARD_COLS = 5; // Dinamik: LoL için karakter uzunluğuna göre ayarlanır
let solution = '';
let guesses = [];
let currentRow = 0;
let currentCol = 0;
let currentScore = 0;

// UI Elements
document.addEventListener('DOMContentLoaded', () => {
  initializeLanguage().then(() => {
    setupGame();
    renderModeSelector();
    renderLanguageSelector();
    updateStaticTexts();
    renderBoard();
  }).catch((err) => {
    console.error('Error initializing game:', err);
    // Fallback: use default language
    currentLang = 'en';
    autoDetectedLang = 'en';
    setupGame();
    renderModeSelector();
    renderLanguageSelector();
    updateStaticTexts();
    renderBoard();
  });
});

async function initializeLanguage() {
  autoDetectedLang = await detectCountryLang();
  const manualLang = getPersistedLang();
  currentLang = manualLang || autoDetectedLang || 'en';
}

// Çoklu dil arayüz metinleri
const TRANSLATIONS = {
  tr: {
    title: 'Wordle Klonu',
    selectLang: 'Dil seçiniz:',
    selectLangAuto: 'Otomatik (Konum)',
    selectMode: 'Mod:',
    modeDaily: 'Günlük',
    modeUnlimited: 'Sınırsız',
    congrats: 'Tebrikler!',
    answer: 'Cevap: ',
    validWord: 'Geçerli bir kelime giriniz!',
    missing: 'Eksik harf!',
    wordNotFound: 'Böyle bir kelime bulunmamaktadır.',
    duplicateGuess: 'Bu kelimeyi daha önce denediniz.'
  },
  en: {
    title: 'Wordle Clone',
    selectLang: 'Select language:',
    selectLangAuto: 'Auto (Location)',
    selectMode: 'Mode:',
    modeDaily: 'Daily',
    modeUnlimited: 'Unlimited',
    congrats: 'Congratulations!',
    answer: 'Answer: ',
    validWord: 'Please enter a valid word!',
    missing: 'Missing letter!',
    wordNotFound: 'No such word exists.',
    duplicateGuess: 'You already tried this word.'
  },
  de: {
    title: 'Wordle Klon',
    selectLang: 'Sprache auswählen:',
    selectLangAuto: 'Automatisch (Standort)',
    selectMode: 'Modus:',
    modeDaily: 'Täglich',
    modeUnlimited: 'Unbegrenzt',
    congrats: 'Glückwunsch!',
    answer: 'Antwort: ',
    validWord: 'Bitte ein gültiges Wort eingeben!',
    missing: 'Fehlender Buchstabe!',
    wordNotFound: 'Ein solches Wort existiert nicht.'
  },
  nl: {
    title: 'Wordle Kloon',
    selectLang: 'Taal kiezen:',
    selectLangAuto: 'Automatisch (Locatie)',
    selectMode: 'Modus:',
    modeDaily: 'Dagelijks',
    modeUnlimited: 'Onbeperkt',
    congrats: 'Gefeliciteerd!',
    answer: 'Antwoord: ',
    validWord: 'Voer een geldig woord in!',
    missing: 'Letter ontbreekt!',
    wordNotFound: 'Zo\'n woord bestaat niet.'
  },
  it: {
    title: 'Wordle Clone',
    selectLang: 'Scegli la lingua:',
    selectLangAuto: 'Automatico (Posizione)',
    selectMode: 'Modalità:',
    modeDaily: 'Giornaliero',
    modeUnlimited: 'Illimitato',
    congrats: 'Congratulazioni!',
    answer: 'Risposta: ',
    validWord: 'Inserire una parola valida!',
    missing: 'Lettera mancante!',
    wordNotFound: 'Una parola del genere non esiste.'
  },
  lol: {
    title: 'LoL Champions Wordle',
    selectLang: 'Dil seçiniz:',
    selectLangAuto: 'Otomatik (Konum)',
    selectMode: 'Mod:',
    modeDaily: 'Günlük',
    modeUnlimited: 'Sınırsız',
    congrats: 'Tebrikler!',
    answer: 'Cevap: ',
    validWord: 'Geçerli bir karakter giriniz!',
    missing: 'Eksik harf!',
    wordNotFound: 'Böyle bir karakter bulunmamaktadır.'
  }
};

function updateStaticTexts() {
  // Başlık
  document.querySelector('header h1').textContent = TRANSLATIONS[currentLang].title;
  // Dil seçici label'ı
  const langInfo = document.querySelector('#lang-select-holder span');
  if (langInfo) langInfo.textContent = TRANSLATIONS[currentLang].selectLang;
  // Mod seçici label'ı
  const modeInfo = document.querySelector('#mode-select-holder span');
  if (modeInfo) modeInfo.textContent = TRANSLATIONS[currentLang].selectMode || 'Mod:';
  // Mod seçici seçenekleri
  const modeSelect = document.getElementById('mode-select');
  if (modeSelect) {
    const options = modeSelect.querySelectorAll('option');
    if (options[0]) options[0].textContent = TRANSLATIONS[currentLang].modeDaily || 'Günlük';
    if (options[1]) options[1].textContent = TRANSLATIONS[currentLang].modeUnlimited || 'Sınırsız';
  }
}

function renderModeSelector() {
  const holder = document.getElementById('mode-select-holder');
  if (!holder) return;
  holder.innerHTML = '';
  
  const info = document.createElement('span');
  info.innerText = TRANSLATIONS[currentLang].selectMode || 'Mod:';
  info.style.marginRight = '8px';
  holder.appendChild(info);
  
  const select = document.createElement('select');
  select.id = 'mode-select';
  select.className = 'country-lang-auto';
  
  const dailyOpt = document.createElement('option');
  dailyOpt.value = 'daily';
  dailyOpt.textContent = TRANSLATIONS[currentLang].modeDaily || 'Günlük';
  select.appendChild(dailyOpt);
  
  const unlimitedOpt = document.createElement('option');
  unlimitedOpt.value = 'unlimited';
  unlimitedOpt.textContent = TRANSLATIONS[currentLang].modeUnlimited || 'Sınırsız';
  select.appendChild(unlimitedOpt);
  
  select.value = gameMode;
  select.addEventListener('change', function() {
    gameMode = this.value;
    // Mod değiştiğinde mesajı temizle
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = '';
      messageEl.classList.remove('congrats');
    }
    setupGame();
    updateStaticTexts();
  });
  
  holder.appendChild(select);
}

function renderLanguageSelector() {
  const holder = document.getElementById('lang-select-holder');
  holder.innerHTML = '';
  const info = document.createElement('span');
  info.innerText = TRANSLATIONS[currentLang].selectLang;
  info.style.marginRight = '8px';
  holder.appendChild(info);

  const select = document.createElement('select');
  select.id = 'lang-select';
  select.className = 'country-lang-auto';

  const autoOpt = document.createElement('option');
  autoOpt.value = 'auto';
  updateAutoOptionLabel(autoOpt);
  select.appendChild(autoOpt);

  LANGUAGES.forEach(l => {
    if (WORD_LISTS[l.code] && WORD_LISTS[l.code].length > 0) {
      const opt = document.createElement('option');
      opt.value = l.code;
      opt.textContent = l.label;
      select.appendChild(opt);
    }
  });
  const manualLang = getPersistedLang();
  select.value = manualLang || 'auto';
  select.addEventListener('change', async function () {
    if (this.value === 'auto') {
      clearManualLang();
      if (!autoDetectedLang) {
        autoDetectedLang = await detectCountryLang();
      }
      setLang(autoDetectedLang || 'en', { persist: false, skipSelectorUpdate: true });
      updateAutoOptionLabel(this.querySelector('option[value="auto"]'));
      this.value = 'auto';
      return;
    }
    setLang(this.value);
  });
  holder.appendChild(select);
}

function updateAutoOptionLabel(optionEl) {
  if (!optionEl) return;
  const base = TRANSLATIONS[currentLang].selectLangAuto || 'Auto (Location)';
  const detectedLabel = getLanguageLabel(autoDetectedLang || currentLang);
  optionEl.textContent = `${base}: ${detectedLabel}`;
}

function getLanguageLabel(code) {
  const entry = LANGUAGES.find(l => l.code === code);
  return entry ? entry.label : 'English';
}

function setLang(lang, options = {}) {
  const available = lang in WORD_LISTS && WORD_LISTS[lang].length > 0 ? lang : 'en';
  currentLang = available;
  if (options.persist !== false) {
    persistManualLang(currentLang);
  } else if (options.clearPersist) {
    clearManualLang();
  }
  setupGame();
  if (!options.skipSelectorUpdate) {
    const select = document.getElementById('lang-select');
    if (select) {
      const manualLang = getPersistedLang();
      select.value = manualLang || 'auto';
      updateAutoOptionLabel(select.querySelector('option[value="auto"]'));
    }
  }
  updateStaticTexts();
  renderHintUi();
}

async function detectCountryLang() {
  const geoLang = await detectLangFromGeo();
  if (geoLang) return geoLang;

  const browserLang = getLangFromLocale(navigator.language || navigator.userLanguage);
  if (browserLang) return browserLang;

  return 'en';
}

async function detectLangFromGeo() {
  const services = [
    {
      url: 'https://ipapi.co/json/',
      extract: (data) => data && data.country
    },
    {
      url: 'https://ipwho.is/',
      extract: (data) => data && data.country_code
    }
  ];

  for (const service of services) {
    try {
      const res = await fetch(service.url, { cache: 'no-store' });
      if (!res.ok) continue;
      const data = await res.json();
      const code = service.extract(data);
      const lang = mapCountryToLang(code);
      if (lang) return lang;
    } catch (err) {
      console.warn('Geo lookup failed for', service.url, err);
    }
  }
  return null;
}

function mapCountryToLang(code) {
  if (!code) return null;
  const upper = String(code).toUpperCase();
  const lang = COUNTRY_TO_LANG[upper];
  if (lang && WORD_LISTS[lang] && WORD_LISTS[lang].length > 0) return lang;
  return null;
}

function getLangFromLocale(locale) {
  if (!locale || typeof locale !== 'string') return null;
  const normalized = locale.split('-')[0].toLowerCase();
  const supported = LANGUAGES.map(l => l.code);
  return supported.includes(normalized) ? normalized : null;
}

function persistManualLang(lang) {
  try {
    localStorage.setItem(MANUAL_LANG_KEY, lang);
  } catch (err) {
    console.warn('Language persistence failed', err);
  }
}

function getPersistedLang() {
  try {
    const stored = localStorage.getItem(MANUAL_LANG_KEY);
    if (stored && WORD_LISTS[stored] && WORD_LISTS[stored].length > 0) {
      return stored;
    }
  } catch (err) {
    console.warn('Language retrieval failed', err);
  }
  return null;
}

function clearManualLang() {
  try {
    localStorage.removeItem(MANUAL_LANG_KEY);
  } catch (err) {
    console.warn('Language clearing failed', err);
  }
}

function setupGame() {
  const langWords = WORD_LISTS[currentLang] && WORD_LISTS[currentLang].length > 0
    ? WORD_LISTS[currentLang]
    : WORD_LISTS['en'];
  
  // Mod kontrolü: günlük veya sınırsız
  if (gameMode === 'unlimited') {
    solution = pickRandomWord(langWords);
  } else {
    solution = pickDailyWord(langWords);
  }
  
  // LoL için dinamik uzunluk: karakter isminin uzunluğu
  if (currentLang === 'lol' && solution) {
    BOARD_COLS = solution.length;
  } else {
    BOARD_COLS = 5; // Diğer diller için 5 harf
  }
  
  guesses = Array(BOARD_ROWS).fill('').map(() => '');
  currentRow = 0;
  currentCol = 0;
  allowInput = true;
  // Günlük modunda, hesaplı kullanıcı günde yalnızca 1 kez oynayabilsin
  if (gameMode === 'daily' && typeof canCurrentUserPlayDaily === 'function') {
    if (!canCurrentUserPlayDaily()) {
      allowInput = false;
      showMessage('Bugünkü günlük oyunu zaten oynadınız.');
    } else {
      // Eğer oynayabiliyorsa mesajı temizle
      const messageEl = document.getElementById('message');
      if (messageEl && messageEl.textContent === 'Bugünkü günlük oyunu zaten oynadınız.') {
        messageEl.textContent = '';
      }
    }
  } else if (gameMode === 'unlimited') {
    // Sınırsız moda geçildiğinde mesajı temizle
    const messageEl = document.getElementById('message');
    if (messageEl && messageEl.textContent === 'Bugünkü günlük oyunu zaten oynadınız.') {
      messageEl.textContent = '';
      messageEl.classList.remove('congrats');
    }
    allowInput = true; // Sınırsız modda her zaman oynanabilir
  }
  renderBoard();
  renderKeyboard();
  renderHintUi();
  currentScore = 0; // setupGame başında skoru sıfırla
  updateScoreDisplay();
  // ileride: klavye ve diğer etkileşimleri de başlat
}

function pickDailyWord(wordArray) {
  // Günü hashleyip sabit kelime döner (Wordle benzeri)
  const now = new Date();
  const epoch = new Date('2022-01-01');
  const dayNum = Math.floor((now - epoch) / (1000 * 60 * 60 * 24));
  return wordArray[dayNum % wordArray.length] || wordArray[0];
}

function pickRandomWord(wordArray) {
  // Rastgele kelime seç (sınırsız mod için)
  if (!wordArray || wordArray.length === 0) return '';
  const randomIndex = Math.floor(Math.random() * wordArray.length);
  return wordArray[randomIndex];
}

// Puan hesaplama kuralları
function getScoreFromAttempt(attempt) {
  // sınırsız mod: 1. satır 6, 2. satır 5, ... 6. satır 1 puan
  if (gameMode === 'unlimited') {
    const scoresUnlimited = [6, 5, 4, 3, 2, 1];
    return scoresUnlimited[attempt] || 0;
  }
  // günlük mod: daha yüksek puan
  const scoresDaily = [100, 90, 80, 70, 60, 50];
  return scoresDaily[attempt] || 0;
}

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
];

let boardTiles = [];
let allowInput = true;

function renderBoard() {
  const container = document.getElementById('game-container');
  if (!container) return;

  const existingRows = container.getElementsByClassName('row');
  const needsRebuild =
    existingRows.length !== BOARD_ROWS ||
    (existingRows[0] && existingRows[0].children.length !== BOARD_COLS);

  if (needsRebuild) {
    container.innerHTML = '';
    for (let r = 0; r < BOARD_ROWS; r++) {
      const row = document.createElement('div');
      row.className = 'row';
      for (let c = 0; c < BOARD_COLS; c++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        row.appendChild(tile);
      }
      container.appendChild(row);
    }
  }

  const rows = container.getElementsByClassName('row');
  for (let r = 0; r < BOARD_ROWS; r++) {
    const guess = guesses[r] || '';
    const tiles = rows[r] ? rows[r].children : [];
    for (let c = 0; c < tiles.length; c++) {
      const tile = tiles[c];
      if (!tile) continue;
      if (r < currentRow) {
        // Önceki satırlar sonucu zaten boyandı, dokunma
        continue;
      }
      if (r === currentRow) {
        tile.className = 'tile';
        tile.textContent = guess[c] || '';
      } else {
        tile.className = 'tile';
        tile.textContent = '';
      }
    }
  }
}

function renderKeyboard() {
  const kb = document.getElementById('keyboard');
  kb.innerHTML = '';
  KEYBOARD_LAYOUT.forEach(row => {
    const kbRow = document.createElement('div');
    kbRow.className = 'kb-row';
    row.forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'kb-key';
      btn.textContent = key;
      btn.setAttribute('data-key', key);
      btn.onclick = () => onKeyPress(key);
      kbRow.appendChild(btn);
    });
    kb.appendChild(kbRow);
  });
}

function onKeyPress(key) {
  if (!allowInput) return;
  if (key === 'ENTER') {
    submitGuess();
  } else if (key === 'BACK') {
    if (guesses[currentRow] && guesses[currentRow].length > 0)
      guesses[currentRow] = guesses[currentRow].slice(0, -1);
  } else if (/^[A-ZÇĞİÖŞÜ]$/.test(key)) {
    if (!guesses[currentRow]) guesses[currentRow] = '';
    if (guesses[currentRow].length < BOARD_COLS) {
      guesses[currentRow] += key;
    }
  }
  renderBoard();
}

function submitGuess() {
  if (guesses[currentRow].length !== BOARD_COLS) {
    showMessage('missing');
    return;
  }
  const guess = guesses[currentRow];
  // Aynı kelimeyi birden fazla satırda tekrar etmeyi engelle
  const previousGuesses = guesses.slice(0, currentRow);
  if (previousGuesses.includes(guess)) {
    const duplicateMsg = TRANSLATIONS[currentLang].duplicateGuess || 'Bu kelimeyi daha önce denediniz.';
    showErrorNotification(duplicateMsg);
    return;
  }
  let valid = false;
  if (currentLang === 'tr') {
    const trList = WORD_LISTS['tr'] || [];
    const allowedTr = typeof ALLOWED_WORDS_TR !== 'undefined' ? ALLOWED_WORDS_TR : [];
    valid = trList.includes(guess) || allowedTr.includes(guess);
  } else if (currentLang === 'en') {
    const enList = WORD_LISTS['en'] || [];
    const allowedEn = typeof ALLOWED_WORDS_EN !== 'undefined' ? ALLOWED_WORDS_EN : [];
    valid = enList.includes(guess) || allowedEn.includes(guess);
  } else if (currentLang === 'it') {
    const itList = WORD_LISTS['it'] || [];
    const allowedIt = typeof ALLOWED_WORDS_IT !== 'undefined' ? ALLOWED_WORDS_IT : [];
    valid = itList.includes(guess) || allowedIt.includes(guess);
  } else if (currentLang === 'lol') {
    const lolList = WORD_LISTS['lol'] || [];
    const allowedLol = typeof ALLOWED_WORDS_LOL !== 'undefined' ? ALLOWED_WORDS_LOL : [];
    valid = lolList.includes(guess) || allowedLol.includes(guess);
  } else {
    const list = WORD_LISTS[currentLang] && WORD_LISTS[currentLang].length > 0 
      ? WORD_LISTS[currentLang] : WORD_LISTS['en'];
    valid = list.includes(guess);
  }
  if (!valid) {
    const errorMsg = TRANSLATIONS[currentLang].wordNotFound || 'Böyle bir kelime bulunmamaktadır.';
    showErrorNotification(errorMsg);
    return;
  }
  const sol = solution;
  let feedback = Array(BOARD_COLS).fill('absent');
  let solArr = sol.split('');
  let guessArr = guess.split('');
  for (let i = 0; i < BOARD_COLS; ++i) {
    if (guessArr[i] === solArr[i]) {
      feedback[i] = 'correct';
      solArr[i] = null;
    }
  }
  for (let i = 0; i < BOARD_COLS; ++i) {
    if (feedback[i] === 'correct') continue;
    const idx = solArr.indexOf(guessArr[i]);
    if (idx !== -1) {
      feedback[i] = 'present';
      solArr[idx] = null;
    }
  }
  renderGuessRow(currentRow, guess, feedback);
  updateKeyboardColors(guess, feedback);
  if (guess === solution) {
    // Puanı satıra göre hesapla ve sakla/localStorage'da kaydet
    let score = getScoreFromAttempt(currentRow);
    currentScore = score;
    updateScoreDisplay();
    // Günlük modda, hesabı o gün için kilitle
    if (gameMode === 'daily' && typeof markCurrentUserDailyPlayed === 'function') {
      markCurrentUserDailyPlayed();
    }
    // Hesap açıksa, toplam puana ekle
    if (typeof addScoreToCurrentUser === 'function') {
      addScoreToCurrentUser(score);
    }
    if (gameMode === 'daily') {
      // Sadece günlük için localStorage'a kaydet
      const key = `daily_score_${currentLang}_${new Date().toISOString().slice(0,10)}`;
      localStorage.setItem(key, score);
    }
    // Tebrikler modalı puan ile gösterilecek
    setTimeout(() => {
      showCongratsModal(score);
      if (gameMode === 'unlimited') {
        setTimeout(() => {
          setupGame();
        }, 2000);
      } else {
        allowInput = false;
      }
    }, 600);
    if (gameMode === 'daily') allowInput = false;
    return;
  }
  if (currentRow >= BOARD_ROWS - 1) {
    showMessage(TRANSLATIONS[currentLang].answer + solution);
    // Günlük modda, hakkı biten kullanıcı için de o günü kilitle
    if (gameMode === 'daily' && typeof markCurrentUserDailyPlayed === 'function') {
      markCurrentUserDailyPlayed();
    }
    allowInput = false;
    return;
  }
  currentRow++;
  renderHintUi();
}

function renderGuessRow(rowIdx, guess, feedback) {
  const rows = document.getElementsByClassName('row');
  if (rows[rowIdx]) {
    [...rows[rowIdx].children].forEach((tile, i) => {
      tile.textContent = guess[i] || '';
      if (feedback) tile.className = 'tile ' + feedback[i];
    });
  }
}

function updateKeyboardColors(guess, feedback) {
  // Her guess için feedback'e göre klavye tuşunun arka planını ayarla
  guess.split('').forEach((char, i) => {
    document.querySelectorAll('.kb-key').forEach(btn => {
      if (btn.textContent === char) {
        btn.classList.remove('correct', 'present', 'absent');
        btn.classList.add(feedback[i]);
      }
    });
  });
}

function showMessage(msgKey) {
  // Tüm temel uyarılarda anahtar string veya harici mesaj
  let msg = msgKey;
  if (TRANSLATIONS[currentLang][msgKey]) msg = TRANSLATIONS[currentLang][msgKey];
  const messageEl = document.getElementById('message');
  messageEl.textContent = msg;
  if (msgKey === 'congrats') {
    messageEl.classList.add('congrats');
  } else {
    messageEl.classList.remove('congrats');
  }
}

function showErrorNotification(message) {
  const notification = document.getElementById('error-notification');
  if (!notification) return;
  notification.textContent = message;
  notification.classList.add('show');
  // 3 saniye sonra otomatik kapat
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

function showCongratsModal(score) {
  const modal = document.getElementById('congrats-modal');
  const textEl = document.getElementById('congrats-text');
  if (!modal || !textEl) return;
  
  const congratsText = TRANSLATIONS[currentLang].congrats || 'Tebrikler!';
  textEl.textContent = `🎉 ${congratsText}\nPuan: ${score || currentScore}`;
  modal.classList.add('show');
  
  // 2 saniye sonra otomatik kapat
  setTimeout(() => {
    modal.classList.remove('show');
  }, 2000);
}

// İpucu butonu renderında, 5. satırından önce buton disabled veya kapalı
function renderHintUi() {
  const btn = document.getElementById("hint-btn");
  const modal = document.getElementById("hint-modal");
  const hintText = document.getElementById("hint-text");
  const closeBtn = document.getElementById("hint-close-btn");
  if (!btn || !modal || !hintText || !closeBtn) return;
  // 5. satıra gelmeden önce ipucu pasif
  if (currentRow < 4) {
    btn.disabled = true;
    btn.style.opacity = '0.4';
    btn.title = 'İpucu için 5. satıra gelmeniz gerek!';
  } else {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.title = 'İpucu';
  }
  btn.onclick = () => {
    if (btn.disabled) return;
    const hint = getCurrentHint();
    hintText.textContent = hint;
    modal.classList.add("show");
    lastHintText = hint;
  };
  closeBtn.onclick = () => {
    modal.classList.remove("show");
  };
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('show');
  };
}

function updateScoreDisplay() {
  let scoreEl = document.getElementById('score-box');
  if (scoreEl) scoreEl.textContent = 'Puan: ' + currentScore;
}

// Türkçe karakterleri büyük harfe çevir
function toUpperTurkish(str) {
  const turkishMap = {
    'ç': 'Ç', 'ğ': 'Ğ', 'ı': 'I', 'i': 'İ', 'ö': 'Ö', 'ş': 'Ş', 'ü': 'Ü',
    'Ç': 'Ç', 'Ğ': 'Ğ', 'I': 'I', 'İ': 'İ', 'Ö': 'Ö', 'Ş': 'Ş', 'Ü': 'Ü'
  };
  return str.split('').map(char => turkishMap[char] || char.toUpperCase()).join('');
}

document.addEventListener('keydown', (e) => {
  if (!allowInput) return;
  
  // Özel tuşları kontrol et
  if (e.key === 'Backspace') {
    onKeyPress('BACK');
    e.preventDefault();
    return;
  }
  if (e.key === 'Enter') {
    onKeyPress('ENTER');
    e.preventDefault();
    return;
  }
  
  // Harf tuşlarını işle
  if (e.key.length === 1) {
    let key = toUpperTurkish(e.key);
    // Sadece harf karakterlerini kabul et (Türkçe dahil)
    if (/^[A-ZÇĞİÖŞÜ]$/.test(key)) {
      onKeyPress(key);
      e.preventDefault();
    }
  }
});

// Oyun kurulumu, board, input, kelime seçme, vs. buraya eklenecek.
