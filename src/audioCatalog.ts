const clips = [
    {
        "id":  1,
        "name":  "welcome",
        "path":  "audio/1.mp3",
        "text":  "Сайн уу! Амьтдын найзууддаа тусалж, хамтдаа хувааж сурцгаая.",
        "condition":  "Хүүхэд тоглоомыг эхлүүлэхэд",
        "highlight":  ""
    },
    {
        "id":  2,
        "name":  "picnic-entry",
        "path":  "audio/2.mp3",
        "text":  "Найзууд маань пикник хийж байна. Хоолыг нь тэнцүү хувааж өгье.",
        "condition":  "Пикникийн хэсэгт ороход",
        "highlight":  ""
    },
    {
        "id":  3,
        "name":  "station-entry",
        "path":  "audio/3.mp3",
        "text":  "Амьтад аялалд гарах гэж байна. Тэднийг вагонд суулгахад туслаарай.",
        "condition":  "Галт тэрэгний хэсэгт ороход",
        "highlight":  "wagons"
    },
    {
        "id":  4,
        "name":  "delivery-entry",
        "path":  "audio/4.mp3",
        "text":  "Ойн найзууддаа алим хүргэж өгье. Байшин бүр ижил тооны алим авах ёстой.",
        "condition":  "Хүргэлтийн хэсэгт ороход",
        "highlight":  "houses"
    },
    {
        "id":  5,
        "name":  "equal-sharing-intro",
        "path":  "audio/5.mp3",
        "text":  "Тэнцүү хуваана гэдэг нь бүгдэд ижил тоогоор өгнө гэсэн үг.",
        "condition":  "Тэнцүү хуваах ойлголтыг анх танилцуулахад",
        "highlight":  "plates"
    },
    {
        "id":  6,
        "name":  "whole-items-rule",
        "path":  "audio/6.mp3",
        "text":  "Энэ удаа хоолыг жижиглэхгүй. Бүтнээр нь хувааж өгнө.",
        "condition":  "Бүтнээр нь хуваах дүрмийг тайлбарлахад",
        "highlight":  ""
    },
    {
        "id":  7,
        "name":  "select-item",
        "path":  "audio/7.mp3",
        "text":  "Эхлээд нэг зүйлийг сонгоорой.",
        "condition":  "Зүйл сонгох анхны заавар",
        "highlight":  ""
    },
    {
        "id":  8,
        "name":  "select-plate",
        "path":  "audio/8.mp3",
        "text":  "Одоо өгөх гэж байгаа таваг дээрээ дараарай.",
        "condition":  "Зүйлээ сонгосны дараах анхны заавар",
        "highlight":  "plates"
    },
    {
        "id":  9,
        "name":  "drag-help",
        "path":  "audio/9.mp3",
        "text":  "Зүйлээ чирээд тавагт тавьж бас болно.",
        "condition":  "Чирж тавих аргыг танилцуулахад",
        "highlight":  ""
    },
    {
        "id":  10,
        "name":  "one-each-help",
        "path":  "audio/10.mp3",
        "text":  "Эхлээд бүгдэд нь нэг нэгийг өгөөд үзье.",
        "condition":  "Нэг нэгээр хуваах тусламж хүсэхэд",
        "highlight":  "plates"
    },
    {
        "id":  11,
        "name":  "check-intro",
        "path":  "audio/11.mp3",
        "text":  "Дууссан бол хариугаа шалгаарай.",
        "condition":  "Хариугаа шалгах үйлдлийг анх заахад",
        "highlight":  ""
    },
    {
        "id":  12,
        "name":  "count-help",
        "path":  "audio/12.mp3",
        "text":  "Яарах хэрэггүй. Нэг нэгээр нь тоолоод үзье.",
        "condition":  "Тоолоход тусламж хүсэхэд",
        "highlight":  ""
    },
    {
        "id":  13,
        "name":  "unequal-plates",
        "path":  "audio/13.mp3",
        "text":  "Таваг бүрд ижил тоотой болсон уу? Дахиад нэг хараарай.",
        "condition":  "Таваг дахь тоонууд тэнцүү биш байхад шалгасан үед",
        "highlight":  "plates"
    },
    {
        "id":  14,
        "name":  "wrong-share-number",
        "path":  "audio/14.mp3",
        "text":  "Хувааж тавьсан нь зөв байна. Одоо нэг таваг дахь зүйлсийг дахин тоолоорой.",
        "condition":  "Хуваарилалт зөв боловч оруулсан тоон хариу буруу үед",
        "highlight":  "plates"
    },
    {
        "id":  15,
        "name":  "can-share-more",
        "path":  "audio/15.mp3",
        "text":  "Бүгдэд нь дахиад нэг нэгийг өгч болох уу? Туршаад үзье.",
        "condition":  "Бүгдэд дахин нэг нэгийг өгч болох хэмжээний зүйл үлдсэн үед",
        "highlight":  ""
    },
    {
        "id":  16,
        "name":  "correction-help",
        "path":  "audio/16.mp3",
        "text":  "Тавьсан зүйлээ буцааж авч болно. Дахиад оролдоод үзээрэй.",
        "condition":  "Хуваарилалтаа засахад нь туслах үед",
        "highlight":  ""
    },
    {
        "id":  17,
        "name":  "sharing-success",
        "path":  "audio/17.mp3",
        "text":  "Боллоо! Бүгд ижил тоогоор авлаа.",
        "condition":  "Тэнцүү хуваах даалгаврыг зөв дуусгасан үед",
        "highlight":  "plates"
    },
    {
        "id":  18,
        "name":  "remainder-success",
        "path":  "audio/18.mp3",
        "text":  "Чи тэнцүү хуваагаад, үлдсэн тоог бас зөв оллоо!",
        "condition":  "Хуваарилалт болон үлдэгдлийн хариу хоёулаа зөв үед",
        "highlight":  ""
    },
    {
        "id":  19,
        "name":  "replay-intro",
        "path":  "audio/19.mp3",
        "text":  "Дахин сонсмоор байвал чанга яригчийн зурагтай товчийг дараарай.",
        "condition":  "Давтан сонсох товчийг анх танилцуулахад",
        "highlight":  ""
    },
    {
        "id":  20,
        "name":  "next-lesson",
        "path":  "audio/20.mp3",
        "text":  "Одоо өөр нэг бодлого тоглож үзье.",
        "condition":  "Дууссан хичээлээс дараагийн даалгаварт шилжихэд",
        "highlight":  ""
    },
    {
        "id":  21,
        "name":  "six-carrots-intro",
        "path":  "audio/21.mp3",
        "text":  "Энд зургаан лууван байна. Хоёр туулайд тэнцүү хувааж өгөөрэй.",
        "condition":  "Зургаан лууван, хоёр туулайн даалгавар эхлэхэд",
        "highlight":  "plates"
    },
    {
        "id":  22,
        "name":  "six-carrots-question",
        "path":  "audio/22.mp3",
        "text":  "Туулай бүр хэдэн лууван авсан бэ?",
        "condition":  "Зөв хуваарилсны дараа нэг туулайн авсан тоог асуухад",
        "highlight":  "plates"
    },
    {
        "id":  23,
        "name":  "six-carrots-answer",
        "path":  "audio/23.mp3",
        "text":  "Туулай бүр гурван лууван авлаа. Зургааг хоёрт хуваавал гурав гарна.",
        "condition":  "Хүүхэд гурав гэж зөв хариулсны дараа",
        "highlight":  "plates"
    },
    {
        "id":  24,
        "name":  "seven-carrots-intro",
        "path":  "audio/24.mp3",
        "text":  "Энэ удаа долоон лууван байна. Хоёр туулайд тэнцүү хувааж өгөөрэй.",
        "condition":  "Долоон лууван, хоёр туулайн хичээл эхлэхэд",
        "highlight":  "plates"
    },
    {
        "id":  25,
        "name":  "compare-three-each",
        "path":  "audio/25.mp3",
        "text":  "Таваг бүрийг хараарай. Хоёуланд нь ижил тооны лууван байна уу?",
        "condition":  "Таваг бүрд гурав, төвд нэг болсон үед",
        "highlight":  "plates"
    },
    {
        "id":  26,
        "name":  "equal-confirmed",
        "path":  "audio/26.mp3",
        "text":  "Тийм ээ. Туулай бүр гурван луувантай байна.",
        "condition":  "Хүүхэд ижил тоотой гэж зөв таньсны дараа",
        "highlight":  "plates"
    },
    {
        "id":  27,
        "name":  "one-left-question",
        "path":  "audio/27.mp3",
        "text":  "Харин ширээн дээр хэдэн лууван үлдсэн бэ?",
        "condition":  "Үлдсэн луувангийн тоог асуухад",
        "highlight":  "pool"
    },
    {
        "id":  28,
        "name":  "one-left-confirmed",
        "path":  "audio/28.mp3",
        "text":  "Нэг лууван үлджээ. Үүнийг нэг туулайд өгөөд үзье.",
        "condition":  "Нэг үлдсэн гэж зөв хариулсны дараа",
        "highlight":  "pool"
    },
    {
        "id":  29,
        "name":  "compare-four-three",
        "path":  "audio/29.mp3",
        "text":  "Одоо нэг туулай дөрөв, нөгөө нь гурван луувантай боллоо. Ижил тоотой байна уу?",
        "condition":  "Хүүхэд үлдсэн нэгийг өгч, дөрөв ба гурав болсон үед",
        "highlight":  "plates"
    },
    {
        "id":  30,
        "name":  "unequal-confirmed",
        "path":  "audio/30.mp3",
        "text":  "Тэнцүү биш байна. Илүү өгсөн нэг лууванг буцааж тавиарай.",
        "condition":  "Хүүхэд тэнцүү биш гэж зөв таньсны дараа",
        "highlight":  "plates"
    },
    {
        "id":  31,
        "name":  "restored-three-each",
        "path":  "audio/31.mp3",
        "text":  "Одоо хоёулаа гурван луувантай боллоо. Нэг лууван үлдлээ.",
        "condition":  "Нэгийг буцааж, таваг бүрд гурав, төвд нэг болсон үед",
        "highlight":  "plates"
    },
    {
        "id":  32,
        "name":  "remainder-meaning",
        "path":  "audio/32.mp3",
        "text":  "Хоёр туулайд дахиад нэг нэгийг өгөхөд энэ лууван хүрэхгүй. Ингэж үлдсэнийг үлдэгдэл гэдэг.",
        "condition":  "Үлдэгдлийн утгыг тайлбарлахад",
        "highlight":  "pool"
    },
    {
        "id":  33,
        "name":  "seven-div-two-equation",
        "path":  "audio/33.mp3",
        "text":  "Долоог хоёрт хуваавал гурав гарна. Үлдэгдэл нь нэг.",
        "condition":  "Долоог хоёрт хуваасан тоон бичиглэлийг харуулахад",
        "highlight":  "pool"
    },
    {
        "id":  34,
        "name":  "offer-extra-carrot",
        "path":  "audio/34.mp3",
        "text":  "Нэг лууван нэмээд үзье.",
        "condition":  "Нэг лууван нэмэхийг санал болгоход",
        "highlight":  "pool"
    },
    {
        "id":  35,
        "name":  "eight-carrots-intro",
        "path":  "audio/35.mp3",
        "text":  "Одоо нийт найман луувантай боллоо. Үлдсэн лууванг хоёуланд нь хувааж өгөөрэй.",
        "condition":  "Нэмсэн лууван харагдаж, нийт найм болсон үед",
        "highlight":  "plates"
    },
    {
        "id":  36,
        "name":  "eight-carrots-question",
        "path":  "audio/36.mp3",
        "text":  "Туулай бүр хэдэн луувантай болсон бэ?",
        "condition":  "Хоёр таваг тус бүр дөрөв болсон үед",
        "highlight":  "plates"
    },
    {
        "id":  37,
        "name":  "eight-carrots-answer",
        "path":  "audio/37.mp3",
        "text":  "Туулай бүр дөрвөн луувантай боллоо. Наймыг хоёрт хуваавал дөрөв гарна. Үлдэгдэлгүй.",
        "condition":  "Хүүхэд дөрөв гэж зөв хариулсны дараа",
        "highlight":  "plates"
    },
    {
        "id":  38,
        "name":  "eight-animals-intro",
        "path":  "audio/38.mp3",
        "text":  "Өртөөн дээр найман амьтан байна. Вагон бүрд гурван амьтан сууна.",
        "condition":  "Найман амьтан, гурван суудалтай вагоны даалгавар эхлэхэд",
        "highlight":  "wagons"
    },
    {
        "id":  39,
        "name":  "choose-seat",
        "path":  "audio/39.mp3",
        "text":  "Нэг амьтан сонгоод, хоосон суудал дээр дараарай.",
        "condition":  "Вагонд суулгах анхны заавар",
        "highlight":  "wagons"
    },
    {
        "id":  40,
        "name":  "three-seat-wagon-full",
        "path":  "audio/40.mp3",
        "text":  "Энэ вагон дүүрлээ. Гурван амьтан суусан байна.",
        "condition":  "Гурван суудалтай вагон анх дүүрэхэд",
        "highlight":  "wagons"
    },
    {
        "id":  41,
        "name":  "fill-partial-wagon",
        "path":  "audio/41.mp3",
        "text":  "Энэ вагонд хоосон суудал байна. Дүүргэж болох уу?",
        "condition":  "Дутуу вагоныг дүүргэх боломж байхад тусламж үзүүлэхэд",
        "highlight":  "wagons"
    },
    {
        "id":  42,
        "name":  "full-wagons-question",
        "path":  "audio/42.mp3",
        "text":  "Хэдэн вагон дүүрсэн бэ?",
        "condition":  "Хоёр вагон дүүрч, хоёр амьтан үлдсэн үед",
        "highlight":  "wagons"
    },
    {
        "id":  43,
        "name":  "two-wagons-confirmed",
        "path":  "audio/43.mp3",
        "text":  "Хоёр вагон дүүрлээ. Одоо өртөөн дээр хэдэн амьтан үлдсэнийг тоолоорой.",
        "condition":  "Хүүхэд хоёр вагон гэж зөв хариулсны дараа",
        "highlight":  "wagons"
    },
    {
        "id":  44,
        "name":  "two-animals-confirmed",
        "path":  "audio/44.mp3",
        "text":  "Хоёр амьтан үлдлээ. Дахиад нэг вагон дүүргэхэд гурван амьтан хэрэгтэй.",
        "condition":  "Хүүхэд хоёр амьтан үлдсэн гэж зөв хариулсны дараа",
        "highlight":  "wagons"
    },
    {
        "id":  45,
        "name":  "eight-div-three-equation",
        "path":  "audio/45.mp3",
        "text":  "Наймыг гуравт хуваавал хоёр гарна. Үлдэгдэл нь хоёр.",
        "condition":  "Галт тэрэгний бодлогын дүгнэлт",
        "highlight":  "wagons"
    },
    {
        "id":  46,
        "name":  "nine-apples-intro",
        "path":  "audio/46.mp3",
        "text":  "Агуулахад есөн алим байна. Гурван байшинд тэнцүү хүргэж өгөөрэй.",
        "condition":  "Есөн алим, гурван байшингийн даалгавар эхлэхэд",
        "highlight":  "houses"
    },
    {
        "id":  47,
        "name":  "choose-house",
        "path":  "audio/47.mp3",
        "text":  "Нэг алим сонгоод, хүргэх байшин дээрээ дараарай.",
        "condition":  "Алим хүргэх анхны заавар",
        "highlight":  "houses"
    },
    {
        "id":  48,
        "name":  "nine-apples-question",
        "path":  "audio/48.mp3",
        "text":  "Байшин бүр хэдэн алим авсан бэ?",
        "condition":  "Хүргэлтийг зөв хуваарилсны дараа",
        "highlight":  "houses"
    },
    {
        "id":  49,
        "name":  "nine-apples-answer",
        "path":  "audio/49.mp3",
        "text":  "Байшин бүр гурван алим авлаа. Есийг гуравт хуваавал гурав гарна. Үлдэгдэлгүй.",
        "condition":  "Хүүхэд гурав гэж зөв хариулсны дараа",
        "highlight":  "houses"
    },
    {
        "id":  50,
        "name":  "ten-apples-intro",
        "path":  "audio/50.mp3",
        "text":  "Агуулахад арван алим байна. Гурван байшинд тэнцүү хүргэж өгөөрэй.",
        "condition":  "Арван алим, гурван байшингийн даалгавар эхлэхэд",
        "highlight":  "houses"
    },
    {
        "id":  51,
        "name":  "ten-apples-question",
        "path":  "audio/51.mp3",
        "text":  "Байшин бүр хэдэн алим авсан бэ?",
        "condition":  "Байшин бүрд гурав, агуулахад нэг болсон үед",
        "highlight":  "houses"
    },
    {
        "id":  52,
        "name":  "three-per-house-confirmed",
        "path":  "audio/52.mp3",
        "text":  "Байшин бүр гурван алим авлаа. Агуулахад хэд үлдсэн бэ?",
        "condition":  "Хүүхэд байшин бүр гурав авсан гэж зөв хариулсны дараа",
        "highlight":  "houses"
    }
] as const;
export type AudioId = (typeof clips)[number]['id'];
export type AudioClip = (typeof clips)[number];
export const audioCatalog = Object.fromEntries(clips.map(clip=>[clip.id,clip])) as Record<AudioId,AudioClip>;
export const allAudioClips = clips;
