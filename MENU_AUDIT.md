# MENU_AUDIT

Этот файл фиксирует текущее состояние **menu parity pass** относительно оригинальной Grandia II.

## Что уже есть

- Top-level sections: menu-screen, play-section, campaign-section, debug-section, compare-section.
- Всего HTML ids / menu nodes: **246**.
- Campaign-related menu nodes: **46**.
- Debug / replay / compare menu nodes: **47**.
- Боевых actions, которые теперь могут быть показаны в command menus и handbooks: **85**.
- Inventory item catalog для menu/item layer: **12**.

## Усиления текущего menu parity pass

- Командное меню боя больше не держится только на старом коротком наборе навыков: оно уже умеет показывать расширенный боевой roster.
- В campaign UI теперь есть отдельные handbook-панели для **skills/magic** и **items/field menu**.
- В campaign UI уже есть отдельные панели для growth, equipment, quests, bestiary, audit и original flow — это сильнее приближает проект к multi-menu feeling оригинальной JRPG.
- Фильтр решений по actions теперь может динамически покрывать весь текущий ACTION_LIBRARY, а не только вручную вписанный короткий список.

## Что ещё не 1:1 к оригинальной Grandia II

- Нет полного отдельного skill-screen с развёрнутой древовидной/листовой навигацией по каждому герою.
- Нет полного original-like magic egg screen.
- Нет полного item/bag/equipment menu flow в стиле оригинальной консольной игры.
- Нет отдельного bestiary screen с иллюстрациями, drop table и region sorting как полноценного encyclopedia UI.
- Нет отдельного configuration/options/status screen parity на уровне всей игры.

## Честный вывод

- **Menu parity pass начат серьёзно и уже заметно усилил UI-структуру проекта.**
- **Но полный menu parity оригинальной Grandia II ещё не достигнут.**
- Следующий логичный шаг — делать отдельные original-like screens для skills/magic/items/status/equipment, а не только summary-panels.

