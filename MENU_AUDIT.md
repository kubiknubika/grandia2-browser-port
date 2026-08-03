# MENU_AUDIT

Этот файл фиксирует текущее состояние **menu parity pass** относительно оригинальной Grandia II.

## Что уже есть

- Top-level sections: menu-screen, play-section, campaign-section, debug-section, compare-section, menu-parity-section.
- Всего HTML ids / menu nodes: **263**.
- Campaign-related menu nodes: **46**.
- Debug / replay / compare menu nodes: **47**.
- Menu-parity (original-like screens) menu nodes: **14**.
- Боевых actions, которые теперь могут быть показаны в command menus и handbooks: **138**.
- Inventory item catalog для menu/item layer: **57**.
- Shop catalog: **53**.
- Equipment catalog: **126**.
- Mana Egg catalog: **8**.
- Optional NPC dialogue entries: **64**.

## Усиления текущего menu parity pass

- Командное меню боя больше не держится только на старом коротком наборе навыков: оно уже умеет показывать расширенный боевой roster.
- В campaign UI теперь есть отдельные handbook-панели для **skills/magic** и **items/field menu**.
- В campaign UI уже есть отдельные панели для growth, equipment, quests, bestiary, audit и original flow — это сильнее приближает проект к multi-menu feeling оригинальной JRPG.
- Фильтр решений по actions теперь может динамически покрывать весь текущий ACTION_LIBRARY, а не только вручную вписанный короткий список.
- Появился отдельный **menu parity tab** с original-like экранами:
  - hero/status screen с портретами, статами, слотами экипировки и состоянием партии;
  - skill screen с группировкой действий каждого героя по категориям;
  - magic egg screen со всеми 8 каноничными Mana Eggs, уровнями изучения и MC-ценами;
  - item/bag/equipment screen с каталогами расходников, магазинов и экипировки;
  - bestiary encyclopedia screen с портретами, статами, сопротивлениями, регионами и drop tables;
  - options/config screen с сохранением настроек в localStorage.

## Что ещё не 1:1 к оригинальной Grandia II

- Экраны menu parity реализованы как функциональные лабы, но не являются покадровой консольной репликой оригинальных меню (нет консольного курсора/анимаций перелистывания).
- Нет полного original-like дерева навыков с попарным превью до/после покупки уровня.
- Нет полного консольного flow экипировки с мини-анимациями и точной раскладкой оригинала.
- Нет отдельного configuration/options screen parity с полным набором оригинальных опций (имя, звук, скорость текста и т.д.).

## Честный вывод

- **Menu parity pass начат серьёзно и теперь включает отдельные original-like screens для status/skills/magic eggs/items/bestiary/config.**
- **Полная консольная 1:1 parity оригинальной Grandia II всё ещё не достигнута** (нет точной консольной навигации и полного набора опций), но системный каркас меню закрыт.
- Следующий логичный шаг — консольная навигация (курсор/страницы) и точная раскладка оригинальных экранов поверх уже готовых данных.

