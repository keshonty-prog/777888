/** Local-first content. The operating system reads the short stories aloud. */
export type AnimalId = 'frog' | 'duck' | 'grasshopper' | 'bee';
export type GroupId = 'amphibians' | 'birds' | 'meadow';
export type SectionId = 'animals' | 'insects';

export type NatureGroup = {
  id: GroupId;
  section: SectionId;
  title: string;
  subtitle: string;
  narration: string;
  animalIds: AnimalId[];
  color: string;
};

export const GROUPS: NatureGroup[] = [
  {
    id: 'amphibians',
    section: 'animals',
    title: 'Земноводные',
    subtitle: 'У воды и на суше',
    narration:
      'Это земноводные. Они могут жить в воде и на суше. У нашего пруда живёт зелёная лягушка. Она хорошо прыгает и ловит насекомых. Вечером лягушки квакают. Давай посмотрим, где спряталась лягушка, и послушаем её голос!',
    animalIds: ['frog'],
    color: '#DCECC5',
  },
  {
    id: 'birds',
    section: 'animals',
    title: 'Птицы',
    subtitle: 'Перья, крылья и клюв',
    narration:
      'Это птицы. У них есть перья, крылья и клюв. Многие птицы умеют летать. А наша уточка ещё и отлично плавает! Она живёт у пруда и ищет корм в воде. Давай найдём уточку и послушаем, как она крякает!',
    animalIds: ['duck'],
    color: '#FFE5B3',
  },
  {
    id: 'meadow',
    section: 'insects',
    title: 'На лугу',
    subtitle: 'Маленькие соседи',
    narration:
      'В траве и среди цветов живут насекомые. У каждого насекомого шесть ножек. Пчела летает от цветка к цветку и собирает нектар. Кузнечик прячется в траве и стрекочет. Давай поищем этих маленьких соседей и послушаем их звуки!',
    animalIds: ['grasshopper', 'bee'],
    color: '#F3E2FA',
  },
];

export type NatureAnimal = {
  id: AnimalId;
  name: string;
  description: string;
  action: string;
  color: string;
  sound: number;
};

export const ANIMALS: Record<AnimalId, NatureAnimal> = {
  frog: {
    id: 'frog',
    name: 'Лягушка',
    description: 'Прыгает по берегу и квакает у воды.',
    action: 'Ква-ква!',
    color: '#DCECC5',
    sound: require('../assets/audio/frog.wav'),
  },
  duck: {
    id: 'duck',
    name: 'Уточка',
    description: 'Плавает по пруду и крякает.',
    action: 'Кря-кря!',
    color: '#FFE5B3',
    sound: require('../assets/audio/duck.wav'),
  },
  grasshopper: {
    id: 'grasshopper',
    name: 'Кузнечик',
    description: 'Прячется в траве и стрекочет.',
    action: 'Тр-р-р!',
    color: '#DBEBB8',
    sound: require('../assets/audio/grasshopper.wav'),
  },
  bee: {
    id: 'bee',
    name: 'Пчела',
    description: 'Жужжит и собирает нектар с цветов.',
    action: 'Ж-ж-ж!',
    color: '#FFE8A9',
    sound: require('../assets/audio/bee.wav'),
  },
};

export const AMBIENCE: number = require('../assets/audio/pond.wav');
