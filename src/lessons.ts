export type Kind = 'tutorial' | 'share' | 'predict' | 'group' | 'special' | 'remainder';
export type Food = 'carrot' | 'apple';
export interface Lesson { id: string; kind: Kind; total: number; divisor: number; title: string; instruction: string; hint: string; food: Food; animals: ('rabbit' | 'bear' | 'fox')[] }
const make = (id: string, kind: Kind, total: number, divisor: number, food: Food = 'carrot'): Lesson => ({
  id, kind, total, divisor, food,
  title: kind === 'tutorial' ? 'Хамтдаа хуваая' : kind === 'predict' ? 'Эхлээд бодоод, дараа нь шалгая' : kind === 'group' ? 'Сагсанд бүлэглэе' : kind === 'special' || kind === 'remainder' ? 'Үлдэгдлийг нээе' : 'Өөрөө хуваая',
  instruction: kind === 'group' ? `${total} алимыг сагс бүрд ${divisor}-оор хийе. Хэдэн сагс болох вэ?` : `${total} ${food === 'carrot' ? 'лууванг' : 'алимыг'} ${divisor} ${kind === 'special' ? 'туулайд' : 'найздаа'} тэнцүү хувааж өгье.`,
  hint: kind === 'group' ? `Нэг сагсанд ${divisor} алим хийгээд дараагийн сагс руу ороорой.` : 'Нэг нэгээр нь өгөөд үзье. Таваг бүрийг тоолоорой.',
  animals: kind === 'special' ? ['rabbit', 'rabbit'] : ['rabbit', 'bear', 'fox'].slice(0, divisor) as Lesson['animals'],
});
export const lessons: Lesson[] = [
  make('together-4-2', 'tutorial', 4, 2),
  ...[[6,2],[8,2],[6,3],[9,3],[12,3],[4,2],[10,2],[12,2],[3,3],[12,3]].map(([n,d],i) => make(`share-${i}`, 'share', n,d,i%2 ? 'apple':'carrot')),
  make('predict-8-2','predict',8,2), make('predict-12-3','predict',12,3,'apple'),
  ...[[10,2],[6,2],[12,3],[8,2]].map(([n,d],i) => make(`group-${i}`,'group',n,d,'apple')),
  make('special-7-2','special',7,2),
  ...[[5,2],[8,3],[10,3],[9,3]].map(([n,d],i) => make(`remainder-${i}`,'remainder',n,d)),
];
export const chapters = [
  {title:'Хамтдаа хуваая', subtitle:'Нэг нэгээр нь өгч суръя', kinds:['tutorial'], number:'01'},
  {title:'Өөрөө хуваая', subtitle:'Найзууддаа ижил тоогоор', kinds:['share'], number:'02'},
  {title:'Бодоод, шалгая', subtitle:'Таамгаа өөрөө туршъя', kinds:['predict'], number:'03'},
  {title:'Сагсанд бүлэглэе', subtitle:'Хэдэн сагс дүүрэх бол?', kinds:['group'], number:'04'},
  {title:'Үлдэгдлийг нээе', subtitle:'Үлдсэн зүйл ч учиртай', kinds:['special','remainder'], number:'05'},
];
export const lessonById = (id: string) => lessons.find(l => l.id === id) ?? lessons[0];
export const zoneCount = (l: Lesson) => l.kind === 'group' ? Math.ceil(l.total / l.divisor) + 1 : l.divisor;
