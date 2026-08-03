// Valuables — key story items from Grandia II (canon names & acquisition).
// These are the "key items" equivalents: shown in a dedicated menu screen.

export const VALUABLES = [
  { id: 'roans_medal', label: "Roan's Medal", acquiredWhere: 'Durham Cave Depths (after Durham Minotaur)', description: 'Семейная реликвия Роана — причина, по которой он полез в пещеру.' },
  { id: 'mist_egg_keepsake', label: 'Mist Egg (Keepsake)', acquiredWhere: 'Durham Cave', description: 'Воздушное яйцо маны — память о первом большом испытании.' },
  { id: 'adventure_book', label: 'Adventure Book', acquiredWhere: 'Durham Minotaur battle spoils', description: 'Книга приключений, оставленная искателем сокровищ.' },
  { id: 'book_of_sages', label: 'Book of Sages', acquiredWhere: 'Birthplace of the Gods', description: 'Мудрая книга, в которой собраны древние знания.' },
  { id: 'calming_harp', label: 'Calming Harp', acquiredWhere: 'Durham Cave', description: 'Арфа, успокаивающая разум и снимающая смятение.' },
  { id: 'tortes_reedpipe', label: "Torte's Reedpipe", acquiredWhere: 'Durham Cave', description: 'Дудочка, способная разбудить даже самого крепкого соню.' },
  { id: 'goddess_ring', label: "Goddess' Ring (keepsake)", acquiredWhere: 'St. Heim / cathedral quests', description: 'Символ веры, который носила Елена.' },
  { id: 'zera_scrap', label: 'Zera\'s Ledger Note', acquiredWhere: 'Zera\'s Room (late)', description: 'Обрывок записи стюарда о том, что правда не в книгах.' },
  { id: 'fallen_knight_medallion', label: 'Fallen Knight Medallion', acquiredWhere: 'Garmia Tower Top', description: 'Медальон рыцаря, погибшего у разбитого окна башни.' },
  { id: 'moon_sentinel_note', label: "Moon Sentinel's Note", acquiredWhere: "Valmar's Womb", description: '«Я охранял не вход. Я охранял выход».' },
  { id: 'engineers_diary', label: "Engineer's Diary", acquiredWhere: 'Underground Control Room', description: 'Дневник инженера о том, как машина начала говорить.' },
  { id: 'skye_feather', label: "Skye's Feather", acquiredWhere: 'Garlan / party keepsakes', description: 'Перо Ская — знак того, что путь продолжается.' },
  { id: 'true_granasaber_keepsake', label: 'True Granasaber (Keepsake)', acquiredWhere: 'Birthplace of the Gods / Inner Trial', description: 'Истинный Гранасабер — выбор человека, а не богов.' },
];

export function valuablesList() {
  return [...VALUABLES];
}
