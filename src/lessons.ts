export type Kind = 'tutorial' | 'share' | 'predict' | 'group' | 'special' | 'remainder' | 'train' | 'delivery';
export type World = 'picnic' | 'station' | 'delivery';
export type Food = 'carrot' | 'apple';
export interface Lesson { id: string; kind: Kind; total: number; divisor: number; title: string; instruction: string; hint: string; food: Food; animals: ('rabbit' | 'bear' | 'fox')[]; mixed?: boolean }
const make = (id: string, kind: Kind, total: number, divisor: number, food: Food = 'carrot'): Lesson => ({
  id, kind, total, divisor, food,
  title: kind === 'tutorial' ? 'Хамтдаа хуваая' : kind === 'predict' ? 'Эхлээд бодоод, дараа нь шалгая' : kind === 'group' ? 'Сагсанд бүлэглэе' : kind === 'special' || kind === 'remainder' ? 'Үлдэгдлийг нээе' : 'Өөрөө хуваая',
  instruction: kind === 'group' ? `${total} алимыг сагс бүрд ${divisor}-оор хийе. Хэдэн сагс болох вэ?` : `${total} ${food === 'carrot' ? 'лууванг' : 'алимыг'} ${divisor} ${kind === 'special' ? 'туулайд' : 'найздаа'} тэнцүү хувааж өгье.`,
  hint: kind === 'group' ? `Нэг сагсанд ${divisor} алим хийгээд дараагийн сагс руу ороорой.` : 'Нэг нэгээр нь өгөөд үзье. Таваг бүрийг тоолоорой.',
  animals: kind === 'special' || id === 'share-0' ? ['rabbit', 'rabbit'] : ['rabbit', 'bear', 'fox'].slice(0, divisor) as Lesson['animals'],
});
export const lessons: Lesson[] = [
  make('together-4-2', 'tutorial', 4, 2),
  ...[[6,2],[8,2],[6,3],[9,3],[12,3],[4,2],[10,2],[12,2],[3,3],[12,3]].map(([n,d],i) => make(`share-${i}`, 'share', n,d,i%2 ? 'apple':'carrot')),
  ...[[6,2],[9,3],[12,3],[7,2],[10,3]].map(([n,d],i) => ({...make(`delivery-${i}`,'delivery',n,d,'apple'),title:'Ойн хүргэлт',instruction:`${n} алимыг ${d} байшинд тэнцүү хүргэж өгье. Байшин бүр хэдэн алим авах вэ?`,hint:'Байшин бүрд нэг нэгээр нь хүргээд үзье. Үлдсэн алим агуулахад байна.'})),
  ...[[6,2],[9,3],[7,2],[8,3],[12,3]].map(([n,d],i) => ({...make(`train-${i}`,'train',n,d),title:'Амьтдын аяллын галт тэрэг',instruction:`${n} амьтныг вагон бүрд ${d}-аар суулгая. Хэдэн вагон дүүрэх вэ? Хэдэн амьтан үлдэх вэ?`,hint:`Вагон бүрд ${d} суудал бий. Амьтнаа сонгоод хоосон суудал дээр товшоорой. Дутуу вагоны амьтдыг хүлээх талбайд буцааж болно.`})),
  ...[[10,2],[6,2],[12,3],[8,2]].map(([n,d],i) => make(`group-${i}`,'group',n,d,'apple')),
  make('special-7-2','special',7,2),
  ...[[5,2],[8,3],[10,3],[9,3]].map(([n,d],i) => make(`remainder-${i}`,'remainder',n,d)),
  make('predict-8-2','predict',8,2), make('predict-12-3','predict',12,3,'apple'),
  {...make('mixed-delivery','delivery',12,3,'apple'),mixed:true,title:'Ойн хүргэлт',instruction:'12 алимыг 3 байшинд тэнцүү хүргэе. Байшин бүр хэдийг авах вэ?'},
  {...make('mixed-train','train',12,3),mixed:true,title:'Ойн өртөө',instruction:'12 амьтныг вагон бүрд 3-аар суулгая. Хэдэн вагон дүүрэх вэ?'},
];
export const chapters = [
  {title:'Хамтдаа хуваая', subtitle:'Нэг нэгээр нь өгч суръя', kinds:['tutorial'], number:'01'},
  {title:'Өөрөө хуваая', subtitle:'Найзууддаа ижил тоогоор', kinds:['share'], number:'02'},
  {title:'Ойн хүргэлт', subtitle:'Байшин бүрд хэд ногдох вэ?', kinds:['delivery'], number:'03'},
  {title:'Ойн өртөө', subtitle:'Хэдэн бүтэн бүлэг үүсэх вэ?', kinds:['train','group'], number:'04'},
  {title:'Үлдэгдлийг нээе', subtitle:'Үлдсэн зүйл ч учиртай', kinds:['special','remainder'], number:'05'},
  {title:'Холимог давтлага', subtitle:'Хариу юуг тоолж байна вэ?', kinds:['predict'], number:'06'},
];
export const lessonById = (id: string) => lessons.find(l => l.id === id) ?? lessons[0];
export const isGrouping = (l: Lesson) => l.kind === 'group' || l.kind === 'train';
export const worldOf = (l: Lesson):World => l.kind === 'train' ? 'station' : l.kind === 'delivery' ? 'delivery' : 'picnic';
export const zoneCount = (l: Lesson) => l.kind === 'train' ? Math.floor(l.total/l.divisor)+1 : l.kind === 'group' ? Math.ceil(l.total / l.divisor) + 1 : l.divisor;
export const chapterOf = (l:Lesson) => l.mixed?chapters[5]:chapters.find(c=>c.kinds.includes(l.kind))!;
export const inChapter = (l:Lesson,ch:typeof chapters[number]) => chapterOf(l).number===ch.number;
export const placeName = (l:Lesson) => l.kind==='train'?'вагон':l.kind==='delivery'?'байшин':l.kind==='group'?'сагс':'таваг';
export const poolName = (l:Lesson) => l.kind==='train'?'Хүлээх талбай':l.kind==='delivery'?'Агуулах':'Төв тавцан';
export const needsRemainderAnswer = (l:Lesson) => l.kind==='train'||l.kind==='delivery'||l.kind==='remainder';
