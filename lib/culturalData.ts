import type { CulturalData } from "@/types/cultural";

export const CULTURAL_DATA: Record<string, CulturalData> = {
  // Forró do Gonzagão
  "1": {
    eventId: "1",
    story:
      "O Forró do Gonzagão é uma homenagem ao rei do baião, Luiz Gonzaga, que transformou a música nordestina em patrimônio nacional. O evento reúne as melhores bandas de forró pé de serra e eletrônico de Sergipe, celebrando a tradição que atravessa gerações. É o coração pulsante do Forró Caju, onde milhares de pessoas dançam juntas sob as luzes das bandeirolas.",
    artists: [
      {
        name: "Trio Virgulino",
        role: "Sanfoneiro e vocalista",
        bio: "Referência do forró pé de serra sergipano, o Trio Virgulino preserva a sonoridade autêntica do Nordeste há mais de 25 anos. Seus shows são verdadeiras aulas de cultura popular.",
        origin: "Aracaju, SE",
        highlight: "Já se apresentou em mais de 15 países levando o forró brasileiro para o mundo.",
      },
      {
        name: "Mestrinho",
        role: "Sanfoneiro virtuoso",
        bio: "Considerado um dos maiores sanfoneiros da nova geração, Mestrinho começou a tocar aos 7 anos no interior da Paraíba. Seu estilo mescla tradição e inovação.",
        origin: "Sumé, PB",
        highlight: "Vencedor do Prêmio da Música Brasileira na categoria Regional.",
      },
    ],
    venue: {
      name: "Praça Hilton Lopes",
      history:
        "A Praça Hilton Lopes é o principal polo de festas de Aracaju desde os anos 1980. Recebeu esse nome em homenagem ao político e líder comunitário que lutou pela urbanização da região.",
      neighborhood: "Centro",
      yearFounded: 1985,
      culturalNote:
        "Durante o Forró Caju, a praça se transforma no maior arraial a céu aberto de Sergipe, recebendo mais de 50 mil pessoas por noite.",
    },
    funFacts: [
      "Luiz Gonzaga gravou mais de 600 músicas e é chamado de 'Rei do Baião' até hoje.",
      "O forró pé de serra usa apenas três instrumentos: sanfona, zabumba e triângulo.",
      "A palavra 'forró' vem das festas 'for all' promovidas por ingleses no início do século XX.",
    ],
  },

  // Forró Pé de Serra
  "2": {
    eventId: "2",
    story:
      "O Forró Pé de Serra no Mercado Thales Ferraz é um encontro íntimo entre tradição e gastronomia. No coração do centro histórico, o evento celebra a autenticidade do forró raiz enquanto os visitantes degustam comidas típicas sergipanas. É a experiência mais genuína do São João para quem busca conexão com as raízes culturais.",
    artists: [
      {
        name: "Zé Calixto",
        role: "Sanfoneiro tradicional",
        bio: "Aos 68 anos, Zé Calixto é guardião vivo do forró de raiz sergipano. Aprendeu a tocar com seu avô e nunca parou desde então, mantendo viva a tradição dos bailes de São João.",
        origin: "Lagarto, SE",
        highlight: "Já tocou em mais de 500 festas juninas pelo interior de Sergipe.",
      },
      {
        name: "Clemilda",
        role: "Vocalista e compositora",
        bio: "A 'Rainha do Forró Malícia' é uma lenda viva da música nordestina. Suas letras picantes e bem-humoradas são cantadas em todo o Brasil.",
        origin: "Propriá, SE",
        highlight: "Primeira mulher a liderar uma banda de forró em Sergipe nos anos 1970.",
      },
    ],
    venue: {
      name: "Mercado Thales Ferraz",
      history:
        "Inaugurado em 1926, o Mercado Thales Ferraz é o mais tradicional de Aracaju. Por décadas, foi o principal ponto de comércio popular e encontro de pescadores, feirantes e artistas.",
      neighborhood: "Centro Histórico",
      yearFounded: 1926,
      culturalNote:
        "O mercado abriga boxes de comida típica sergipana, como moqueca de aratu, caranguejo e tapioca, funcionando desde as primeiras horas da manhã.",
    },
    funFacts: [
      "O forró pé de serra recebe esse nome porque nasceu nos pés das serras nordestinas, em festas rurais.",
      "A sanfona de 8 baixos, usada no forró tradicional, foi trazida por imigrantes italianos no século XIX.",
      "Em Sergipe, o forró de sanfona é Patrimônio Cultural Imaterial desde 2018.",
    ],
  },

  // Quadrilha Junina Mirim
  "3": {
    eventId: "3",
    story:
      "A Quadrilha Junina Mirim é um espetáculo de encantamento protagonizado por crianças de 4 a 12 anos. O evento no Centro de Criatividade celebra a transmissão cultural entre gerações, com coreografias que contam histórias do interior nordestino. Ambiente acolhedor e acessível para famílias com crianças neurodivergentes.",
    artists: [
      {
        name: "Grupo Arraiá Mirim",
        role: "Quadrilha infantil",
        bio: "Formado por 30 crianças de escolas públicas de Aracaju, o Arraiá Mirim ensaia durante todo o ano para apresentar coreografias que resgatam tradições do São João.",
        origin: "Aracaju, SE",
        highlight: "Campeão estadual de quadrilhas mirins em 2023.",
      },
      {
        name: "Tia Lourdes",
        role: "Marcadora de quadrilha",
        bio: "Há 40 anos, Dona Lourdes ensina os passos tradicionais da quadrilha para crianças sergipanas. Sua voz comandando o 'anarriê' é trilha sonora de gerações.",
        origin: "Socorro, SE",
        highlight: "Formou mais de 2.000 dançarinos de quadrilha ao longo de sua carreira.",
      },
    ],
    venue: {
      name: "Centro de Criatividade",
      history:
        "O Centro de Criatividade de Aracaju foi fundado em 1995 como espaço cultural voltado à formação artística de crianças e jovens. Já recebeu exposições, peças teatrais e oficinas de arte popular.",
      neighborhood: "Coroa do Meio",
      yearFounded: 1995,
      culturalNote:
        "O espaço possui sala sensorial e recursos de acessibilidade, sendo referência em inclusão cultural em Sergipe.",
    },
    funFacts: [
      "A quadrilha junina foi inspirada nas danças de salão francesas do século XVIII, adaptadas pelo povo brasileiro.",
      "Os comandos em 'francês' da quadrilha (anarriê, balancê) são versões abrasileiradas das expressões originais.",
      "Em 2022, o Forró e suas práticas culturais foram reconhecidos como Patrimônio Cultural Imaterial da Humanidade pela UNESCO.",
    ],
  },

  // Quadrilha Tradição Nordestina
  "4": {
    eventId: "4",
    story:
      "A Quadrilha Tradição Nordestina é uma competição emocionante que reúne os melhores grupos do estado. Na histórica Praça Fausto Cardoso, os dançarinos apresentam coreografias elaboradas que mesclam tradição e inovação. Os figurinos luxuosos e as histórias contadas em cada apresentação são verdadeiros espetáculos teatrais.",
    artists: [
      {
        name: "Quadrilha Lumiar",
        role: "Grupo competitivo",
        bio: "Fundada em 1998, a Lumiar é considerada a quadrilha mais premiada de Sergipe. Seus espetáculos abordam temas como a seca, a migração e a resistência do povo nordestino.",
        origin: "Aracaju, SE",
        highlight: "Pentacampeã do Festival Nacional de Quadrilhas Juninas.",
      },
      {
        name: "Mestre Zeca",
        role: "Coreógrafo e diretor",
        bio: "José Carlos, o Mestre Zeca, dedica sua vida à quadrilha junina há 35 anos. Seus trabalhos são reconhecidos pela profundidade narrativa e pela valorização da cultura popular.",
        origin: "Estância, SE",
        highlight: "Criador do conceito de 'quadrilha-espetáculo', que revolucionou as competições estaduais.",
      },
    ],
    venue: {
      name: "Praça Fausto Cardoso",
      history:
        "Localizada no coração do centro histórico de Aracaju, a Praça Fausto Cardoso abriga o Palácio do Governo e é palco de manifestações culturais e cívicas desde o século XIX.",
      neighborhood: "Centro Histórico",
      yearFounded: 1855,
      culturalNote:
        "A praça recebeu esse nome em homenagem a Fausto Cardoso, poeta e político sergipano, herói do movimento abolicionista.",
    },
    funFacts: [
      "Uma quadrilha junina competitiva pode ter mais de 100 integrantes entre dançarinos, músicos e figurantes.",
      "Os vestidos de noivas juninas podem pesar até 15 quilos e levar meses para serem confeccionados.",
      "A competição de quadrilhas em Sergipe começou nos anos 1960 e hoje movimenta milhões de reais.",
    ],
  },

  // Show Elba Ramalho
  "5": {
    eventId: "5",
    story:
      "O show de Elba Ramalho no Palco Principal é o ponto alto do Forró Caju. A cantora paraibana, com mais de 50 anos de carreira, traz um repertório que atravessa gerações. Com intérprete de Libras e audiodescrição, o evento é referência em acessibilidade para grandes shows no Nordeste.",
    artists: [
      {
        name: "Elba Ramalho",
        role: "Cantora e compositora",
        bio: "Nascida em Conceição, no sertão da Paraíba, Elba Ramalho é uma das maiores intérpretes da música brasileira. Sua voz potente e sua presença de palco a tornaram ícone da cultura nordestina.",
        origin: "Conceição, PB",
        highlight: "Mais de 35 álbuns lançados e 15 milhões de discos vendidos.",
      },
      {
        name: "Banda Coletivo",
        role: "Banda de apoio",
        bio: "Formada por músicos sergipanos e pernambucanos, a Banda Coletivo acompanha grandes nomes do forró e MPB. Seu som mistura tradição e modernidade com maestria.",
        origin: "Recife, PE",
        highlight: "Já acompanhou mais de 50 artistas em festivais pelo Brasil.",
      },
    ],
    venue: {
      name: "Palco Principal Orla",
      history:
        "O Palco Principal da Orla de Atalaia foi construído em 2010 para ser o maior espaço de shows ao ar livre de Sergipe. Com capacidade para 30 mil pessoas, recebe os maiores artistas nacionais.",
      neighborhood: "Orla de Atalaia",
      yearFounded: 2010,
      culturalNote:
        "A Orla de Atalaia é o principal cartão-postal de Aracaju, com 6 km de extensão e estrutura completa de lazer e turismo.",
    },
    funFacts: [
      "Elba Ramalho foi a primeira mulher a cantar forró em grandes festivais, nos anos 1970.",
      "A cantora é conhecida como 'A Voz do Nordeste' e já se apresentou em mais de 30 países.",
      "O Forró Caju é um dos maiores festivais juninos do Brasil, com mais de 2 milhões de visitantes por edição.",
    ],
  },

  // Exposição Arte Popular
  "6": {
    eventId: "6",
    story:
      "A Exposição Arte Popular no Museu da Gente Sergipana é uma imersão sensorial na riqueza cultural do Nordeste. Com obras de artesãos de todo o estado, a mostra celebra técnicas ancestrais como a renda irlandesa, a cerâmica de Santana dos Frades e a xilogravura de cordel.",
    artists: [
      {
        name: "Dona Izabel",
        role: "Artesã de renda irlandesa",
        bio: "Aos 78 anos, Dona Izabel mantém viva a tradição da renda irlandesa de Divina Pastora. Suas peças são verdadeiras obras de arte que levam semanas para serem concluídas.",
        origin: "Divina Pastora, SE",
        highlight: "Reconhecida como Mestra da Cultura Popular pelo IPHAN em 2019.",
      },
      {
        name: "José Maurício",
        role: "Ceramista tradicional",
        bio: "Herdeiro de uma família de ceramistas de cinco gerações, José Maurício produz peças que retratam o cotidiano do sertanejo com delicadeza e bom humor.",
        origin: "Santana dos Frades, SE",
        highlight: "Suas peças estão em museus de São Paulo, Rio de Janeiro e Lisboa.",
      },
    ],
    venue: {
      name: "Museu da Gente Sergipana",
      history:
        "Inaugurado em 2011, o Museu da Gente Sergipana é considerado o mais interativo do Brasil. O prédio histórico que o abriga foi uma escola estadual construída em 1926.",
      neighborhood: "Centro",
      yearFounded: 2011,
      culturalNote:
        "O museu utiliza tecnologia de ponta para contar a história de Sergipe de forma acessível e divertida para todas as idades.",
    },
    funFacts: [
      "A renda irlandesa de Divina Pastora é Patrimônio Cultural Imaterial do Brasil desde 2009.",
      "Sergipe é o menor estado do Brasil, mas possui uma das maiores diversidades de artesanato tradicional.",
      "O Museu da Gente já recebeu mais de 2 milhões de visitantes desde sua inauguração.",
    ],
  },

  // Feira Gastronômica Junina
  "7": {
    eventId: "7",
    story:
      "A Feira Gastronômica Junina no Parque da Sementeira é um festival de sabores nordestinos. Das tradicionais canjicas e pamonhas às releituras contemporâneas de chefs locais, o evento celebra a culinária junina em ambiente familiar e ao ar livre.",
    artists: [
      {
        name: "Chef Rivandro França",
        role: "Chef de cozinha regional",
        bio: "Rivandro é o principal embaixador da gastronomia sergipana contemporânea. Seu trabalho valoriza ingredientes locais e técnicas tradicionais com apresentação moderna.",
        origin: "Aracaju, SE",
        highlight: "Seu restaurante foi eleito o melhor de Sergipe por três anos consecutivos.",
      },
      {
        name: "Dona Tereza do Milho",
        role: "Cozinheira tradicional",
        bio: "Há 50 anos, Dona Tereza prepara as melhores pamonhas e canjicas de Aracaju. Seu segredo? 'Amor e milho do bom', diz ela.",
        origin: "Nossa Senhora do Socorro, SE",
        highlight: "Já vendeu mais de 500 mil pamonhas ao longo de sua carreira.",
      },
    ],
    venue: {
      name: "Parque da Sementeira",
      history:
        "O Parque da Sementeira é a maior área verde urbana de Aracaju, com 40 hectares de mata atlântica preservada. Inaugurado em 1994, é o principal espaço de lazer da cidade.",
      neighborhood: "Farolândia",
      yearFounded: 1994,
      culturalNote:
        "O parque abriga trilhas ecológicas, lagos, playgrounds e é habitat de diversas espécies nativas da fauna sergipana.",
    },
    funFacts: [
      "O milho é o ingrediente mais importante das festas juninas, presente em mais de 20 receitas típicas.",
      "A canjica nordestina é diferente da paulista: no Nordeste, é doce e cremosa, feita com milho branco.",
      "O licor de jenipapo, típico de Sergipe, é feito com fruta nativa que os índios já usavam há séculos.",
    ],
  },

  // Repente e Viola
  "8": {
    eventId: "8",
    story:
      "O Repente e Viola no Coreto da Praça Olímpio Campos é poesia viva. Os repentistas improvisam versos sobre qualquer tema sugerido pelo público, demonstrando a tradição oral que atravessa séculos no sertão nordestino. Ambiente calmo e intimista para apreciadores da cultura popular.",
    artists: [
      {
        name: "Zé do Violão",
        role: "Repentista e violeiro",
        bio: "José Antônio, o Zé do Violão, é um dos últimos grandes repentistas de Sergipe. Sua arte de improvisar versos sobre qualquer tema encanta plateias há 45 anos.",
        origin: "Canindé de São Francisco, SE",
        highlight: "Já participou de mais de 100 festivais de repente pelo Nordeste.",
      },
      {
        name: "Mocinha da Passira",
        role: "Emboladora e cantadora",
        bio: "Considerada a maior emboladora viva do Nordeste, Mocinha mantém viva a tradição do coco de embolada com energia e humor incomparáveis.",
        origin: "Passira, PE",
        highlight: "Primeira mulher a vencer o Festival Nacional de Repentistas, em 1995.",
      },
    ],
    venue: {
      name: "Coreto da Praça Olímpio Campos",
      history:
        "O coreto da Praça Olímpio Campos foi construído em 1915 e é um dos marcos arquitetônicos de Aracaju. Por décadas, foi palco de retretas e serenatas.",
      neighborhood: "Centro Histórico",
      yearFounded: 1915,
      culturalNote:
        "A praça abriga a Catedral Metropolitana e é o coração espiritual de Aracaju, com intensa vida cultural durante todo o ano.",
    },
    funFacts: [
      "O repente nordestino é considerado uma das formas mais sofisticadas de poesia improvisada do mundo.",
      "Os repentistas usam dezenas de modalidades de rimas, como sextilha, setilha e décima.",
      "A tradição do repente foi trazida pelos trovadores portugueses e adaptada ao sertão brasileiro.",
    ],
  },
};

export function getCulturalData(eventId: string): CulturalData | null {
  return CULTURAL_DATA[eventId] || null;
}
